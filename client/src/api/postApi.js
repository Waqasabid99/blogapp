"use client";
import { triggerRevalidation } from "@/constants/helpers";
import api from "./api";

// Create a post (POST /post)
export async function createPost(payload) {
    try {
        const { data } = await api.post(`/post`, payload);
        console.log("Create Post page : ", data);
        if (data.success) {
            await triggerRevalidation(["posts"]);
        }
        return data;
    } catch (error) {
        console.log(error);
    }
}

// Update a post (PUT /post/:id)
export async function updatePost(postId, payload) {
    try {
        const { data } = await api.put(`/post/${postId}`, payload);
        console.log("Update Post page : ", data);
        if (data.success) {
            await triggerRevalidation(["posts"]);
        }
        return data;
    } catch (error) {
        console.log(error);
    }
}
