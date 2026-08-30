"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

export default function BlogDetailsPage({ params }) {
    const { slug } = use(params);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/blog/${slug}`, { cache: "no-store" });
                if (!res.ok) {
                    throw new Error(res.status === 404 ? "Article not found" : "Failed to load article");
                }
                const json = await res.json();
                setPost(json.data);
            } catch (err) {
                console.error("Error loading blog details:", err);
                setError(err.message || "Failed to load article");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-16 space-y-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-24" />
                <div className="h-10 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-72 bg-gray-200 rounded-2xl" />
                <div className="space-y-3 pt-6">
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-5/6" />
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md shadow-sm">
                    <span className="text-4xl">⚠️</span>
                    <h2 className="text-xl font-bold text-gray-900 mt-2">Article Not Found</h2>
                    <p className="text-gray-500 text-sm mt-1 mb-6">
                        {error || "The article you are looking for does not exist or may be a draft."}
                    </p>
                    <Link
                        href="/blog"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
                    >
                        ← Back to All Articles
                    </Link>
                </div>
            </div>
        );
    }

    const formattedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
          })
        : "Draft (Unpublished)";

    const authorName = post.author?.full_name || post.author?.username || "LMS Team";

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            <article className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Back button */}
                <div className="p-6 md:p-8 pb-0">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition"
                    >
                        <span>←</span>
                        <span>Back to All Articles</span>
                    </Link>
                </div>

                {/* Article Header */}
                <div className="p-6 md:p-8 space-y-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-3 pt-2 border-b border-gray-100 pb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center">
                            {authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{authorName}</p>
                            <p className="text-xs text-gray-500">{formattedDate}</p>
                        </div>
                    </div>
                </div>

                {/* Cover Image */}
                {post.cover_image_url && (
                    <div className="px-6 md:px-8">
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-inner">
                            <img
                                src={post.cover_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* Article Body */}
                <div className="p-6 md:p-8 pt-6">
                    <div className="prose prose-blue max-w-none text-gray-800 text-base leading-relaxed whitespace-pre-line space-y-4 font-normal">
                        {post.body}
                    </div>

                    {/* Bottom Back Button */}
                    <div className="pt-10 mt-10 border-t border-gray-100 flex items-center justify-between">
                        <Link
                            href="/blog"
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
                        >
                            ← Back to Articles
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
