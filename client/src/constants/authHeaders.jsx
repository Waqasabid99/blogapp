import { cookies } from "next/headers";

export const getAuthHeaders = async () => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    return {
        "Content-Type": "application/json",
        ...(accessToken && { Cookie: `accessToken=${accessToken}` }),
    };
};