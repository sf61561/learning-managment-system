"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminBlogManagementPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [filter, setFilter] = useState("all"); // 'all' | 'published' | 'draft'
    const [search, setSearch] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const fetchPostsAndUser = async () => {
        setLoading(true);
        try {
            // 1. Fetch current user to know their role and ID
            const userRes = await fetch("/api/auth/me", { cache: "no-store" }).catch(() => null);
            let user = null;
            if (userRes && userRes.ok) {
                const userJson = await userRes.json();
                user = userJson.data || userJson;
                setCurrentUser(user);
            }

            // 2. Fetch all blog posts (including drafts)
            const res = await fetch("/api/blog?status=all", { cache: "no-store" });
            if (res.ok) {
                const json = await res.json();
                setPosts(json.data || []);
            }
        } catch (err) {
            console.error("Error loading blog posts:", err);
            setFeedback({ type: "error", message: "Failed to load blog posts" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostsAndUser();
    }, []);

    const userRole = (currentUser?.role?.type || currentUser?.role?.name || "").toLowerCase().replace(/[\s_-]+/g, "");
    const isAdmin = userRole === "admin";

    // Checks if current user can edit/delete this post
    const canManagePost = (post) => {
        if (isAdmin) return true;
        const authorId = post.author?.id;
        const authorDocId = post.author?.documentId;
        return (
            (authorId && currentUser?.id && String(authorId) === String(currentUser.id)) ||
            (authorDocId && currentUser?.documentId && authorDocId === currentUser.documentId)
        );
    };

    const handleTogglePublish = async (post) => {
        const targetId = post.documentId || post.id;
        const willPublish = !post.publishedAt;
        setActionLoadingId(targetId);
        setFeedback(null);

        try {
            const res = await fetch(`/api/blog/${targetId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publish: willPublish })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to update publish status");
            }

            setFeedback({
                type: "success",
                message: willPublish ? "Post published successfully!" : "Post moved to drafts."
            });
            fetchPostsAndUser();
        } catch (err) {
            setFeedback({ type: "error", message: err.message });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDeletePost = async (post) => {
        if (!confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
            return;
        }

        const targetId = post.documentId || post.id;
        setActionLoadingId(targetId);
        setFeedback(null);

        try {
            const res = await fetch(`/api/blog/${targetId}`, {
                method: "DELETE"
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to delete post");
            }

            setFeedback({ type: "success", message: "Blog post deleted successfully." });
            setPosts((prev) => prev.filter((p) => (p.documentId || p.id) !== targetId));
        } catch (err) {
            setFeedback({ type: "error", message: err.message });
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredPosts = posts.filter((post) => {
        if (filter === "published" && !post.publishedAt) return false;
        if (filter === "draft" && post.publishedAt) return false;
        if (search) {
            const term = search.toLowerCase();
            return (
                post.title.toLowerCase().includes(term) ||
                (post.author?.full_name || "").toLowerCase().includes(term)
            );
        }
        return true;
    });

    return (
        <div className="w-full flex flex-col p-6 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Blog Management</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Create, draft, publish, and manage LMS blog articles and technical guides.
                    </p>
                </div>

                <Link
                    href="/admin/blog/create"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition inline-flex items-center gap-2 self-start sm:self-auto"
                >
                    <span>+</span>
                    <span>Write New Article</span>
                </Link>
            </div>

            {/* Feedback Alert */}
            {feedback && (
                <div
                    className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center justify-between ${
                        feedback.type === "success"
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-red-50 border-red-200 text-red-800"
                    }`}
                >
                    <span>{feedback.message}</span>
                    <button onClick={() => setFeedback(null)} className="text-xs font-bold px-2">✕</button>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-2">
                    {["all", "published", "draft"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                                filter === tab
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {tab === "all" ? "All Articles" : tab === "published" ? "Published" : "Drafts"}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search articles..."
                        className="w-full pl-3.5 pr-4 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 text-sm animate-pulse">
                        Loading blog posts...
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="text-4xl">📝</span>
                        <h3 className="text-base font-bold text-gray-800 mt-2">No Articles Found</h3>
                        <p className="text-gray-500 text-xs mt-1">
                            {search
                                ? "No articles matched your search."
                                : "Click 'Write New Article' to create your first draft."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Title & Slug</th>
                                    <th className="px-6 py-4">Author</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPosts.map((post) => {
                                    const targetId = post.documentId || post.id;
                                    const isPublished = !!post.publishedAt;
                                    const isOwnerOrAdmin = canManagePost(post);
                                    const authorName = post.author?.full_name || post.author?.username || "Unknown";

                                    return (
                                        <tr key={targetId} className="hover:bg-gray-50/70 transition">
                                            <td className="px-6 py-4">
                                                <div className="space-y-0.5">
                                                    <span className="font-bold text-gray-900 line-clamp-1">
                                                        {post.title}
                                                    </span>
                                                    <span className="text-xs font-mono text-gray-400 block">
                                                        /blog/{post.slug || targetId}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 text-xs font-medium">
                                                {authorName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        isPublished
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-amber-100 text-amber-800"
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            isPublished ? "bg-green-500" : "bg-amber-500"
                                                        }`}
                                                    />
                                                    {isPublished ? "Published" : "Draft"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {post.publishedAt
                                                    ? new Date(post.publishedAt).toLocaleDateString()
                                                    : new Date(post.createdAt).toLocaleDateString() + " (created)"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* View live public link */}
                                                    {isPublished && (
                                                        <Link
                                                            href={`/blog/${post.slug || targetId}`}
                                                            target="_blank"
                                                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition"
                                                        >
                                                            View ↗
                                                        </Link>
                                                    )}

                                                    {/* Quick Publish / Unpublish Toggle */}
                                                    {isOwnerOrAdmin && (
                                                        <button
                                                            disabled={actionLoadingId === targetId}
                                                            onClick={() => handleTogglePublish(post)}
                                                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                                                                isPublished
                                                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-800"
                                                                    : "bg-green-50 hover:bg-green-100 text-green-800"
                                                            }`}
                                                        >
                                                            {actionLoadingId === targetId
                                                                ? "..."
                                                                : isPublished
                                                                ? "Unpublish"
                                                                : "Publish"}
                                                        </button>
                                                    )}

                                                    {/* Edit */}
                                                    {isOwnerOrAdmin ? (
                                                        <Link
                                                            href={`/admin/blog/${targetId}/edit`}
                                                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition"
                                                        >
                                                            Edit
                                                        </Link>
                                                    ) : (
                                                        <span
                                                            title="Only the author or admin can edit this post"
                                                            className="px-2.5 py-1 bg-gray-100 text-gray-400 text-xs rounded-lg cursor-not-allowed"
                                                        >
                                                            Edit
                                                        </span>
                                                    )}

                                                    {/* Delete */}
                                                    {isOwnerOrAdmin && (
                                                        <button
                                                            disabled={actionLoadingId === targetId}
                                                            onClick={() => handleDeletePost(post)}
                                                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}