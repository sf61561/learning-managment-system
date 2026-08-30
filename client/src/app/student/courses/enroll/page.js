"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EnrollmentCoursesCard from "@/src/components/StudentEnrollmentCoursesCard";

export default function EnrollPage() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEnrollments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/student/me/enroll', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData?.error || "Failed to load enrolled courses");
            }

            const data = await response.json();
            setEnrollments(data?.data || []);
        } catch (err) {
            console.error("Error fetching enrolled courses:", err);
            setError(err.message || "Failed to load enrolled courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    return (
        <div className="w-full flex flex-col p-6 min-h-screen bg-gray-50">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        My Enrolled Courses
                        {!loading && (
                            <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                {enrollments.length} {enrollments.length === 1 ? 'course' : 'courses'}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-600 mt-1">Track your progress and continue learning where you left off.</p>
                </div>
                <div>
                    <Link
                        href="/student/courses"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition duration-200 shadow-sm"
                    >
                        <span>Explore Courses</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Content area */}
            <div className="mt-6">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse space-y-4">
                                <div className="h-44 bg-gray-200 rounded-lg w-full" />
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-5 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 rounded w-full" />
                                <div className="h-2 bg-gray-200 rounded-full w-full" />
                                <div className="h-10 bg-gray-200 rounded-lg w-full" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto">
                        <div className="text-red-500 text-4xl mb-2">⚠️</div>
                        <h3 className="text-lg font-semibold text-red-800 mb-1">Failed to load courses</h3>
                        <p className="text-sm text-red-600 mb-4">{error}</p>
                        <button
                            onClick={fetchEnrollments}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
                        >
                            Try Again
                        </button>
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-sm">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            🎓
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No Enrolled Courses Yet</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            You haven't enrolled in any courses yet. Browse our course catalog and start your learning journey today!
                        </p>
                        <Link
                            href="/student/courses"
                            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                        >
                            Browse Available Courses
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {enrollments.map((enrollment) => (
                            <EnrollmentCoursesCard
                                key={enrollment.id || enrollment.documentId}
                                enrollment={enrollment}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}