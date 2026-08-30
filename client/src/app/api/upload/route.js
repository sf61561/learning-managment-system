import { cookies } from "next/headers";

export async function POST(request) {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get("jwt")?.value;
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const formdata1 = new FormData();
        formdata1.append("files", file);
        if (!file) {
            return new Response("No file uploaded", { status: 400 });
        }
        const response=await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
            body: formdata1,
        });
        return response;
    } catch (error) {
        console.error("Error uploading file:", error);
        return new Response("Error uploading file", { status: 500 });
    }
}