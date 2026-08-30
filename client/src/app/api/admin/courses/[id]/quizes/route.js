import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    const cookiesData = await cookies();
    const jwtToken = cookiesData.get('jwt')?.value;
    const { id } = await params;
    const body = await request.json();
    console.log("Received POST request for course ID:", id);
    console.log("Request body:", body);
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/quizzes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({data:{
                title: body.quizTitle,
                description: body.quizDescription,
                passing_mark: body.quizPassingScore,
                quiz_questions: body.quizQuestions,
                course: id
            }})
        });
        const data = await response.json();
        console.log("Quiz added successfully:", data);
        return NextResponse.json({message: "Quiz added successfully", data ,status: 200});
    } catch (error) {
        console.error("Error adding quiz:", error);
        return NextResponse.json({message: "Error adding quiz" , status: 500});
    }
    
}

export async function GET(request, { params }) {
    const cookiesData = await cookies();
    const jwtToken = cookiesData.get('jwt')?.value;
    const { id } = await params;
    console.log("Received GET request for course ID:", id);
    try {
        const filterField = /^\d+$/.test(id) ? 'id' : 'documentId';
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/quizzes?filters[course][${filterField}][$eq]=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        const data = await response.json();
        console.log("Quizzes fetched successfully:", data);
        return NextResponse.json({message: "Quizzes fetched successfully", data ,status: 200});
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        return NextResponse.json({message: "Error fetching quizzes" , status: 500});
    }
}