import { cookies } from "next/headers";

export async function GET(request) {
    const cookiesData = await cookies();
    const token = cookiesData.get('jwt')?.value;
    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/courses?populate=*`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return new Response(JSON.stringify({ data: data }), { status: 200 });
    }
    catch (error) {
        console.error("Error fetching courses:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch courses" }), { status: 500 });
    }
}