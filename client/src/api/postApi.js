"use client";
import { triggerRevalidation } from "@/constants/helpers";
import api from "./api";

// Create a post (POST /post)
export async function createPost(payload) {
    try {
        const { data } = await api.post(`/post`, payload);
        if (data?.success) {
            await triggerRevalidation(["posts"]);
            return data;
        } else {
            throw new Error(data?.message ?? "Failed to create post.");
        }
    } catch (error) {
        console.log(error);
        throw new Error(error?.message ?? "Failed to create post.");
    }
}

// Update a post (PUT /post/:id)
export async function updatePost(postId, payload) {
    try {
        const { data } = await api.put(`/post/${postId}`, payload);
        if (data?.success) {
            await triggerRevalidation(["posts"]);
            return data;
        } else {
            throw new Error(data?.message ?? "Failed to update post.");
        }
    } catch (error) {
        console.log(error);
        throw new Error(error?.message ?? "Failed to update post.");
    }
}
