import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;
    const cookie = await cookies();
    const jwtToken = cookie.get("jwt")?.value;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/courses/${id}?populate=category&populate=instructor&populate=thumbnail`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwtToken}`
            }
        });
        const data = await response.json();
        return NextResponse.json({
            status: 200,
            data : data
        });
    } catch (error) {
        console.error("Error fetching course details:", error);
        return NextResponse.json({
            status: 500,
            data: { error: "Failed to fetch course details" }
        });
    }
}