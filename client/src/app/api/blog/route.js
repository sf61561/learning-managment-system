import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeJwt } from "jose";

/**
 * Helper to slugify a string for clean blog URLs
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
 * GET /api/blog
 * Public/Student list of blog posts.
 * By default returns published posts. If ?status=all is requested,
 * requires Admin or Content Manager role to view drafts.
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "published";
    const search = searchParams.get("search") || "";

    const cookiesData = await cookies();
    const token = cookiesData.get("jwt")?.value;

    try {
        let strapiUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/blog-posts?populate[author][fields][0]=full_name&populate[author][fields][1]=username&populate[author][fields][2]=id&sort=createdAt:desc`;

        // If requesting all (including drafts), check that caller has auth token
        if (status === "all") {
            if (!token) {
                return NextResponse.json({ error: "Unauthorized to view draft posts" }, { status: 401 });
            }
            strapiUrl += "&status=draft";
        } else {
            // Public only sees published posts
            strapiUrl += "&filters[publishedAt][$notNull]=true";
        }

        if (search) {
            strapiUrl += `&filters[title][$containsi]=${encodeURIComponent(search)}`;
        }

        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(strapiUrl, {
            method: "GET",
            headers,
            cache: "no-store"
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return NextResponse.json({ error: "Server error fetching blog posts" }, { status: 500 });
    }
}

/**
 * POST /api/blog
 * Create a new blog post.
 * Allowed for: Admin, Content Manager.
 * Automatically assigns author to current user.
 * Supports draft (publishedAt = null) or immediate publish.
 */
export async function POST(request) {
    const cookiesData = await cookies();
    const token = cookiesData.get("jwt")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    try {
        // 1. Identify user and check role
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/users/me?populate=role`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });

        if (!meRes.ok) {
            return NextResponse.json({ error: "Failed to authenticate user" }, { status: 401 });
        }

        const currentUser = await meRes.json();
        const roleType = (currentUser?.role?.type || currentUser?.role?.name || "").toLowerCase().replace(/[\s_-]+/g, "");

        const isAuthorized = roleType === "admin" || roleType === "contentmanager";
        if (!isAuthorized) {
            return NextResponse.json(
                { error: "Forbidden. Only Admins and Content Managers can create blog posts." },
                { status: 403 }
            );
        }

        // 2. Parse request payload
        const body = await request.json();
        const { title, body: contentBody, cover_image_url, publish } = body;

        if (!title || !contentBody) {
            return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
        }

        const finalSlug = body.slug ? slugify(body.slug) : slugify(title);
        const isPublish = !!publish;

        // 3. Prepare data for Strapi (Draft vs Publish in Strapi 5)
        const postData = {
            title: title.trim(),
            slug: finalSlug,
            body: contentBody,
            cover_image_url: cover_image_url || "",
            author: currentUser.documentId || currentUser.id,
            publishedAt: isPublish ? new Date().toISOString() : null
        };

        const createUrl = isPublish
            ? `${process.env.NEXT_PUBLIC_STRAPI_URL}/blog-posts`
            : `${process.env.NEXT_PUBLIC_STRAPI_URL}/blog-posts?status=draft`;

        const createRes = await fetch(createUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ data: postData })
        });

        const resultJson = await createRes.json();

        if (!createRes.ok) {
            return NextResponse.json(
                { error: resultJson?.error?.message || "Failed to create blog post." },
                { status: createRes.status }
            );
        }

        return NextResponse.json(
            {
                message: isPublish ? "Blog post published successfully" : "Blog post saved as draft",
                data: resultJson.data
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating blog post:", error);
        return NextResponse.json({ error: "Server error creating blog post" }, { status: 500 });
    }
}
