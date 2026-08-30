import Link from "next/link";
import HomeNavbar from "@/src/components/HomeNavbar";
import HomeFooter from "@/src/components/HomeFooter";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://learning-managment-system-production-a958.up.railway.app/api";

async function getCourses(search = "", categoryId = "") {
    try {
        let url = `${STRAPI_URL}/courses?populate[thumbnail]=true&populate[category]=true&populate[instructor]=true&populate[lessons]=true&populate[quizes]=true`;

        if (search) {
            url += `&filters[title][$containsi]=${encodeURIComponent(search)}`;
        }
        if (categoryId) {
            const isNum = /^\d+$/.test(categoryId);
            url += isNum
                ? `&filters[category][id][$eq]=${categoryId}`
                : `&filters[category][documentId][$eq]=${categoryId}`;
        }

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return [];
        const json = await res.json();
        return json?.data || [];
    } catch (err) {
        console.error("Error fetching courses:", err);
        return [];
    }
}

async function getCategories() {
    try {
        const res = await fetch(`${STRAPI_URL}/categories`, {
            cache: "no-store"
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json?.data || [];
    } catch (err) {
        console.error("Error fetching categories:", err);
        return [];
    }
}

export default async function PublicCoursesPage({ searchParams }) {
    const params = await searchParams;
    const search = params?.search || "";
    const categoryId = params?.category || "";

    const [courses, categories] = await Promise.all([
        getCourses(search, categoryId),
        getCategories()
    ]);

    const strapiBase = (process.env.NEXT_PUBLIC_STRAPI_URL || "").split("/api")[0];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <HomeNavbar />

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-14 px-6">
                <div className="max-w-7xl mx-auto space-y-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        Explore All Courses
                    </h1>
                    <p className="text-blue-100 text-sm md:text-base max-w-2xl font-normal">
                        Browse our full library of interactive courses. Start learning web development, programming, and core computer science fundamentals.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
                {/* Category Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
                    <Link
                        href="/courses"
                        className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                            !categoryId
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                        All Categories
                    </Link>
                    {categories.map((cat) => {
                        const catId = cat.documentId || cat.id;
                        const isSelected = categoryId === String(cat.id) || categoryId === cat.documentId;
                        return (
                            <Link
                                key={catId}
                                href={`/courses?category=${catId}`}
                                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                                    isSelected
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                }`}
                            >
                                {cat.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Course Grid */}
                {courses.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm">
                        <span className="text-4xl">📚</span>
                        <h3 className="text-base font-bold text-gray-900 mt-2">No Courses Found</h3>
                        <p className="text-gray-500 text-xs mt-1">
                            No courses matched your current filter criteria.
                        </p>
                        <Link
                            href="/courses"
                            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                        >
                            Reset Filters
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => {
                            const courseId = course.documentId || course.id;
                            const imageUrl = course.thumbnail?.url
                                ? `${strapiBase}${course.thumbnail.url}`
                                : null;
                            const lessonsCount = course.lessons?.length || 0;
                            const quizCount = course.quizes?.length || 0;
                            const instructorName =
                                course.instructor?.[0]?.full_name || "Staff Instructor";

                            return (
                                <div
                                    key={courseId}
                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="relative aspect-video bg-gray-900 overflow-hidden">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-900 text-white text-4xl">
                                                    <span>📚</span>
                                                </div>
                                            )}
                                            {course.category?.name && (
                                                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                                                    {course.category.name}
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-6 space-y-3">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-1">
                                                {course.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                                {course.description || "Learn core fundamentals and practical building blocks."}
                                            </p>

                                            <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-gray-500 border-t border-gray-100">
                                                <span>📖 {lessonsCount} {lessonsCount === 1 ? "Lesson" : "Lessons"}</span>
                                                <span>•</span>
                                                <span>📝 {quizCount} {quizCount === 1 ? "Quiz" : "Quizzes"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 pt-0 flex items-center justify-between border-t border-gray-50 mt-4">
                                        <span className="text-xs text-gray-500 font-medium truncate max-w-[130px]">
                                            {instructorName}
                                        </span>
                                        <Link
                                            href={`/courses/${courseId}`}
                                            className="px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold rounded-xl transition"
                                        >
                                            View Course
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <HomeFooter />
        </div>
    );
}
