import { cookies } from "next/headers";

const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

const authHeaders = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  return {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}`,
  };
};

export const getDashboardAnalytics = async (range = 30) => {
  try {
    const headers = await authHeaders();
    const response = await fetch(
      `${base_url}/analytics/dashboard?range=${range}`,
      {
        headers: headers,
        next: { tags: ["analytics"], revalidate: 300 }, // 5-min cache
      }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

export const getPostAnalytics = async (postId, range = 30) => {
  try {
    const headers = await authHeaders();
    const response = await fetch(
      `${base_url}/analytics/post/${postId}?range=${range}`,
      {
        headers,
        next: { tags: ["analytics"] },
      }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

export const getSiteOverview = async () => {
  try {
    const headers = await authHeaders();
    const response = await fetch(`${base_url}/analytics/overview`, {
      headers,
      next: { tags: ["analytics"], revalidate: 60 },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};