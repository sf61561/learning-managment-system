import Link from "next/link";
import HomeNavbar from "@/src/components/HomeNavbar";
import HomeFooter from "@/src/components/HomeFooter";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://learning-managment-system-production-a958.up.railway.app/api";

async function getCategories() {
    try {
        const res = await fetch(`${STRAPI_URL}/categories?populate=*`, {
            cache: "no-store"
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json?.data || [];
    } catch (err) {
        console.error("Error fetching categories for homepage:", err);
        return [];
    }
}

async function getCourses() {
    try {
        const res = await fetch(
            `${STRAPI_URL}/courses?populate[thumbnail]=true&populate[category]=true&populate[instructor]=true&populate[lessons]=true&populate[quizes]=true&pagination[limit]=6`,
            { cache: "no-store" }
        );
        if (!res.ok) return [];
        const json = await res.json();
        return json?.data || [];
    } catch (err) {
        console.error("Error fetching courses for homepage:", err);
        return [];
    }
}

async function getBlogs() {
    try {
        const res = await fetch(
            `${STRAPI_URL}/blog-posts?populate[author]=true&pagination[limit]=3&sort=publishedAt:desc`,
            { cache: "no-store" }
        );
        if (!res.ok) return [];
        const json = await res.json();
        return json?.data || [];
    } catch (err) {
        console.error("Error fetching blogs for homepage:", err);
        return [];
    }
}

export default async function HomePage() {
    const [categories, courses, blogs] = await Promise.all([
        getCategories(),
        getCourses(),
        getBlogs()
    ]);

    const strapiBase = STRAPI_URL.split("/api")[0];

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
            {/* 1. Navbar */}
            <HomeNavbar />

            {/* 2. Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-gray-50/50 py-20 md:py-28 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold tracking-wide uppercase border border-blue-200">
                        <span>🚀</span>
                        <span>Practical Online Learning Platform</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15]">
                        Learn New Skills. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Build Your Future.
                        </span>
                    </h1>

                    <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto font-normal">
                        Learn practical skills from structured curricula, hands-on interactive lessons, and verified quizzes created by expert educators.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/courses"
                            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition duration-200 text-center"
                        >
                            Explore Courses →
                        </Link>
                        <Link
                            href="/blog"
                            className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-sm rounded-xl shadow-sm transition text-center"
                        >
                            Browse Blog Articles
                        </Link>
                    </div>

                    {/* Trust Badges */}
                    <div className="pt-8 border-t border-gray-200/60 grid grid-cols-3 gap-6 max-w-lg mx-auto text-center">
                        <div>
                            <div className="text-2xl font-black text-blue-600">100%</div>
                            <div className="text-xs text-gray-500 font-medium">Free Access</div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-indigo-600">Active</div>
                            <div className="text-xs text-gray-500 font-medium">Quizzes & Marks</div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-blue-600">Tracked</div>
                            <div className="text-xs text-gray-500 font-medium">Lesson Progress</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Popular Categories Section */}
            <section id="categories" className="py-20 bg-gray-50 border-b border-gray-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                        <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                            Explore Topics
                        </span>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Popular Categories
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Browse structured tracks tailored to help you build in-demand tech skills.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {categories.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-gray-400 text-sm">
                                Categories will appear here once created.
                            </div>
                        ) : (
                            categories.map((cat, idx) => {
                                const icons = ["💻", "🌐", "⚙️", "📱", "📊", "🎨", "☁️", "🛡️"];
                                const icon = icons[idx % icons.length];
                                return (
                                    <Link
                                        key={cat.documentId || cat.id}
                                        href={`/courses?category=${cat.documentId || cat.id}`}
                                        className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition group text-left flex flex-col justify-between"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition duration-300">
                                            {icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-base">
                                                {cat.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {cat.description || "Structured courses and practice tracks."}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>

            {/* 4. Featured Courses Section */}
            <section className="py-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
                        <div className="space-y-2">
                            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                                Top Courses
                            </span>
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                Featured Courses
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Start learning from expertly designed curricula right away.
                            </p>
                        </div>

                        <Link
                            href="/courses"
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 self-start sm:self-auto"
                        >
                            <span>View All Courses</span>
                            <span>→</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-400 text-sm">
                                No courses published yet.
                            </div>
                        ) : (
                            courses.map((course) => {
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
                            })
                        )}
                    </div>
                </div>
            </section>

            {/* 5. How It Works Section */}
            <section id="how-it-works" className="py-20 bg-gray-50/70 border-b border-gray-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                            Simple 3-Step Process
                        </span>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            How It Works
                        </h2>
                        <p className="text-gray-500 text-sm">
                            From finding your next course to taking verified quizzes, learning is straightforward.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative space-y-4">
                            <span className="text-4xl font-black text-blue-100 block">01</span>
                            <h3 className="text-xl font-bold text-gray-900">Browse Courses</h3>
                            <p className="text-gray-600 text-xs leading-relaxed">
                                Find a course that matches your interests and career goals. Explore syllabi, video previews, and lesson breakdown.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative space-y-4">
                            <span className="text-4xl font-black text-indigo-100 block">02</span>
                            <h3 className="text-xl font-bold text-gray-900">Enroll & Complete Lessons</h3>
                            <p className="text-gray-600 text-xs leading-relaxed">
                                Enroll instantly for free. Watch video tutorials, read comprehensive documentation, and click &ldquo;Mark as Complete&rdquo;.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative space-y-4">
                            <span className="text-4xl font-black text-blue-100 block">03</span>
                            <h3 className="text-xl font-bold text-gray-900">Take Verified Quizzes</h3>
                            <p className="text-gray-600 text-xs leading-relaxed">
                                Test your understanding with single-attempt verified quizzes graded securely by our server.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Latest Blogs Section */}
            <section className="py-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
                        <div className="space-y-2">
                            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                                Latest Insights
                            </span>
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                Latest Articles & Guides
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Developer tutorials, technology reviews, and educational articles.
                            </p>
                        </div>

                        <Link
                            href="/blog"
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 self-start sm:self-auto"
                        >
                            <span>View All Blogs</span>
                            <span>→</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {blogs.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-400 text-sm">
                                No articles published yet. Check back soon!
                            </div>
                        ) : (
                            blogs.map((blog) => {
                                const blogSlug = blog.slug || blog.documentId || blog.id;
                                const dateFormatted = blog.publishedAt
                                    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric"
                                      })
                                    : "Recently";

                                return (
                                    <article
                                        key={blog.documentId || blog.id}
                                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                                    >
                                        <Link href={`/blog/${blogSlug}`} className="block aspect-video bg-gray-900 overflow-hidden">
                                            {blog.cover_image_url ? (
                                                <img
                                                    src={blog.cover_image_url}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-700 to-indigo-900 text-white text-3xl">
                                                    <span>✍️</span>
                                                </div>
                                            )}
                                        </Link>

                                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                            <div className="space-y-2">
                                                <span className="text-[11px] font-semibold text-gray-400">
                                                    📅 {dateFormatted}
                                                </span>
                                                <Link href={`/blog/${blogSlug}`}>
                                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-base line-clamp-2">
                                                        {blog.title}
                                                    </h3>
                                                </Link>
                                            </div>

                                            <Link
                                                href={`/blog/${blogSlug}`}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start"
                                            >
                                                <span>Read Article</span>
                                                <span>→</span>
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>

            {/* 7. CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                        Ready to Start Learning?
                    </h2>
                    <p className="text-blue-100 text-sm md:text-base max-w-xl mx-auto font-normal leading-relaxed">
                        Explore our courses and start building your skills today. Track lesson progress and test yourself with quizzes.
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/courses"
                            className="inline-block px-8 py-4 bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-sm rounded-xl shadow-xl transition hover:scale-105 duration-200"
                        >
                            Explore Courses Now →
                        </Link>
                    </div>
                </div>
            </section>

            {/* 8. Footer */}
            <HomeFooter />
        </div>
    );
}
