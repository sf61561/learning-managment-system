"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function slugify(text) {
    return (text || "")
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default function EditBlogPage({ params }) {
    const { id } = use(params);
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [coverImageUrl, setCoverImageUrl] = useState("");
    const [body, setBody] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/blog/${id}`, { cache: "no-store" });
                if (!res.ok) {
                    throw new Error("Failed to load blog post or access denied");
                }
                const json = await res.json();
                const post = json.data;
                if (post) {
                    setTitle(post.title || "");
                    setSlug(post.slug || "");
                    setCoverImageUrl(post.cover_image_url || "");
                    setBody(post.body || "");
                    setIsPublished(!!post.publishedAt);
                }
            } catch (err) {
                console.error("Error loading post:", err);
                setError(err.message || "Failed to load blog post");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleUpdate = async (publishState) => {
        if (!title.trim() || !body.trim()) {
            setError("Title and body content are required.");
            return;
        }

        setError(null);
        setSaving(true);

        try {
            const res = await fetch(`/api/blog/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    slug: slug.trim() || slugify(title),
                    body: body.trim(),
                    cover_image_url: coverImageUrl.trim(),
                    publish: publishState
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to update blog post");
            }

            router.push("/admin/blog");
        } catch (err) {
            console.error("Error updating post:", err);
            setError(err.message || "Failed to update blog post");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col p-6 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="max-w-4xl mx-auto w-full mb-6 flex items-center justify-between">
                <div>
                    <Link
                        href="/admin/blog"
                        className="text-xs font-bold text-gray-500 hover:text-blue-600 transition inline-flex items-center gap-1 mb-2"
                    >
                        <span>←</span>
                        <span>Back to Articles</span>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Edit Article</h1>
                </div>

                <div className="flex items-center gap-3">
                    {isPublished ? (
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => handleUpdate(false)}
                            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 shadow-sm transition disabled:opacity-50"
                        >
                            Unpublish (Draft)
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => handleUpdate(true)}
                            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <span>🚀</span>
                            <span>Publish Now</span>
                        </button>
                    )}

                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleUpdate(isPublished)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="max-w-4xl mx-auto w-full mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-xl">
                    ⚠️ {error}
                </div>
            )}

            {/* Form */}
            <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
                {/* Title */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                        Article Title *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Article title"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                        URL Slug
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">/blog/</span>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(slugify(e.target.value))}
                            placeholder="article-slug"
                            className="flex-1 px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Cover Image URL */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                        Cover Image URL
                    </label>
                    <input
                        type="url"
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {coverImageUrl && (
                        <div className="mt-2 aspect-video max-w-sm rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                            <img
                                src={coverImageUrl}
                                alt="Cover preview"
                                className="w-full h-full object-cover"
                                onError={(e) => (e.target.style.display = "none")}
                            />
                        </div>
                    )}
                </div>

                {/* Body Content */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                            Article Body Content *
                        </label>
                        <span className="text-xs text-gray-400">
                            {body.split(/\s+/).filter(Boolean).length} words
                        </span>
                    </div>
                    <textarea
                        rows={14}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write your article content here..."
                        className="w-full p-4 border border-gray-300 rounded-xl text-sm leading-relaxed text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal"
                    />
                </div>

                {/* Status Indicator */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                        Current Status:{" "}
                        <strong className={isPublished ? "text-green-700" : "text-amber-700"}>
                            {isPublished ? "✓ Published" : "Draft"}
                        </strong>
                    </span>
                    <span className="text-gray-400">ID: {id}</span>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleUpdate(isPublished)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
