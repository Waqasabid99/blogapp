import { cookies } from "next/headers"
import api from "@/api/api"

const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllRoles = async () => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    try {
        const response = await fetch(`${base_url}/role-permission/roles`, {
            headers: {
                Cookie: `accessToken=${accessToken}`,
            },
            next: {
                tags: ["roles"]
            }
        })
        console.log(response);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.message || "Failed to fetch roles");
        }
        return data;
    } catch (error) {
        console.log(error)
        return error;
    }
}

export const getAllRolesClient = async () => {
    try {
        const { data } = await api.get("/role-permission/roles");
        return data;
    } catch (error) {
        return { success: false, message: error?.response?.data?.message ?? error.message };
    }
}

export const getAllPermissions = async () => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    try {
        const response = await fetch(`${base_url}/role-permission/permissions`, {
            headers: {
                Cookie: `accessToken=${accessToken}`,
            },
            next: {
                tags: ["permissions"]
            }
        });
        console.log(response);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.message || "Failed to fetch permissions");
        }
        return data.data;
    } catch (error) {
        console.log(error)
        return error;
    }
}