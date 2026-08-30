"use client";

import Link from "next/link";

export default function EnrollmentCoursesCard({ enrollment, course: propCourse }) {
    const course = enrollment?.course || propCourse || enrollment;
    const progress = typeof enrollment?.progress === "number"
        ? enrollment.progress
        : (typeof enrollment?.progress === "object" && enrollment?.progress !== null
            ? (Number(enrollment.progress.percent) || 0)
            : 0);

    const strapiBase = (process.env.NEXT_PUBLIC_STRAPI_URL || "").split("/api")[0];
    const imageUrl = course?.thumbnail?.url ? `${strapiBase}${course.thumbnail.url}` : null;
    const courseId = course?.documentId || course?.id;

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <div>
                {/* Course Image / Placeholder */}
                <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={course?.title || "Course thumbnail"}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 p-4 text-center">
                            <span className="text-3xl mb-1">📚</span>
                            <span className="text-sm font-semibold">{course?.category?.name || "Course"}</span>
                        </div>
                    )}
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Enrolled
                    </span>
                </div>

                {/* Course Details */}
                <div className="p-5">
                    {course?.category?.name && (
                        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                            {course.category.name}
                        </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={course?.title}>
                        {course?.title || "Untitled Course"}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2" title={course?.description}>
                        {course?.description || "No description provided."}
                    </p>
                    <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                        <span className="font-medium text-gray-700">Instructor:</span>
                        <span>{course?.instructor?.[0]?.full_name || "Assigned Instructor"}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                        <div className="flex justify-between text-xs font-medium text-gray-700">
                            <span>Course Progress</span>
                            <span className="text-blue-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 pt-0">
                <Link
                    href={`/student/courses/${courseId}`}
                    className="block w-full text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 shadow-sm"
                >
                    {progress > 0 ? "Continue Learning" : "Start Learning"}
                </Link>
            </div>
        </div>
    );
}