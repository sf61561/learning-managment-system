"use client";

import StudentCourseCard from "@/src/components/StudentCourseCard";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [coursesRes, enrollsRes] = await Promise.all([
                fetch('/api/student/courses', { method: 'GET', cache: 'no-store' }),
                fetch('/api/student/me/enroll', { method: 'GET', cache: 'no-store' })
            ]);

            if (coursesRes.ok) {
                const coursesData = await coursesRes.json();
                setCourses(coursesData?.data?.data || []);
            } else {
                throw new Error("Failed to fetch courses");
            }

            if (enrollsRes.ok) {
                const enrollsData = await enrollsRes.json();
                const enrollments = enrollsData?.data || [];
                const ids = new Set();
                enrollments.forEach(e => {
                    if (e.course?.id) ids.add(e.course.id);
                    if (e.course?.documentId) ids.add(e.course.documentId);
                });
                setEnrolledCourseIds(ids);
            }
        } catch (err) {
            console.error("Error fetching courses data:", err);
            setError(err.message || "Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredCourses = courses.filter((course) => {
        const title = course?.title?.toLowerCase() || "";
        const desc = course?.description?.toLowerCase() || "";
        const cat = course?.category?.name?.toLowerCase() || "";
        const term = searchTerm.toLowerCase();
        return title.includes(term) || desc.includes(term) || cat.includes(term);
    });

    const handleEnrollSuccess = (enrolledCourse) => {
        setEnrolledCourseIds((prev) => {
            const updated = new Set(prev);
            if (enrolledCourse?.id) updated.add(enrolledCourse.id);
            if (enrolledCourse?.documentId) updated.add(enrolledCourse.documentId);
            return updated;
        });
    };

    return (
        <div className="w-full flex flex-col p-6 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
                    <p className="text-gray-600 mt-1">Explore all available courses and enroll in what interests you.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/student/courses/enroll"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition duration-200 shadow-sm"
                    >
                        <span>My Enrollments</span>
                        {enrolledCourseIds.size > 0 && (
                            <span className="bg-white text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {enrolledCourseIds.size}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
                <input
                    type="text"
                    placeholder="Search courses by title, category, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-96 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Courses Grid */}
            <div className="mt-6">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse space-y-4">
                                <div className="h-44 bg-gray-200 rounded-lg w-full" />
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-5 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 rounded w-full" />
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
                            onClick={fetchData}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-sm">
                        <div className="text-4xl mb-3">🔍</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Courses Found</h3>
                        <p className="text-gray-500 text-sm">
                            {searchTerm ? `No courses match "${searchTerm}". Try a different search.` : "No courses are currently available."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredCourses.map((course) => {
                            const isEnrolled = enrolledCourseIds.has(course.id) || enrolledCourseIds.has(course.documentId);
                            return (
                                <StudentCourseCard
                                    key={course.id || course.documentId}
                                    course={course}
                                    isEnrolled={isEnrolled}
                                    onEnrollSuccess={handleEnrollSuccess}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}