"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PublicBlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = search
                    ? `/api/blog?search=${encodeURIComponent(search)}`
                    : `/api/blog`;
                const res = await fetch(url, { cache: "no-store" });
                if (!res.ok) throw new Error("Failed to load blog posts");

                const json = await res.json();
                setPosts(json?.data || []);
            } catch (err) {
                console.error("Error fetching blogs:", err);
                setError(err.message || "Failed to load blogs");
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchPosts, 300);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header / Hero */}
            <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-16 px-6">
                <div className="max-w-5xl mx-auto text-center space-y-4">
                    <span className="inline-block bg-blue-500/30 text-blue-200 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-blue-400/30">
                        LMS Community & Learning
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                        Articles, Guides & Insights
                    </h1>
                    <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
                        Stay informed with developer insights, course tutorials, career guides, and technical deep-dives.
                    </p>

                    {/* Search bar */}
                    <div className="pt-4 max-w-md mx-auto">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search articles by topic or title..."
                                className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 placeholder-gray-400 rounded-xl text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4 animate-pulse">
                                <div className="h-44 bg-gray-200 rounded-xl" />
                                <div className="h-5 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-100 rounded w-full" />
                                <div className="h-4 bg-gray-100 rounded w-5/6" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-red-200 p-8 max-w-md mx-auto">
                        <span className="text-4xl">⚠️</span>
                        <h3 className="text-lg font-bold text-red-800 mt-2">Error Loading Articles</h3>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8 max-w-lg mx-auto shadow-sm">
                        <span className="text-5xl">✍️</span>
                        <h3 className="text-xl font-bold text-gray-900 mt-3">No Articles Found</h3>
                        <p className="text-gray-500 text-sm mt-1">
                            {search
                                ? `No articles matching "${search}". Try searching for something else.`
                                : "Check back soon for new articles and learning guides."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => {
                            const postSlug = post.slug || post.documentId || post.id;
                            const formattedDate = post.publishedAt
                                ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric"
                                  })
                                : "Draft";

                            const excerpt = post.body
                                ? post.body.replace(/<[^>]*>?/gm, "").slice(0, 130) + "..."
                                : "Read full article...";

                            const authorName =
                                post.author?.full_name || post.author?.username || "LMS Team";

                            return (
                                <article
                                    key={post.id || post.documentId}
                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                                >
                                    {/* Cover Image */}
                                    <Link href={`/blog/${postSlug}`} className="block relative aspect-video overflow-hidden bg-gray-900">
                                        {post.cover_image_url ? (
                                            <img
                                                src={post.cover_image_url}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 text-white text-3xl font-bold">
                                                <span>📝</span>
                                            </div>
                                        )}
                                    </Link>

                                    {/* Content Info */}
                                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                                <span>📅 {formattedDate}</span>
                                            </div>

                                            <Link href={`/blog/${postSlug}`}>
                                                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                                                    {post.title}
                                                </h2>
                                            </Link>

                                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                                {excerpt}
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                                                    {authorName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-xs font-medium text-gray-700">{authorName}</span>
                                            </div>

                                            <Link
                                                href={`/blog/${postSlug}`}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition"
                                            >
                                                <span>Read</span>
                                                <span>→</span>
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
