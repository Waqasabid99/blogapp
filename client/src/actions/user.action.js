import { getAuthHeaders } from "@/constants/authHeaders";

const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllUsers = async () => {
    try {
        const headers = await getAuthHeaders();
        console.log(headers);
        const res = await fetch(`${base_url}/users`, {
            method: 'GET',
            headers,
            cache: "no-store"
        });
        console.log(res);
        const data = await res.json()
        return data
    } catch (error) {
        console.log(error)
        return error
    }
}

export const getUserById = async (id) => {
    try {
        const headers = await getAuthHeaders();
        console.log(headers);
        const res = await fetch(`${base_url}/users/${id}`, {
            method: 'GET',
            headers,
            cache: "no-store"
        });
        console.log(res);
        const data = await res.json()
        return data
    } catch (error) {
        console.log(error)
        return error
    }
}