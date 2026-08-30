import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;
    const cookie = await cookies();
    const jwtToken = cookie.get("jwt")?.value;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/users/${id}?populate=role`, {
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
        console.error('Error fetching user:', error);
        return NextResponse.json({
            status: 500,
            data : { error: 'Internal Server Error' }
        });
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const cookieStore = await cookies();
        const jwt = cookieStore.get("jwt")?.value;

        if (!jwt) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/users/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                    full_name: body.full_name,
                    username: body.username,
                    email: body.email,
                    role: body.role_id,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || "Failed to update user" },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Update user error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}