import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request, {params}) {
    const cookiesData = await cookies();
    const jwtToken = cookiesData.get('jwt')?.value;
    const {id} = await params;
    const body = await request.json();
    const {lessonTitle, lessonContent, lessonVideoUrl} = body;
    console.log("Received data:", id,lessonTitle, lessonContent, lessonVideoUrl);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/lessons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({data:{
                title: lessonTitle,
                content: lessonContent,
                video_url: lessonVideoUrl,
                course: id
            }})
        });
        const data = await response.json();
        console.log("Lesson added successfully:", data);
        return NextResponse.json({message: "Lesson added successfully", data ,status: 200});
    } catch (error) {
        console.error("Error adding lesson:", error);
        return NextResponse.json({message: "Error adding lesson" , status: 500});
    }
}

export async function GET(request, {params}) {
    const cookiesData = await cookies();
    const jwtToken = cookiesData.get('jwt')?.value;
    const {id} = await params;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/lessons?filters[course][documentId][$eq]=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        const data = await response.json();
        console.log("Lessons fetched successfully:", data);
        return NextResponse.json({message: "Lessons fetched successfully", data ,status: 200});
    } catch (error) {
        console.error("Error fetching lessons:", error);
        return NextResponse.json({message: "Error fetching lessons" , status: 500});
    }
}