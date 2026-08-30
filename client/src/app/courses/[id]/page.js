import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeNavbar from "@/src/components/HomeNavbar";
import HomeFooter from "@/src/components/HomeFooter";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337/api";

async function getCourseDetails(id) {
    try {
        const isNumeric = /^\d+$/.test(id);
        const filter = isNumeric ? `filters[id][$eq]=${id}` : `filters[documentId][$eq]=${id}`;
        const url = `${STRAPI_URL}/courses?${filter}&populate[thumbnail]=true&populate[category]=true&populate[instructor]=true&populate[lessons]=true&populate[quizes]=true`;

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data?.[0] || null;
    } catch (err) {
        console.error("Error fetching course details:", err);
        return null;
    }
}

export default async function PublicCourseDetailPage({ params }) {
    const { id } = await params;

    // If student is already logged in, redirect them directly to the active interactive student course page
    const cookiesData = await cookies();
    const token = cookiesData.get("jwt")?.value;

    if (token) {
        redirect(`/student/courses/${id}`);
    }

    const course = await getCourseDetails(id);

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                <HomeNavbar />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md shadow-sm">
                        <span className="text-4xl">⚠️</span>
                        <h2 className="text-xl font-bold text-gray-900 mt-2">Course Not Found</h2>
                        <p className="text-gray-500 text-xs mt-1 mb-6">
                            The course you requested could not be located.
                        </p>
                        <Link
                            href="/courses"
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
                        >
                            ← Browse All Courses
                        </Link>
                    </div>
                </div>
                <HomeFooter />
            </div>
        );
    }

    const strapiBase = (process.env.NEXT_PUBLIC_STRAPI_URL || "").split("/api")[0];
    const imageUrl = course.thumbnail?.url ? `${strapiBase}${course.thumbnail.url}` : null;
    const lessons = course.lessons || [];
    const quizes = course.quizes || [];
    const instructorName = course.instructor?.[0]?.full_name || "Staff Instructor";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <HomeNavbar />

            {/* Course Header Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white py-16 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center gap-2">
                            <Link href="/courses" className="text-xs text-blue-200 hover:text-white transition">
                                Courses
                            </Link>
                            <span className="text-xs text-blue-300">/</span>
                            {course.category?.name && (
                                <span className="text-xs bg-blue-500/30 text-blue-100 font-semibold px-2.5 py-0.5 rounded-full border border-blue-400/30">
                                    {course.category.name}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                            {course.title}
                        </h1>

                        <p className="text-blue-100 text-sm md:text-base leading-relaxed max-w-3xl">
                            {course.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200 pt-2">
                            <span>Instructor: <strong className="text-white">{instructorName}</strong></span>
                            <span>•</span>
                            <span>{lessons.length} Lessons</span>
                            <span>•</span>
                            <span>{quizes.length} Quizzes</span>
                            <span>•</span>
                            <span>100% Free Enrollment</span>
                        </div>
                    </div>

                    {/* Enrollment Card */}
                    <div className="lg:col-span-4 bg-white rounded-2xl p-6 text-gray-900 shadow-2xl border border-white/20 space-y-5">
                        {imageUrl && (
                            <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
                                <img src={imageUrl} alt={course.title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="text-2xl font-black text-gray-900">Free</div>
                            <p className="text-xs text-gray-500">
                                Get instant access to lessons, quizzes, and automated progress tracking.
                            </p>
                        </div>

                        <Link
                            href={`/login?redirect=/student/courses/${id}`}
                            className="block w-full text-center py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition hover:shadow"
                        >
                            Enroll Now — Free
                        </Link>

                        <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                                <span>✓</span>
                                <span>Complete curriculum access</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>✓</span>
                                <span>Interactive quizzes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>✓</span>
                                <span>Lesson completion tracking</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Curriculum Preview Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 w-full space-y-8">
                <div className="max-w-3xl space-y-6">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">Course Curriculum</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            {lessons.length} lessons designed to take you from fundamentals to practical mastery.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {lessons.map((lesson, idx) => (
                            <div
                                key={lesson.id || idx}
                                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                                        {idx + 1}
                                    </span>
                                    <span className="font-semibold text-gray-900 text-sm">{lesson.title}</span>
                                </div>
                                <span className="text-xs text-gray-400 font-mono">Lesson</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <HomeFooter />
        </div>
    );
}
