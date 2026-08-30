import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;
    const cookiesData = await cookies();
    const token = cookiesData.get('jwt')?.value;
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/enrolls/${id}?populate[course][populate]=*&populate[student][populate]=*`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });
        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json({ error: data?.error?.message || "Failed to fetch enrollment details" }, { status: response.status });
        }
        return NextResponse.json({ data: data?.data }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching enrollment details:", error);
        return NextResponse.json({ error: "Failed to fetch enrollment details" }, { status: 500 });
    }
}