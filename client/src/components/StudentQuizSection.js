"use client";

import { useState, useEffect } from "react";

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

function SingleQuizCard({
    quiz: initialQuiz,
    quizIndex,
    isEnrolled,
    courseId
}) {
    const quizId = initialQuiz?.id || initialQuiz?.documentId;
    const [quizData, setQuizData] = useState(initialQuiz);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [scoreResult, setScoreResult] = useState(null);
    const [correctAnswersList, setCorrectAnswersList] = useState({});
    const [submitError, setSubmitError] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
    const [loadingQuiz, setLoadingQuiz] = useState(false);

    // Fetch quiz from secure student API (strips correctAnswer from frontend payload)
    // and checks if the current student has already completed this quiz
    useEffect(() => {
        if (!quizId) return;

        const loadQuizAndAttempt = async () => {
            setLoadingQuiz(true);
            try {
                const res = await fetch(`/api/student/quizzes/${quizId}`, { cache: "no-store" });
                if (res.ok) {
                    const json = await res.json();
                    if (json.data) {
                        setQuizData(json.data);
                    }

                    if (json.hasAttempted && json.attempt) {
                        const attempt = json.attempt;
                        setSubmitted(true);
                        setScoreResult({
                            score: attempt.score,
                            correctCount: attempt.correct_answers,
                            totalCount: attempt.total_questions,
                            passed: attempt.passed,
                            passingMark: json.data?.passing_mark || 70
                        });
                        if (attempt.answers) {
                            setSelectedAnswers(attempt.answers);
                        }
                    }
                }
            } catch (err) {
                console.error("Error loading student quiz:", err);
            } finally {
                setLoadingQuiz(false);
            }
        };

        loadQuizAndAttempt();
    }, [quizId]);

    const questions = quizData?.quiz_questions || [];

    const handleOptionSelect = (qIdx, optionKey) => {
        if (submitted || !isEnrolled) return;
        setSelectedAnswers((prev) => ({
            ...prev,
            [qIdx]: optionKey
        }));
    };

    const handleSubmitQuiz = async () => {
        if (submitted || submitting || questions.length === 0) return;
        setSubmitError(null);
        setSubmitting(true);

        try {
            // Server-side grading & record creation in QuizAttempt
            const res = await fetch(`/api/student/quizzes/${quizId}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    answers: selectedAnswers
                })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.alreadySubmitted && data.attempt) {
                    const attempt = data.attempt;
                    setScoreResult({
                        score: attempt.score,
                        correctCount: attempt.correct_answers,
                        totalCount: attempt.total_questions,
                        passed: attempt.passed,
                        passingMark: quizData?.passing_mark || 70
                    });
                    if (attempt.answers) {
                        setSelectedAnswers(attempt.answers);
                    }
                    setSubmitted(true);
                    return;
                }
                throw new Error(data.error || "Failed to submit quiz");
            }

            // Successfully graded by server
            setScoreResult({
                score: data.score,
                correctCount: data.correctAnswers,
                totalCount: data.totalQuestions,
                passed: data.passed,
                passingMark: data.passingMark
            });
            if (data.correctAnswersList) {
                setCorrectAnswersList(data.correctAnswersList);
            }
            setSubmitted(true);
        } catch (err) {
            console.error("Submit quiz error:", err);
            setSubmitError(err.message || "Failed to submit quiz");
        } finally {
            setSubmitting(false);
        }
    };

    const answeredCount = Object.keys(selectedAnswers).length;

    return (
        <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden transition hover:shadow-md">
            {/* Header */}
            <div className="p-5 md:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                Quiz {quizIndex + 1}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900">{quizData?.title}</h3>

                            {submitted && scoreResult && (
                                <span
                                    className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                                        scoreResult.passed
                                            ? "bg-green-100 text-green-800"
                                            : "bg-amber-100 text-amber-800"
                                    }`}
                                >
                                    {scoreResult.passed ? "✓ Passed" : "✗ Completed"} ({scoreResult.score}%)
                                </span>
                            )}
                        </div>

                        {quizData?.description && (
                            <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">{quizData.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-gray-500">
                            <span className="flex items-center gap-1">
                                <span>📋</span>
                                <strong className="text-gray-700">{questions.length}</strong>{" "}
                                {questions.length === 1 ? "Question" : "Questions"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded-md border border-yellow-200">
                                <span>🎯</span>
                                Passing Score: <strong className="ml-0.5">{quizData?.passing_mark || 70}%</strong>
                            </span>
                            <span>•</span>
                            <span className="text-gray-500 italic">1 attempt allowed</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition self-start"
                    >
                        {isOpen ? "Hide Questions" : "Show Questions"}
                    </button>
                </div>
            </div>

            {/* Questions Container */}
            {isOpen && (
                <div className="p-5 md:p-6 space-y-6 bg-gray-50/50">
                    {loadingQuiz ? (
                        <div className="text-center py-6 text-gray-500 text-sm animate-pulse">
                            Loading quiz questions...
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm bg-white rounded-xl border border-gray-200">
                            <p>No questions found in this quiz.</p>
                        </div>
                    ) : (
                        <>
                            {/* Quiz Result Banner (Locked - 1 attempt per student) */}
                            {submitted && scoreResult && (
                                <div
                                    className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                                        scoreResult.passed
                                            ? "bg-green-50 border-green-300 text-green-900"
                                            : "bg-amber-50 border-amber-300 text-amber-900"
                                    }`}
                                >
                                    <div className="space-y-1 text-center sm:text-left">
                                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                                            <span className="text-2xl">{scoreResult.passed ? "🎉" : "📋"}</span>
                                            <h4 className="text-lg font-bold">
                                                {scoreResult.passed ? "Quiz Passed!" : "Quiz Completed"}
                                            </h4>
                                        </div>
                                        <p className="text-sm">
                                            You answered{" "}
                                            <strong>
                                                {scoreResult.correctCount} of {scoreResult.totalCount}
                                            </strong>{" "}
                                            questions correctly (<strong>{scoreResult.score}%</strong>).
                                            Passing score requirement: {scoreResult.passingMark}%.
                                        </p>
                                        <p className="text-xs text-gray-600 font-medium">
                                            🔒 This quiz has been submitted. Each quiz can only be taken once per student.
                                        </p>
                                    </div>
                                    <div className="shrink-0 bg-white px-4 py-2 rounded-xl border border-gray-200 text-center">
                                        <span className="text-xs text-gray-500 block">Final Score</span>
                                        <span className="text-xl font-extrabold text-gray-900">{scoreResult.score}%</span>
                                    </div>
                                </div>
                            )}

                            {submitError && (
                                <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
                                    {submitError}
                                </div>
                            )}

                            {!isEnrolled && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-xs">
                                    ⚠️ You must enroll in this course to take and submit this quiz.
                                </div>
                            )}

                            {/* Questions List */}
                            <div className="space-y-5">
                                {questions.map((q, qIndex) => {
                                    const optionsList = normalizeOptions(q.options);
                                    const chosen = selectedAnswers[qIndex];
                                    const serverCorrect = correctAnswersList[qIndex];

                                    return (
                                        <div
                                            key={q.id || qIndex}
                                            className={`p-5 rounded-xl border bg-white shadow-sm transition ${
                                                submitted
                                                    ? serverCorrect && chosen && serverCorrect.toLowerCase() === chosen.toLowerCase()
                                                        ? "border-green-300 bg-green-50/20"
                                                        : "border-gray-200"
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            {/* Question Title */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-start gap-3">
                                                    <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                                        {qIndex + 1}
                                                    </span>
                                                    <h5 className="font-semibold text-gray-900 text-base leading-snug">
                                                        {q.question}
                                                    </h5>
                                                </div>

                                                {submitted && serverCorrect && (
                                                    <span
                                                        className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                                                            chosen && serverCorrect.toLowerCase() === chosen.toLowerCase()
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {chosen && serverCorrect.toLowerCase() === chosen.toLowerCase()
                                                            ? "✓ Correct"
                                                            : "✗ Incorrect"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Options */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-2">
                                                {optionsList.map(({ key, text }) => {
                                                    const isSelected = chosen === key;
                                                    const isTheServerCorrect =
                                                        serverCorrect && serverCorrect.toLowerCase() === key.toLowerCase();

                                                    let optionStyle = "border-gray-200 bg-white hover:bg-gray-50 text-gray-800";

                                                    if (submitted) {
                                                        if (isTheServerCorrect) {
                                                            optionStyle =
                                                                "border-green-500 bg-green-50 text-green-900 font-semibold ring-1 ring-green-500";
                                                        } else if (isSelected && !isTheServerCorrect) {
                                                            optionStyle =
                                                                "border-red-400 bg-red-50 text-red-900 ring-1 ring-red-400";
                                                        } else {
                                                            optionStyle =
                                                                "border-gray-200 bg-gray-50/50 text-gray-500 opacity-70";
                                                        }
                                                    } else if (isSelected) {
                                                        optionStyle =
                                                            "border-blue-600 bg-blue-50 text-blue-900 font-medium ring-2 ring-blue-500/30";
                                                    }

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={key}
                                                            disabled={submitted || !isEnrolled}
                                                            onClick={() => handleOptionSelect(qIndex, key)}
                                                            className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 text-sm transition ${optionStyle} ${
                                                                !submitted && isEnrolled ? "cursor-pointer" : "cursor-default"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                                                                    isSelected
                                                                        ? "bg-blue-600 text-white"
                                                                        : isTheServerCorrect && submitted
                                                                        ? "bg-green-600 text-white"
                                                                        : "bg-gray-100 text-gray-600"
                                                                }`}
                                                            >
                                                                {key}
                                                            </span>
                                                            <span className="flex-1">{text}</span>
                                                            {submitted && isTheServerCorrect && (
                                                                <span className="text-green-600 font-bold text-xs shrink-0">
                                                                    ✓ Correct
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Submit Section */}
                            {!submitted && isEnrolled && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                                    <div className="text-xs text-gray-500 space-y-0.5">
                                        <p>
                                            Answered {answeredCount} of {questions.length} questions
                                        </p>
                                        <p className="text-amber-700 font-medium">
                                            ⚠️ Notice: Each quiz can only be submitted once. The server grades your answers.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={submitting || answeredCount === 0}
                                        onClick={handleSubmitQuiz}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                                <span>Submitting & Grading...</span>
                                            </>
                                        ) : (
                                            "Submit Quiz"
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default function StudentQuizSection({ quizes, isEnrolled, courseId }) {
    const quizList = Array.isArray(quizes) ? quizes : [];

    if (quizList.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-3xl">📝</span>
                <h3 className="text-base font-bold text-gray-800 mt-2">No Quizzes Available</h3>
                <p className="text-gray-500 text-sm mt-1">There are no quizzes published for this course yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {quizList.map((quiz, index) => (
                <SingleQuizCard
                    key={quiz.id || quiz.documentId || index}
                    quiz={quiz}
                    quizIndex={index}
                    isEnrolled={isEnrolled}
                    courseId={courseId}
                />
            ))}
        </div>
    );
}
