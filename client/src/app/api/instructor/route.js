import { cookies } from "next/headers";

export async function GET(request) {
    const cookie = await cookies();
    const jwtToken = cookie.get("jwt")?.value;
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/users?populate=role&filters[role][name][$eq]=Instructor&fields[0]=id&fields[1]=full_name`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`
            }
        });
        if(!response.ok) {
            const errorData = await response.json();
            return new Response(JSON.stringify({ success: false, message: errorData.error.message, status: response.status }));
        }
        const data = await response.json();
        return new Response(JSON.stringify({ success: true, data, status: response.status }));
    }
    catch(error) {
        return new Response(JSON.stringify({ success: false, message: error.message,status: 500 }));
    }
}