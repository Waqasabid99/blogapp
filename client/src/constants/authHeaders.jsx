// lib/authHeaders.js
import { headers } from "next/headers";

export const getAuthHeaders = async () => {
    const headerStore = await headers();
    const cookieHeader = headerStore.get("cookie"); // raw cookie string from browser

    return {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }), // forward entire cookie string
    };
};