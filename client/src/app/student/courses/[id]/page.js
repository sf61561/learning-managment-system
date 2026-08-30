"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import StudentQuizSection from "@/src/components/StudentQuizSection";

export default function StudentCourseDetailsPage({ params }) {
    const { id } = use(params);
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [quizes, setQuizes] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("lessons");
    const [openLessonId, setOpenLessonId] = useState(null);
    const [enrollFeedback, setEnrollFeedback] = useState(null);

    // Lesson completion and progress tracking
    const [completedLessonIds, setCompletedLessonIds] = useState([]);
    const [progressPercent, setProgressPercent] = useState(0);
    const [completingLessonId, setCompletingLessonId] = useState(null);

    useEffect(() => {
        const fetchCourseAndEnrollment = async () => {
            setLoading(true);
            setError(null);
            try {
                const [courseRes, lessonsRes, quizesRes, enrollRes, progressRes] = await Promise.all([
                    fetch(`/api/admin/courses/${id}`, { cache: "no-store" }),
                    fetch(`/api/admin/courses/${id}/lesson`, { cache: "no-store" }),
                    fetch(`/api/admin/courses/${id}/quizes`, { cache: "no-store" }),
                    fetch(`/api/student/courses/${id}/enroll`, { cache: "no-store" }),
                    fetch(`/api/student/progress/${id}`, { cache: "no-store" })
                ]);

                if (!courseRes.ok) {
                    throw new Error("Failed to load course details");
                }

                const courseJson = await courseRes.json();
                setCourse(courseJson?.data?.data || courseJson?.data || null);

                if (lessonsRes.ok) {
                    const lessonsJson = await lessonsRes.json();
                    setLessons(lessonsJson?.data?.data || lessonsJson?.data || []);
                }

                if (quizesRes.ok) {
                    const quizesJson = await quizesRes.json();
                    setQuizes(quizesJson?.data?.data || quizesJson?.data || []);
                }

                if (enrollRes.ok) {
                    const enrollJson = await enrollRes.json();
                    setIsEnrolled(!!enrollJson?.isEnrolled);
                    setEnrollmentData(enrollJson?.enrollment || null);
                }

                if (progressRes.ok) {
                    const progressJson = await progressRes.json();
                    if (progressJson.isEnrolled) {
                        setProgressPercent(progressJson.progress || 0);
                        setCompletedLessonIds(progressJson.completedLessonIds || []);
                    }
                }
            } catch (err) {
                console.error("Error loading course details:", err);
                setError(err.message || "Failed to load course");
            } finally {
                setLoading(false);
            }
        };

        fetchCourseAndEnrollment();
    }, [id]);

    const handleEnroll = async () => {
        if (isEnrolled || enrolling) return;
        setEnrolling(true);
        setEnrollFeedback(null);

        try {
            const courseId = course?.id || id;
            const res = await fetch(`/api/student/courses/${courseId}/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ course: courseId, progress: 0 })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Failed to enroll in course");
            }

            setIsEnrolled(true);
            setEnrollmentData(data.data || null);
            setEnrollFeedback({ type: "success", message: "Enrolled successfully! You now have full access." });
        } catch (err) {
            console.error("Enroll error:", err);
            setEnrollFeedback({ type: "error", message: err.message || "Failed to enroll" });
        } finally {
            setEnrolling(false);
        }
    };

    const handleCompleteLesson = async (lessonId) => {
        if (completingLessonId) return;
        setCompletingLessonId(lessonId);

        try {
            const res = await fetch(`/api/student/lessons/${lessonId}/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: course?.documentId || course?.id || id
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to mark lesson complete");
            }

            // Update completed lessons in state
            setCompletedLessonIds((prev) => {
                const updated = new Set(prev.map(String));
                updated.add(String(lessonId));
                return Array.from(updated);
            });

            if (typeof data.progress === "number") {
                setProgressPercent(data.progress);
            }
        } catch (err) {
            console.error("Error marking lesson complete:", err);
        } finally {
            setCompletingLessonId(null);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
                <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="p-6 max-w-md mx-auto my-12 text-center bg-red-50 border border-red-200 rounded-xl">
                <div className="text-4xl mb-2">⚠️</div>
                <h2 className="text-xl font-bold text-red-800 mb-2">Course Not Found</h2>
                <p className="text-sm text-red-600 mb-4">{error || "Could not load the requested course."}</p>
                <Link href="/student/courses" className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-block">
                    Back to Courses
                </Link>
            </div>
        );
    }

    const strapiBase = (process.env.NEXT_PUBLIC_STRAPI_URL || "").split("/api")[0];
    const imageUrl = course?.thumbnail?.url ? `${strapiBase}${course.thumbnail.url}` : null;
    const allLessons = lessons.length > 0 ? lessons : (course?.lessons || []);
    const allQuizes = quizes.length > 0 ? quizes : (course?.quizes || []);

    return (
        <div className="w-full flex flex-col p-6 min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
                <Link href="/student/courses" className="hover:text-blue-600 transition">Courses</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium truncate max-w-md">{course.title}</span>
            </div>

            {/* Course Header Banner */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-6">
                <div className="relative w-full h-72 bg-gray-900">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={course.title}
                            className="w-full h-full object-cover opacity-85"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-700 to-indigo-900 text-white">
                            <span className="text-5xl">📚</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
                        {course?.category?.name && (
                            <span className="inline-block bg-blue-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit">
                                {course.category.name}
                            </span>
                        )}
                        <h1 className="text-2xl md:text-4xl font-extrabold mb-2">{course.title}</h1>
                        <p className="text-gray-200 text-sm md:text-base line-clamp-2 max-w-3xl mb-3">{course.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-300">
                            {course?.instructor?.[0]?.full_name && (
                                <span>Instructor: <strong className="text-white">{course.instructor[0].full_name}</strong></span>
                            )}
                            <span>•</span>
                            <span>{allLessons.length} {allLessons.length === 1 ? "Lesson" : "Lessons"}</span>
                            <span>•</span>
                            <span>{allQuizes.length} {allQuizes.length === 1 ? "Quiz" : "Quizzes"}</span>
                        </div>
                    </div>
                </div>

                {/* Enrollment status & Progress bar */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {isEnrolled ? (
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Enrolled
                                </span>
                                <span className="text-sm font-bold text-gray-800">{progressPercent}% Complete</span>
                                <span className="text-xs text-gray-500 font-medium">
                                    ({completedLessonIds.length} of {allLessons.length} {allLessons.length === 1 ? "lesson" : "lessons"} completed)
                                </span>
                            </div>
                            <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Enroll to get full access</h4>
                            <p className="text-xs text-gray-500">Access lessons, video tutorials, and interactive quizzes.</p>
                        </div>
                    )}

                    <div>
                        {isEnrolled ? (
                            <Link
                                href="/student/courses/enroll"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition"
                            >
                                <span>My Enrolled Courses</span>
                                <span>→</span>
                            </Link>
                        ) : (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                            >
                                {enrolling ? (
                                    <>
                                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                        <span>Enrolling...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🎓 Enroll Now — Free</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {enrollFeedback && (
                    <div
                        className={`mx-6 mb-6 p-4 rounded-xl text-sm font-medium ${
                            enrollFeedback.type === "success"
                                ? "bg-green-50 border border-green-200 text-green-800"
                                : "bg-red-50 border border-red-200 text-red-800"
                        }`}
                    >
                        {enrollFeedback.message}
                    </div>
                )}
            </div>

            {/* Course Content Tabs */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-4 px-6 text-sm font-bold transition flex items-center justify-center gap-2 border-b-2 ${
                            activeTab === "lessons"
                                ? "border-blue-600 text-blue-600 bg-blue-50/40"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setActiveTab("lessons")}
                    >
                        <span>📖 Lessons</span>
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{allLessons.length}</span>
                    </button>
                    <button
                        className={`flex-1 py-4 px-6 text-sm font-bold transition flex items-center justify-center gap-2 border-b-2 ${
                            activeTab === "quizes"
                                ? "border-blue-600 text-blue-600 bg-blue-50/40"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setActiveTab("quizes")}
                    >
                        <span>📝 Quizzes</span>
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{allQuizes.length}</span>
                    </button>
                </div>

                <div className="p-6">
                    {/* Lessons Tab */}
                    {activeTab === "lessons" && (
                        <div>
                            {allLessons.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-8">No lessons available for this course yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {allLessons.map((lesson, idx) => {
                                        const isOpen = openLessonId === lesson.id;
                                        const isCompleted =
                                            completedLessonIds.includes(lesson.id) ||
                                            completedLessonIds.includes(lesson.documentId) ||
                                            completedLessonIds.includes(String(lesson.id)) ||
                                            completedLessonIds.includes(String(lesson.documentId));

                                        return (
                                            <div
                                                key={lesson.id}
                                                className={`border rounded-xl overflow-hidden transition ${
                                                    isCompleted ? "border-green-200 bg-green-50/10" : "border-gray-200"
                                                }`}
                                            >
                                                <button
                                                    onClick={() => setOpenLessonId(isOpen ? null : lesson.id)}
                                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                                                isCompleted
                                                                    ? "bg-green-500 text-white"
                                                                    : "bg-blue-100 text-blue-700"
                                                            }`}
                                                        >
                                                            {isCompleted ? "✓" : idx + 1}
                                                        </span>
                                                        <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                                                        {isCompleted && (
                                                            <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-md">
                                                                Completed
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-lg font-mono text-gray-500">{isOpen ? "−" : "+"}</span>
                                                </button>

                                                {isOpen && (
                                                    <div className="p-5 bg-white border-t border-gray-100 space-y-4">
                                                        {lesson.content && (
                                                            <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                                                                {lesson.content}
                                                            </p>
                                                        )}
                                                        {lesson.video_url && (
                                                            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                                                                <iframe
                                                                    className="w-full h-full"
                                                                    src={lesson.video_url}
                                                                    title={lesson.title}
                                                                    allowFullScreen
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Lesson Completion Action Button */}
                                                        {isEnrolled && (
                                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                                <span className="text-xs text-gray-500 font-medium">
                                                                    {isCompleted ? "You completed this lesson." : "Mark complete when finished."}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    disabled={isCompleted || completingLessonId === lesson.id}
                                                                    onClick={() => handleCompleteLesson(lesson.id || lesson.documentId)}
                                                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                                                                        isCompleted
                                                                            ? "bg-green-100 text-green-800 cursor-default"
                                                                            : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
                                                                    }`}
                                                                >
                                                                    {completingLessonId === lesson.id ? (
                                                                        <>
                                                                            <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                                                                            <span>Saving...</span>
                                                                        </>
                                                                    ) : isCompleted ? (
                                                                        <span>✓ Completed</span>
                                                                    ) : (
                                                                        <span>Mark as Complete</span>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quizzes Tab */}
                    {activeTab === "quizes" && (
                        <StudentQuizSection
                            quizes={allQuizes}
                            isEnrolled={isEnrolled}
                            courseId={id}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
