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

function normalizeOptions(options) {
    if (!options) return [];
    if (typeof options === "string") {
        try {
            options = JSON.parse(options);
        } catch {
            return [];
        }
    }
    if (Array.isArray(options)) {
        return options.map((opt, idx) => {
            const key = String.fromCharCode(65 + idx);
            if (typeof opt === "string") return { key, text: opt };
            if (typeof opt === "object" && opt !== null) {
                return { key: opt.key || key, text: opt.text || opt.value || opt.label || "" };
            }
            return { key, text: String(opt) };
        });
    }
    if (typeof options === "object") {
        return Object.entries(options).map(([key, text]) => ({
            key,
            text: typeof text === "string" ? text : String(text || "")
        }));
    }
    return [];
}

/**
 * POST /api/student/quizzes/[quizId]/submit
 * Server-side grading & one-time attempt enforcement for student quizzes.
 * Creates a QuizAttempt record in Strapi.
 */
export async function POST(request, { params }) {
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
        const body = await request.json().catch(() => ({}));
        const answers = body.answers || {};

        const quizFilter = /^\d+$/.test(quizId) ? "id" : "documentId";

        // 1. Fetch full quiz (including correctAnswer) and its course
        const quizUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/quizzes?filters[${quizFilter}][$eq]=${quizId}&populate=course`;
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

        const quizNumericId = quiz.id;

        // 2. ENFORCE ONE-TIME ATTEMPT: Check if QuizAttempt already exists
        const checkAttemptUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/quiz-attempts?filters[student][id][$eq]=${userId}&filters[$or][0][quiz][id][$eq]=${quiz.id}&filters[$or][1][quiz][documentId][$eq]=${quiz.documentId}`;
        const checkAttemptRes = await fetch(checkAttemptUrl, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });

        if (checkAttemptRes.ok) {
            const checkJson = await checkAttemptRes.json();
            if (checkJson?.data && checkJson.data.length > 0) {
                const existing = checkJson.data[0];
                return NextResponse.json(
                    {
                        error: "You have already completed this quiz. Only one attempt is permitted per student.",
                        alreadySubmitted: true,
                        attempt: existing
                    },
                    { status: 400 }
                );
            }
        }

        // 3. Server-side grading: compare student answers against correctAnswer
        const questions = parseQuestions(quiz.quiz_questions);
        const total = questions.length;
        let correct = 0;
        const correctAnswersList = {};

        questions.forEach((question, index) => {
            const studentAnswer = answers[index];
            const cleanCorrect = (question.correctAnswer || "").trim().toLowerCase();
            correctAnswersList[index] = question.correctAnswer;

            if (!studentAnswer || !cleanCorrect) return;

            const optionsList = normalizeOptions(question.options);
            const chosenOption = optionsList.find(
                (o) => o.key.toLowerCase() === String(studentAnswer).trim().toLowerCase()
            );
            const chosenText = chosenOption ? chosenOption.text.trim().toLowerCase() : "";

            if (
                String(studentAnswer).trim().toLowerCase() === cleanCorrect ||
                (chosenText && chosenText === cleanCorrect)
            ) {
                correct++;
            }
        });

        const score = total > 0 ? Math.round((correct / total) * 100) : 0;
        const passingMark = Number(quiz.passing_mark) || 70;
        const passed = score >= passingMark;

        // 4. Find the student's enrollment for this quiz's course
        const quizDocId = quiz.documentId || quiz.id;
        let enrollDocId = body.enrollId;
        if (!enrollDocId && quiz.course) {
            const courseTarget = quiz.course.documentId || quiz.course.id;
            const courseFilter = /^\d+$/.test(courseTarget) ? "id" : "documentId";
            const enrollCheckUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/enrolls?filters[student][id][$eq]=${userId}&filters[course][${courseFilter}][$eq]=${courseTarget}`;
            const enrollRes = await fetch(enrollCheckUrl, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store"
            });
            if (enrollRes.ok) {
                const enrollJson = await enrollRes.json();
                enrollDocId = enrollJson?.data?.[0]?.documentId || enrollJson?.data?.[0]?.id;
            }
        }

        // 5. Store QuizAttempt in Strapi
        const attemptData = {
            student: userId,
            quiz: quizDocId,
            score,
            correct_answers: correct,
            total_questions: total,
            passed,
            answers,
            submittedAt: new Date().toISOString()
        };

        if (enrollDocId) {
            attemptData.enroll = enrollDocId;
        }

        const createAttemptRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/quiz-attempts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ data: attemptData })
        });

        const attemptResultJson = await createAttemptRes.json();
        const savedAttempt = attemptResultJson?.data || attemptData;

        return NextResponse.json(
            {
                message: "Quiz submitted successfully",
                score,
                correctAnswers: correct,
                totalQuestions: total,
                passed,
                passingMark,
                answers,
                correctAnswersList,
                attempt: savedAttempt
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error submitting quiz:", error);
        return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
    }
}
