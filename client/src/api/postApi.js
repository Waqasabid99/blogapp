"use client";
import api from "./api";

// Create a post (POST /post)
export async function createPost(payload) {
    try {
        const { data } = await api.post(`/post`, payload);
        return data;
    } catch (error) {
        console.log(error);
    }
}

// Update a post (PUT /post/:id)
export async function updatePost(postId, payload) {
    try {
        const { data } = await api.put(`/post/${postId}`, payload);
        return data;
    } catch (error) {
        console.log(error);
    }
}
