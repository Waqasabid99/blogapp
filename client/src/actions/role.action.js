import { base_url } from "@/constants/utils";
import { cookies } from "next/headers"

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