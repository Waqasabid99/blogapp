"use client";
import { triggerRevalidation } from "@/constants/helpers";
import api from "./api";

/**
 * Create a tag (POST /tag/create). Forwards cookies for verifyUser + permissions.
 */
export async function createTag(payload) {
    try {
        const { data } = await api.post(`/tag/create`, payload);
        if (data?.success) {
            await triggerRevalidation(["tags"])
        }
        return data;
    } catch (error) {
        console.log("Error creating tag:", error);
        return error.data;
    }
}

/**
 * Update a tag (PATCH /tag/update/:id).
 */
export async function updateTag(tagId, payload) {
    try {
        const { data } = await api.patch(`/tag/update/${tagId}`, payload);
        if (data?.success) {
            await triggerRevalidation(["tags"])
        }
        return data;
    } catch (error) {
        console.log("Error updating tag:", error);
        return error.data;
    }
}
