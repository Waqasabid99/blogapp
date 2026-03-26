import { cookies } from "next/headers"

const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllUsers = async () => {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value
    console.log(accessToken);
    try {
        const res = await fetch(`${base_url}/users`, {
            method: 'GET',
            headers: {
                Cookie: `accessToken=${accessToken}`,
            },
            next: {
                tags: ['users']
            }
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
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value
    console.log(accessToken);
    try {
        const res = await fetch(`${base_url}/users/${id}`, {
            method: 'GET',
            headers: {
                Cookie: `accessToken=${accessToken}`,
            },
            next: {
                tags: ['users']
            }
        });
        console.log(res);
        const data = await res.json()
        return data
    } catch (error) {
        console.log(error)
        return error
    }
}