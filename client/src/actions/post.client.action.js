"use client";

import api from "@/api/api";

export const getOwnerPosts = async () => {
    try {
        const { data } = await api.get(`/post/owner`)
        return data
    } catch (error) {
        console.log(error);
    }
};

export const getPostById = async (id) => {
    try {
        const { data } = await api.get(`/post/postId/${id}`)
        return data
    } catch (error) {
        console.log(error);
    }
};