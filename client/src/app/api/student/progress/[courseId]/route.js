import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeJwt } from "jose";

export async function GET(request, { params }) {
    const { courseId } = await params;
    const cookiesData = await cookies();
    const token = cookiesData.get("jwt")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId;
    try {
        const payload = decodeJwt(token);
        userId = payload?.userId || payload?.id;
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    try {
        const courseField = /^\d+$/.test(courseId) ? "id" : "documentId";

        // 1. Fetch student's enrollment with course and lessons
        const enrollUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/enrolls?filters[student][id][$eq]=${userId}&filters[course][${courseField}][$eq]=${courseId}&populate[course][populate]=lessons`;
        const enrollRes = await fetch(enrollUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            cache: "no-store"
        });

        if (!enrollRes.ok) {
            return NextResponse.json({ isEnrolled: false, progress: 0 }, { status: enrollRes.status });
        }

        const enrollJson = await enrollRes.json();
        const enrollment = enrollJson?.data?.[0];

        if (!enrollment) {
            return NextResponse.json({
                isEnrolled: false,
                progress: 0,
                completedLessonIds: [],
                quizAttempts: [],
                totalLessons: 0
            }, { status: 200 });
        }

        const enrollNumericId = enrollment.id;
        const lessons = enrollment?.course?.lessons || [];
        const totalLessons = lessons.length;

        // 2. Fetch completed lesson progress records in parallel with quiz attempts
        const [progressRes, attemptsRes] = await Promise.all([
            fetch(
                `${process.env.NEXT_PUBLIC_STRAPI_URL}/lesson-progresses?filters[student][id][$eq]=${userId}&filters[enroll][id][$eq]=${enrollNumericId}&filters[completed][$eq]=true&populate=lesson`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store"
                }
            ),
            fetch(
                `${process.env.NEXT_PUBLIC_STRAPI_URL}/quiz-attempts?filters[student][id][$eq]=${userId}&filters[enroll][id][$eq]=${enrollNumericId}&populate=quiz`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store"
                }
            )
        ]);

        const progressJson = progressRes.ok ? await progressRes.json() : { data: [] };
        const attemptsJson = attemptsRes.ok ? await attemptsRes.json() : { data: [] };

        const completedLessonIds = (progressJson?.data || [])
            .map((item) => item.lesson?.documentId || item.lesson?.id || item.lesson)
            .filter(Boolean);

        const quizAttempts = attemptsJson?.data || [];

        // 3. Compute percentage
        const completedCount = completedLessonIds.length;
        const progressPercentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

        return NextResponse.json(
            {
                isEnrolled: true,
                enrollmentId: enrollment.documentId || enrollment.id,
                progress: progressPercentage,
                completedLessonIds,
                completedCount,
                totalLessons,
                quizAttempts
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching course progress:", error);
        return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
    }
}
