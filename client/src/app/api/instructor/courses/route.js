import { cookies } from "next/headers";
import { decodeJwt } from "jose";

export async function POST(request) {
    const cookie = await cookies();
    let courseData = await request.json();
    console.log(courseData);
    const jwtToken = cookie.get("jwt")?.value;
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/courses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`
            },
            body: JSON.stringify(courseData)
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

export async function GET(request) {
    const cookie = await cookies();
    const jwtToken = cookie.get("jwt")?.value;
    const payload = decodeJwt(jwtToken);
    console.log("JWT Payload:", payload);
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/courses?filters[instructor][id]=${payload.userId}&populate=*`, {
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
