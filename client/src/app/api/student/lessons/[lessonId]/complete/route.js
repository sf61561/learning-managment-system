import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeJwt } from "jose";

/**
 * POST /api/student/lessons/[lessonId]/complete
 * Marks a lesson as completed for the authenticated student.
 * Creates a LessonProgress record and recalculates course progress.
 */
export async function POST(request, { params }) {
    const { lessonId } = await params;
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
        const body = await request.json().catch(() => ({}));
        let courseId = body.courseId;

        // 1. Resolve lesson documentId and courseId if needed
        const lessonFilter = /^\d+$/.test(lessonId) ? "id" : "documentId";
        const lessonRes = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/lessons?filters[${lessonFilter}][$eq]=${lessonId}&populate=course`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store"
            }
        );

        let lessonDocId = lessonId;
        let lessonNumericId = /^\d+$/.test(lessonId) ? Number(lessonId) : null;

        if (lessonRes.ok) {
            const lessonJson = await lessonRes.json();
            const lessonData = lessonJson?.data?.[0];
            if (lessonData) {
                lessonDocId = lessonData.documentId || lessonDocId;
                lessonNumericId = lessonData.id || lessonNumericId;
                if (!courseId && lessonData.course) {
                    courseId = lessonData.course.documentId || lessonData.course.id;
                }
            }
        }

        if (!courseId) {
            return NextResponse.json({ error: "Course ID could not be determined" }, { status: 400 });
        }

        // 2. Find the student's enrollment and full course lesson list
        const courseFilter = /^\d+$/.test(courseId) ? "id" : "documentId";
        const enrollUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/enrolls?filters[student][id][$eq]=${userId}&filters[course][${courseFilter}][$eq]=${courseId}&populate[course][populate]=lessons`;

        const enrollRes = await fetch(enrollUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            cache: "no-store"
        });

        if (!enrollRes.ok) {
            return NextResponse.json({ error: "Failed to verify enrollment" }, { status: enrollRes.status });
        }

        const enrollJson = await enrollRes.json();
        const enrollment = enrollJson?.data?.[0];

        if (!enrollment) {
            return NextResponse.json(
                { error: "You must be enrolled in this course to mark lessons complete" },
                { status: 403 }
            );
        }

        const course = enrollment.course;
        const totalLessons = Array.isArray(course?.lessons) && course.lessons.length > 0 ? course.lessons.length : 1;
        const enrollDocId = enrollment.documentId || enrollment.id;

        // 3. Check if LessonProgress already exists (prevent duplicate records)
        const checkProgressUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/lesson-progresses?filters[student][id][$eq]=${userId}&filters[lesson][documentId][$eq]=${lessonDocId}`;
        const existingRes = await fetch(checkProgressUrl, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });

        let progressRecord = null;
        if (existingRes.ok) {
            const existingJson = await existingRes.json();
            progressRecord = existingJson?.data?.[0] || null;
        }

        // 4. Create LessonProgress if not already present
        if (!progressRecord) {
            const createRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/lesson-progresses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: {
                        completed: true,
                        completedAt: new Date().toISOString(),
                        student: userId,
                        lesson: lessonDocId,
                        enroll: enrollDocId
                    }
                })
            });

            if (createRes.ok) {
                const createdJson = await createRes.json();
                progressRecord = createdJson?.data;
            }
        }

        // 5. Calculate actual progress percentage from completed LessonProgress records for this course's lessons
        const allProgressRes = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/lesson-progresses?filters[student][id][$eq]=${userId}&filters[completed][$eq]=true&populate=lesson`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store"
            }
        );

        let completedCount = 1;
        if (allProgressRes.ok) {
            const allProgressJson = await allProgressRes.json();
            const courseLessonDocIds = new Set((course?.lessons || []).map((l) => l.documentId || l.id));
            const completedInCourse = (allProgressJson?.data || []).filter((lp) => {
                const lpDocId = lp.lesson?.documentId || lp.lesson?.id;
                return courseLessonDocIds.has(lpDocId);
            });
            completedCount = Math.max(1, completedInCourse.length);
        }

        const calculatedProgress = Math.min(100, Math.round((completedCount / totalLessons) * 100));

        // 6. Update cached progress on the Enrollment record
        await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/enrolls/${enrollDocId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                data: {
                    progress: calculatedProgress
                }
            })
        });

        return NextResponse.json(
            {
                message: "Lesson marked as complete",
                completed: true,
                progress: calculatedProgress,
                completedLessons: completedCount,
                totalLessons,
                lessonId: lessonDocId
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error completing lesson:", error);
        return NextResponse.json({ error: "Failed to mark lesson complete" }, { status: 500 });
    }
}
