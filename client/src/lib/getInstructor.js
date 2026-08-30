"use server";
import { cookies } from "next/headers";

export const getInstructor = async () => {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get("jwt")?.value;
    const user= await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/users?filters[role][name][$eq]=Instructor&fields[0]=id&fields[1]=full_name&populate=role`,{
        method: "GET",
        headers: {
            "Authorization": `Bearer ${jwtToken}`
        }
    });
    if (!user.ok) {
        throw new Error(`HTTP error! status: ${user.status}`);
    }
    const data = await user.json();
    return data.data;
}