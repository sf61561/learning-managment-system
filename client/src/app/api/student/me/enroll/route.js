import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
    const cookiesData = await cookies();
    const token = cookiesData.get('jwt')?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId;
    try {
        const payload = decodeJwt(token);
        userId = payload?.userId || payload?.id;
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!userId) {
        return NextResponse.json({ error: "User identity not found in token" }, { status: 401 });
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/enrolls?filters[student][id][$eq]=${userId}&populate[course][populate]=*`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errData = await response.json();
            return NextResponse.json({ error: errData?.error?.message || "Failed to fetch enrolled courses" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ data: data?.data || [] }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching enrolled courses:", error);
        return NextResponse.json({ error: "Failed to fetch enrolled courses" }, { status: 500 });
    }
}