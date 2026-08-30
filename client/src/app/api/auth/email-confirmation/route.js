export async function POST(request) {
    const { email } = await request.json();
    try {
        const strapiResponse = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/send-email-confirmation`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                }),
            }
        );
        const data = await strapiResponse.json();
        if (!strapiResponse.ok) {
            return Response.json(
                {
                    message: data?.error?.message || "Error sending email confirmation",
                    status: strapiResponse.status
                }
            );
        }
        return Response.json({
            message: "Email confirmation sent successfully",
            status: 200
        });
    } catch (error) {
        console.error("Error:", error);
        return Response.json(
            {
                message: "Internal server error",
                status: 500
            }
        );
    }
}