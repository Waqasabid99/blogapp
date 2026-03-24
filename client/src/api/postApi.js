"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

function buildCookieHeader(cookieStore) {
    const all = cookieStore.getAll();
    if (!all.length) return "";
    return all.map((c) => `${c.name}=${c.value}`).join("; ");
}

async function parseJsonResponse(res) {
    const text = await res.text();
    if (!text) return { success: false, message: "Empty response" };
    try {
        return JSON.parse(text);
    } catch {
        return { success: false, message: text || "Invalid JSON" };
    }
}

/**
 * Create a post (POST /post). Forwards request cookies so verifyUser can read accessToken.
 */
export async function createPost(payload) {
    const cookieStore = await cookies();
    const cookieHeader = buildCookieHeader(cookieStore);

    const res = await fetch(`${base_url}/post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: JSON.stringify(payload),
        cache: "no-store",
    });

    const data = await parseJsonResponse(res);

    if (res.ok && data.success) {
        revalidateTag("posts");
    }

    return data;
}

/**
 * Update a post (PUT /post/:id). Forwards request cookies for auth and ownership checks.
 */
export async function updatePost(postId, payload) {
    const cookieStore = await cookies();
    const cookieHeader = buildCookieHeader(cookieStore);

    const res = await fetch(`${base_url}/post/${postId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: JSON.stringify(payload),
        cache: "no-store",
    });

    const data = await parseJsonResponse(res);

    if (res.ok && data.success) {
        revalidateTag("posts");
    }

    return data;
}
