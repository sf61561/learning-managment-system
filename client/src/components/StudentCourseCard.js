"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentCourseCard({ course, isEnrolled: initialEnrolled = false, onEnrollSuccess }) {
    const router = useRouter();
    const [enrolled, setEnrolled] = useState(initialEnrolled);
    const [enrolling, setEnrolling] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const strapiBase = (process.env.NEXT_PUBLIC_STRAPI_URL || "").split("/api")[0];
    const imageUrl = course?.thumbnail?.url ? `${strapiBase}${course.thumbnail.url}` : null;
    const courseId = course?.documentId || course?.id;

    const handleEnroll = async (e) => {
        e.preventDefault();
        if (enrolled || enrolling) return;

        setEnrolling(true);
        setFeedback(null);

        try {
            const response = await fetch(`/api/student/courses/${courseId}/enroll`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    course: course?.id,
                    progress: 0
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to enroll in course");
            }

            setEnrolled(true);
            setFeedback({ type: "success", message: data.alreadyEnrolled ? "Already enrolled!" : "Enrolled successfully!" });
            if (onEnrollSuccess) {
                onEnrollSuccess(course);
            }
        } catch (error) {
            console.error("Error enrolling in course:", error);
            setFeedback({ type: "error", message: error.message || "Failed to enroll" });
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
                {/* Course Image */}
                <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={course?.title || "Course thumbnail"}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 p-4 text-center">
                            <span className="text-3xl mb-1">🎓</span>
                            <span className="text-sm font-semibold">{course?.category?.name || "Course"}</span>
                        </div>
                    )}
                    {enrolled && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            Enrolled
                        </span>
                    )}
                </div>

                {/* Course Info */}
                <div className="p-5">
                    {course?.category?.name && (
                        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                            {course.category.name}
                        </span>
                    )}
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" title={course?.title}>
                        {course?.title || "Untitled Course"}
                    </h2>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2" title={course?.description}>
                        {course?.description || "No description available."}
                    </p>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="font-medium text-gray-700">Instructor:</span>
                        <span>{course?.instructor?.[0]?.full_name || "Course Instructor"}</span>
                    </div>

                    {/* Feedback message */}
                    {feedback && (
                        <div
                            className={`mt-3 p-2 text-xs rounded-md ${
                                feedback.type === "success"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                        >
                            {feedback.message}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 flex flex-col gap-2">
                <Link
                    href={`/student/courses/${courseId}`}
                    className="block w-full text-center py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition"
                >
                    View Details
                </Link>

                {enrolled ? (
                    <Link
                        href={`/student/courses/enroll`}
                        className="block w-full text-center py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                    >
                        Go to Enrolled
                    </Link>
                ) : (
                    <button
                        className={`w-full py-2 px-3 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                            enrolling
                                ? "bg-green-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 cursor-pointer shadow-sm"
                        }`}
                        onClick={handleEnroll}
                        disabled={enrolling}
                    >
                        {enrolling ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Enrolling...</span>
                            </>
                        ) : (
                            "Enroll Now"
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}