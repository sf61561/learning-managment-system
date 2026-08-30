import { decodeJwt } from "jose";
const getUserData = async (jwt) => {
    const payload = decodeJwt(jwt);
    const { userId } = payload;
    const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://learning-managment-system-production-a958.up.railway.app/api";
    try {
        const strapiUserResponse = await fetch(`${STRAPI_API_URL}/users/${userId}?populate=role`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwt}`
            }
        });
        const user = await strapiUserResponse.json();
        return user;
    }
    catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
}

export default getUserData;