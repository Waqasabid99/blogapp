"use client";
import api from "@/api/api";

export const getDashboardAnalytics = async (range = 30) => {
  try {
    const { data } = await api.get(`/analytics/dashboard?range=${range}`)
    console.log(data);
    if (!data.success) return null;
    return data.data;
  } catch {
    return null;
  }
};

export const getPostAnalytics = async (postId, range = 30) => {
  try {
    const { data } = await api.get(`/analytics/post/${postId}?range=${range}`)
    console.log(data);
    if (!data.success) return null;
    return data.data;
  } catch {
    return null;
  }
};

export const getSiteOverview = async () => {
  try {
    const { data } = await api.get(`/analytics/overview`)
    console.log(data);
    if (!data.success) return null;
    return data.data;
  } catch {
    return null;
  }
};