import { cookies } from "next/headers";

export async function serverFetch(url, options = {}) {
    const cookieStore = cookies();
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Cookie: cookieStore.toString(),
        },
        cache: "no-store",
    });
}