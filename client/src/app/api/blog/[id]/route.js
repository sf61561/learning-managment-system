import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Helper to slugify a string
 */
function slugify(text) {
    return (text || "")
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Helper to fetch a blog post by id, documentId, or slug.
 * If token is present, includes drafts. Otherwise only published.
 */
async function fetchPost(idOrSlug, token) {
    const isNumeric = /^\d+$/.test(idOrSlug);
    let url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/blog-posts?populate[author][fields][0]=id&populate[author][fields][1]=username&populate[author][fields][2]=full_name&populate[author][fields][3]=documentId`;

    if (token) {
        url += "&status=draft";
    } else {
        url += "&filters[publishedAt][$notNull]=true";
    }

    if (isNumeric) {
        url += `&filters[id][$eq]=${idOrSlug}`;
    } else {
        url += `&filters[$or][0][documentId][$eq]=${idOrSlug}&filters[$or][1][slug][$eq]=${idOrSlug}`;
    }

    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return null;

    const json = await res.json();
    return json?.data?.[0] || null;
}

/**
 * GET /api/blog/[id]
 * Fetch single blog post by numeric id, documentId, or slug.
 */
export async function GET(request, { params }) {
    const { id } = await params;
    const cookiesData = await cookies();
    const token = cookiesData.get("jwt")?.value;

    try {
        const post = await fetchPost(id, token);

        if (!post) {
            return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
        }

        // If post is a draft (publishedAt is null), only allow authenticated user
        if (!post.publishedAt && !token) {
            return NextResponse.json({ error: "This post is a draft and requires authorization" }, { status: 403 });
        }

        return NextResponse.json({ data: post }, { status: 200 });
    } catch (error) {
        console.error("Error fetching blog post:", error);
        return NextResponse.json({ error: "Server error fetching blog post" }, { status: 500 });
    }
}

/**
 * PUT /api/blog/[id]
 * Update a blog post or change publish status.
 *
 * CRITICAL SECURITY CHECK (Rule #10 & #11):
 * - Admin: can update any blog post.
 * - Content Manager: can ONLY update their own blog post (author.id === currentUser.id).
 * - Others: 403 Forbidden.
 */
export async function PUT(request, { params }) {
    const { id } = await params;
    const cookiesData = await cookies();
    const token = cookiesData.get("jwt")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    try {
        // 1. Get current logged-in user and their role
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/users/me?populate=role`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });

        if (!meRes.ok) {
            return NextResponse.json({ error: "Failed to authenticate user" }, { status: 401 });
        }

        const currentUser = await meRes.json();
        const roleType = (currentUser?.role?.type || currentUser?.role?.name || "").toLowerCase().replace(/[\s_-]+/g, "");
        const isAdmin = roleType === "admin";
        const isContentManager = roleType === "contentmanager";

        if (!isAdmin && !isContentManager) {
            return NextResponse.json(
                { error: "Forbidden. You do not have permission to edit blog posts." },
                { status: 403 }
            );
        }

        // 2. Fetch existing blog post from Strapi
        const existingPost = await fetchPost(id, token);
        if (!existingPost) {
            return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
        }

        // 3. ENFORCE OWNERSHIP CHECK
        const authorId = existingPost?.author?.id;
        const authorDocId = existingPost?.author?.documentId;
        const isAuthor =
            (authorId && String(authorId) === String(currentUser.id)) ||
            (authorDocId && currentUser.documentId && authorDocId === currentUser.documentId);

        if (!isAdmin && !isAuthor) {
            return NextResponse.json(
                { error: "Forbidden. Content Managers can only edit their own blog posts." },
                { status: 403 }
            );
        }

        // 4. Prepare update data
        const body = await request.json();
        const updateData = {};

        if (body.title !== undefined) updateData.title = body.title.trim();
        if (body.slug !== undefined) updateData.slug = slugify(body.slug || body.title);
        if (body.body !== undefined) updateData.body = body.body;
        if (body.cover_image_url !== undefined) updateData.cover_image_url = body.cover_image_url;

        // Publish or unpublish toggle
        let updateUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/blog-posts/${existingPost.documentId || existingPost.id}`;

        if (body.publish === true) {
            updateData.publishedAt = new Date().toISOString();
        } else if (body.publish === false) {
            updateData.publishedAt = null;
            updateUrl += "?status=draft";
        }

        const updateRes = await fetch(updateUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ data: updateData })
        });

        const updateJson = await updateRes.json();

        if (!updateRes.ok) {
            return NextResponse.json(
                { error: updateJson?.error?.message || "Failed to update blog post" },
                { status: updateRes.status }
            );
        }

        return NextResponse.json(
            {
                message: "Blog post updated successfully",
                data: updateJson.data
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating blog post:", error);
        return NextResponse.json({ error: "Server error updating blog post" }, { status: 500 });
    }
}

/**
 * DELETE /api/blog/[id]
 * Delete a blog post.
 *
 * CRITICAL SECURITY CHECK (Rule #10 & #11):
 * - Admin: can delete any blog post.
 * - Content Manager: can ONLY delete their own blog post.
 * - Others: 403 Forbidden.
 */
export async function DELETE(request, { params }) {
    const { id } = await params;
    const cookiesData = await cookies();
    const token = cookiesData.get("jwt")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    try {
        // 1. Get current logged-in user
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/users/me?populate=role`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });

        if (!meRes.ok) {
            return NextResponse.json({ error: "Failed to authenticate user" }, { status: 401 });
        }

        const currentUser = await meRes.json();
        const roleType = (currentUser?.role?.type || currentUser?.role?.name || "").toLowerCase().replace(/[\s_-]+/g, "");
        const isAdmin = roleType === "admin";
        const isContentManager = roleType === "contentmanager";

        if (!isAdmin && !isContentManager) {
            return NextResponse.json(
                { error: "Forbidden. You do not have permission to delete blog posts." },
                { status: 403 }
            );
        }

        // 2. Fetch existing blog post
        const existingPost = await fetchPost(id, token);
        if (!existingPost) {
            return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
        }

        // 3. Enforce ownership check
        const authorId = existingPost?.author?.id;
        const authorDocId = existingPost?.author?.documentId;
        const isAuthor =
            (authorId && String(authorId) === String(currentUser.id)) ||
            (authorDocId && currentUser.documentId && authorDocId === currentUser.documentId);

        if (!isAdmin && !isAuthor) {
            return NextResponse.json(
                { error: "Forbidden. Content Managers can only delete their own blog posts." },
                { status: 403 }
            );
        }

        // 4. Delete in Strapi
        const targetDocId = existingPost.documentId || existingPost.id;
        const delRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/blog-posts/${targetDocId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!delRes.ok) {
            return NextResponse.json({ error: "Failed to delete blog post from Strapi" }, { status: delRes.status });
        }

        return NextResponse.json({ message: "Blog post deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting blog post:", error);
        return NextResponse.json({ error: "Server error deleting blog post" }, { status: 500 });
    }
}
