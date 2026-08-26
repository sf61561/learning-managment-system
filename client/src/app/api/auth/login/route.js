import { cookies } from "next/headers";

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

export async function POST(request) {
    const cookieStore = await cookies();
    try {
        const body = await request.json();
        const { email, password } = body;
        if (!email || !password) {
            return Response.json(
                {
                    message: "Email and password are required",
                    status: 400
                }
            );
        }
        const strapiResponse = await fetch(
            `${STRAPI_API_URL}/auth/local`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier: email,
                    password,
                }),
                cache: "no-store",
            }
        );
        const data = await strapiResponse.json();
        if (!strapiResponse.ok) {
            return Response.json(
                {
                    message:data?.error?.message || "Invalid email or password",
                    status: strapiResponse.status
                }
            );
        }
        let { jwt, user } = data;
        cookieStore.set("jwt", jwt, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 10, // 10 minutes 
        });
        try{
            const strapiUserResponse = await fetch(`${STRAPI_API_URL}/users/me?populate=role`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${jwt}`
                }
            });
            user = await strapiUserResponse.json();
            if (!strapiUserResponse.ok) {
                return Response.json(
                    {
                        message: userData?.error?.message || "Failed to fetch user data",
                        status: strapiUserResponse.status
                    }
                );
            }
        }
        catch (error) {
            console.error("Error fetching user data:", error);
            return Response.json(
                {
                    message: "Failed to fetch user data",
                    status: 500
                }
            );
        }
        return Response.json({
            message: "Login successful",
            user:{
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role.name
            },
            status: 200
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return Response.json(
            {
                message: "Internal server error",
                status: 500
            }
        );
    }
}