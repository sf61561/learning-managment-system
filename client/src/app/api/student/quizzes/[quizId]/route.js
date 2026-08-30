import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeJwt } from "jose";

function parseQuestions(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

/**
 * GET /api/student/quizzes/[quizId]
 * Returns quiz details with questions stripped of correctAnswer (security requirement).
 * Also returns the student's existing QuizAttempt if already taken.
 */
export async function GET(request, { params }) {
    const { quizId } = await params;
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
        const quizFilter = /^\d+$/.test(quizId) ? "id" : "documentId";

        // 1. Fetch quiz from Strapi
        const quizUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/quizzes?filters[${quizFilter}][$eq]=${quizId}`;
        const quizRes = await fetch(quizUrl, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });

        if (!quizRes.ok) {
            return NextResponse.json({ error: "Failed to fetch quiz" }, { status: quizRes.status });
        }

        const quizJson = await quizRes.json();
        const quiz = quizJson?.data?.[0];

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        // 2. Check for existing QuizAttempt by this student (one attempt allowed)
        const attemptUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/quiz-attempts?filters[student][id][$eq]=${userId}&filters[$or][0][quiz][id][$eq]=${quiz.id}&filters[$or][1][quiz][documentId][$eq]=${quiz.documentId}`;
        const attemptRes = await fetch(attemptUrl, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });

        let existingAttempt = null;
        if (attemptRes.ok) {
            const attemptJson = await attemptRes.json();
            existingAttempt = attemptJson?.data?.[0] || null;
        }

        // 3. Security: Sanitize questions by removing correctAnswer before sending to browser
        const rawQuestions = parseQuestions(quiz.quiz_questions);
        const sanitizedQuestions = rawQuestions.map((q, idx) => {
            let sanitizedOptions = q.options;
            if (typeof sanitizedOptions === "string") {
                try {
                    sanitizedOptions = JSON.parse(sanitizedOptions);
                } catch {
                    sanitizedOptions = {};
                }
            }

            return {
                id: q.id || idx,
                question: q.question,
                options: sanitizedOptions
            };
        });

        return NextResponse.json(
            {
                data: {
                    id: quiz.id,
                    documentId: quiz.documentId,
                    title: quiz.title,
                    description: quiz.description,
                    passing_mark: quiz.passing_mark,
                    quiz_questions: sanitizedQuestions
                },
                hasAttempted: !!existingAttempt,
                attempt: existingAttempt
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching quiz:", error);
        return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
    }
}
