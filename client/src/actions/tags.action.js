import { cookies } from "next/headers";

const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllTags = async (filters) => {
    try {
        const response = await fetch(`${base_url}/tag?${new URLSearchParams(filters).toString()}`, {
            next: {
                tags: ["tags"]
            }
        });
        console.log(response);
        if (!response.ok) {
            throw new Error("Failed to fetch tags");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        return error.data;
    }
}

export const getTagById = async (id) => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    try {
        const response = await fetch(`${base_url}/tag/id/${id}`, {
            headers: {
                Cookie: `accessToken=${accessToken}`
            },
            next: {
                tags: ["tags"]
            },
        });
        console.log(response);
        if (!response.ok) {
            throw new Error("Failed to fetch tag");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        return error.data;
    }
}