"use client";

import { useState } from "react";
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

export default function CreateBlogPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [slugManual, setSlugManual] = useState(false);
    const [coverImageUrl, setCoverImageUrl] = useState("");
    const [body, setBody] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setTitle(val);
        if (!slugManual) {
            setSlug(slugify(val));
        }
    };

    const handleSave = async (publish) => {
        if (!title.trim() || !body.trim()) {
            setError("Title and body content are required.");
            return;
        }

        setError(null);
        setSaving(true);

        try {
            const res = await fetch("/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    slug: slug.trim() || slugify(title),
                    body: body.trim(),
                    cover_image_url: coverImageUrl.trim(),
                    publish: !!publish
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to create blog post");
            }

            router.push("/admin/blog");
        } catch (err) {
            console.error("Error creating post:", err);
            setError(err.message || "Failed to create post");
        } finally {
            setSaving(false);
        }
    };

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
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Create New Article</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleSave(false)}
                        className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Draft"}
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleSave(true)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                        <span>🚀</span>
                        <span>Publish Now</span>
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
                        onChange={handleTitleChange}
                        placeholder="e.g. Getting Started with Next.js & Server Components"
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
                            onChange={(e) => {
                                setSlugManual(true);
                                setSlug(slugify(e.target.value));
                            }}
                            placeholder="getting-started-with-nextjs"
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
                        placeholder="https://images.unsplash.com/... or /images/..."
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
                        placeholder="Write your article content here... Markdown and line breaks are fully supported."
                        className="w-full p-4 border border-gray-300 rounded-xl text-sm leading-relaxed text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal"
                    />
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleSave(false)}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition disabled:opacity-50"
                    >
                        Save as Draft
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleSave(true)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                        <span>🚀</span>
                        <span>Publish Article</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
