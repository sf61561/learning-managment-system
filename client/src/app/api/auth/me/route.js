import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookiesData = await cookies();
    const token = cookiesData.get("jwt")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/users/me?populate=role`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch user" }, { status: res.status });
        }

        const user = await res.json();
        return NextResponse.json({ data: user }, { status: 200 });
    } catch (error) {
        console.error("Error fetching current user:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
