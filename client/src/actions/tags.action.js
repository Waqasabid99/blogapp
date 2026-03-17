import { base_url } from "@/constants/utils";
import { cookies } from "next/headers";

export const getAllTags = async () => {
    try {
        const response = await fetch(`${base_url}/tag`, {
            next: {
                tags: ["tags"]
            }
        });
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