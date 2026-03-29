"use client"

import api from "@/api/api";

export const getAllTags = async (filters) => {
    try {
        const { data } = await api.get(`/tag?${new URLSearchParams(filters).toString()}`);
        console.log(data);
        if (!data.success) {
            throw new Error("Failed to fetch tags");
        }
        return data;
    } catch (error) {
        console.log(error);
        return error.data;
    }
}

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