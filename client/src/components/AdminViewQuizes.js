"use client";

import { useEffect, useState } from "react";

export default function AdminViewQuizes({ courseId }) {
    const [quizes, setQuizes] = useState([]);
    const [openQuiz, setOpenQuiz] = useState(null);

    useEffect(() => {
        const fetchQuizes = async () => {
            try {
                const response = await fetch(
                    `/api/admin/courses/${courseId}/quizes`,
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                setQuizes(data.data.data || []);
            } catch (error) {
                console.error("Error fetching quizes:", error);
            }
        };

        fetchQuizes();
    }, [courseId]);

    const toggleQuiz = (quizId) => {
        setOpenQuiz((prev) =>
            prev === quizId ? null : quizId
        );
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <h2 className="text-2xl font-bold">
                Quizzes
            </h2>

            {quizes.length > 0 ? (
                <div className="w-full flex flex-col gap-3">
                    {quizes.map((quiz) => {
                        const isOpen = openQuiz === quiz.id;

                        return (
                            <div
                                key={quiz.id}
                                className="border border-gray-300 rounded-lg overflow-hidden"
                            >
                                {/* Quiz Header */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleQuiz(quiz.id)
                                    }
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {quiz.title}
                                        </h3>

                                        <p className="text-gray-600 text-sm mt-1">
                                            {quiz.description}
                                        </p>

                                        <p className="text-gray-800 font-semibold text-sm mt-2">
                                            Passing Score:{" "}
                                            {quiz.passing_mark}%
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <span
                                        className={`text-xl transition-transform duration-200 
                                        }`}
                                    >
                                        {isOpen ? "-" : "+"}
                                    </span>
                                </button>

                                {/* Collapsible Questions */}
                                {isOpen && (
                                    <div className="border-t border-gray-300 p-4 bg-gray-50">
                                        <h4 className="font-semibold mb-3">
                                            Questions
                                        </h4>

                                        {quiz.quiz_questions?.length > 0 ? (
                                            <div className="flex flex-col gap-3">
                                                {quiz.quiz_questions.map(
                                                    (question, index) => (
                                                        <div
                                                            key={
                                                                question.id ||
                                                                index
                                                            }
                                                            className="bg-white border border-gray-300 rounded-lg p-4"
                                                        >
                                                            <p className="font-semibold">
                                                                Question{" "}
                                                                {index + 1}
                                                            </p>

                                                            <p className="mt-1">
                                                                {
                                                                    question.question
                                                                }
                                                            </p>

                                                            <div className="mt-3 flex flex-col gap-1">
                                                                <p>
                                                                    <span className="font-medium">
                                                                        A.
                                                                    </span>{" "}
                                                                    {
                                                                        question
                                                                            .options
                                                                            ?.A
                                                                    }
                                                                </p>

                                                                <p>
                                                                    <span className="font-medium">
                                                                        B.
                                                                    </span>{" "}
                                                                    {
                                                                        question
                                                                            .options
                                                                            ?.B
                                                                    }
                                                                </p>

                                                                <p>
                                                                    <span className="font-medium">
                                                                        C.
                                                                    </span>{" "}
                                                                    {
                                                                        question
                                                                            .options
                                                                            ?.C
                                                                    }
                                                                </p>

                                                                <p>
                                                                    <span className="font-medium">
                                                                        D.
                                                                    </span>{" "}
                                                                    {
                                                                        question
                                                                            .options
                                                                            ?.D
                                                                    }
                                                                </p>
                                                            </div>

                                                            <p className="mt-3 text-green-600 font-semibold">
                                                                Correct Answer:{" "}
                                                                {
                                                                    question.correctAnswer
                                                                }
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">
                                                No questions available.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-gray-600">
                    No quizzes available for this course.
                </p>
            )}
        </div>
    );
}