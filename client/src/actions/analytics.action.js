import { getAuthHeaders } from "@/constants/authHeaders";

const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getDashboardAnalytics = async (range = 30) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${base_url}/analytics/dashboard?range=${range}`,
      {
        headers: headers,
        cache: "no-store"
      }
    );
    console.log(response);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

export const getPostAnalytics = async (postId, range = 30) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${base_url}/analytics/post/${postId}?range=${range}`,
      {
        headers,
        cache: "no-store",
      }
    );
    console.log(response);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

export const getSiteOverview = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${base_url}/analytics/overview`, {
      headers,
      cache: "no-store",
    });
    console.log(response);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};