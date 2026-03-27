import { serverFetch } from "@/constants/serverFetch";

const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getDashboardAnalytics = async (range = 30) => {
  try {
    const response = await serverFetch(
      `${base_url}/analytics/dashboard?range=${range}`,
      {
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
    const response = await serverFetch(
      `${base_url}/analytics/post/${postId}?range=${range}`,
      {
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
    const response = await serverFetch(`${base_url}/analytics/overview`, {
      cache: "no-store",
    });
    console.log(response);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};