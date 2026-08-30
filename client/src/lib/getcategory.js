export const getCategory = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/categories?fields[0]=name&fields[1]=id`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data;
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};