import { serverFetch } from "@/constants/serverFetch";

const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllUsers = async () => {
    try {
        const response = await serverFetch(`${base_url}/users`);
        if (!response.ok) {
            throw new Error("Failed to fetch users");
        };
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error)
        return error
    }
}

export const getUserById = async (id) => {
    try {
        const response = await serverFetch(`${base_url}/users/${id}`);
        if (!response.ok) {
            throw new Error("Failed to fetch user");
        };
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error)
        return error
    }
}