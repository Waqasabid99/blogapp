"use client"

import api from "@/api/api";

export const getTagById = async (id) => {
    try {
        const { data } = await api.get(`/tag/id/${id}`);
        if (!data.success) {
            throw new Error("Failed to fetch tag");
        }
        return data;
    } catch (error) {
        console.log(error);
        return error.data;
    }
}