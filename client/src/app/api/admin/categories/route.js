import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

export async function POST(request){
    const cookieStore = await cookies();
    try{
        const formData = await request.formData();
        const categoryName = formData.get("categoryName");
        const categorySlug = formData.get("categorySlug");
        const categoryDescription = formData.get("categoryDescription");
        const categoryImage = formData.get("categoryImage");
        const jwtToken = cookieStore.get("jwt")?.value;
        const body={
            "data": 
            {
                "name": categoryName,
                "slug": categorySlug,
                "description": categoryDescription,
                "image": categoryImage
            }
        };
        
        console.log(JSON.stringify(body));
        const response = await fetch(`${STRAPI_API_URL}/categories`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            body:JSON.stringify(body),
        });
        const result = await response.json();
        if (!response.ok) {
            console.error("Strapi error:", result);

            return NextResponse.json(
                {
                    message: "Failed to create category",
                    error: result,
                    status: response.status
                }
            );
        }
        return NextResponse.json(
            {
                message: "Category created successfully",
                data: result,
                status: 201
            }
        );
    }
    catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            {
                message: "An error occurred while creating the category",
                error: error.message,
                status: 500
            }
        );
    }
}

export async function GET(request){
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get("jwt")?.value;
    try{
        const response = await fetch(`${STRAPI_API_URL}/categories?populate=image`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store"
        });
        const result = await response.json();
        if (!response.ok) {
            console.error("Strapi error:", result);
            return NextResponse.json(
                {
                    message: "Failed to fetch categories",
                    error: result,
                    status: response.status
                }
            );
        }
        return NextResponse.json(
            {
                message: "Categories fetched successfully",
                data: result,
                status: 200
            }
        );
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            {
                message: "An error occurred while fetching the categories",
                error: error.message,
                status: 500
            }
        );
    }
}