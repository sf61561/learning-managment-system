import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    const { id } = await params;
    const cookiesData = await cookies();
    const token = cookiesData.get('jwt')?.value;

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

    if (!userId) {
        return NextResponse.json({ error: "User identity not found in token" }, { status: 401 });
    }

    try {
        const checkUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/enrolls?filters[student][id][$eq]=${userId}&filters[$or][0][course][id][$eq]=${id}&filters[$or][1][course][documentId][$eq]=${id}`;
        const checkResponse = await fetch(checkUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (checkResponse.ok) {
            const existing = await checkResponse.json();
            if (existing?.data && existing.data.length > 0) {
                return NextResponse.json({
                    message: "Already enrolled in this course",
                    alreadyEnrolled: true,
                    data: existing.data[0]
                }, { status: 200 });
            }
        }

        // Create new enrollment
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/enrolls`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                data: {
                    student: userId,
                    course: id,
                    progress: 0
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Strapi enroll error:", data);
            return NextResponse.json({
                error: data?.error?.message || "Failed to enroll in course"
            }, { status: response.status });
        }

        return NextResponse.json({
            message: "Enrolled successfully",
            alreadyEnrolled: false,
            data
        }, { status: 201 });
    } catch (error) {
        console.error("Error enrolling in course:", error);
        return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 });
    }
}

export async function GET(request, { params }) {
    const { id } = await params;
    const cookiesData = await cookies();
    const token = cookiesData.get('jwt')?.value;

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
        const checkUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/enrolls?filters[student][id][$eq]=${userId}&filters[$or][0][course][id][$eq]=${id}&filters[$or][1][course][documentId][$eq]=${id}&populate=*`;
        const response = await fetch(checkUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return NextResponse.json({ isEnrolled: false }, { status: response.status });
        }

        const data = await response.json();
        const isEnrolled = !!(data?.data && data.data.length > 0);

        return NextResponse.json({
            isEnrolled,
            enrollment: isEnrolled ? data.data[0] : null
        }, { status: 200 });
    } catch (error) {
        console.error("Error checking enrollment:", error);
        return NextResponse.json({ error: "Failed to check enrollment" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { id } = await params;
    const cookiesData = await cookies();
    const token = cookiesData.get('jwt')?.value;

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
        const body = await request.json();
        const { quizId, score, passed, correctCount, totalCount, answers } = body;

        if (!quizId) {
            return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
        }

        // 1. Fetch current student enrollment for this course
        const checkUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/enrolls?filters[student][id][$eq]=${userId}&filters[$or][0][course][id][$eq]=${id}&filters[$or][1][course][documentId][$eq]=${id}&populate=*`;
        const enrollRes = await fetch(checkUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!enrollRes.ok) {
            return NextResponse.json({ error: "Failed to retrieve enrollment" }, { status: enrollRes.status });
        }

        const enrollData = await enrollRes.json();
        const enrollment = enrollData?.data?.[0];

        if (!enrollment) {
            return NextResponse.json({ error: "You must be enrolled in this course to submit a quiz" }, { status: 403 });
        }

        // 2. Parse current progress
        let currentProgress = enrollment.progress;
        if (typeof currentProgress === "string") {
            try {
                currentProgress = JSON.parse(currentProgress);
            } catch {
                currentProgress = {};
            }
        }
        if (typeof currentProgress !== "object" || currentProgress === null) {
            currentProgress = {
                percent: typeof currentProgress === "number" ? currentProgress : 0,
                quiz_attempts: {}
            };
        }
        if (!currentProgress.quiz_attempts) {
            currentProgress.quiz_attempts = {};
        }

        // 3. ENFORCE ONE TIME PER STUDENT: Check if quiz already submitted
        const quizKey = String(quizId);
        if (currentProgress.quiz_attempts[quizKey]) {
            return NextResponse.json({
                error: "You have already completed this quiz. Only one attempt is permitted per student.",
                alreadySubmitted: true,
                attempt: currentProgress.quiz_attempts[quizKey]
            }, { status: 400 });
        }

        // 4. Record the single attempt
        const newAttempt = {
            quizId: quizKey,
            score,
            passed,
            correctCount,
            totalCount,
            answers,
            submittedAt: new Date().toISOString()
        };
        currentProgress.quiz_attempts[quizKey] = newAttempt;

        // 5. Save to Strapi enrollment
        const enrollTargetId = enrollment.documentId || enrollment.id;
        const updateRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/enrolls/${enrollTargetId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                data: {
                    progress: currentProgress
                }
            })
        });

        if (!updateRes.ok) {
            const updateErr = await updateRes.json();
            return NextResponse.json({ error: updateErr?.error?.message || "Failed to save quiz attempt" }, { status: updateRes.status });
        }

        return NextResponse.json({
            message: "Quiz submitted successfully",
            attempt: newAttempt,
            progress: currentProgress
        }, { status: 200 });

    } catch (error) {
        console.error("Error saving quiz attempt:", error);
        return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
    }
}