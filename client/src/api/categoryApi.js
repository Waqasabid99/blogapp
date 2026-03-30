"use client";
import { triggerRevalidation } from "@/constants/helpers";
import api from "./api";

// Create a category (POST /category/create).
export async function createCategory(payload) {
    try {
        const { data } = await api.post(`/category/create`, payload);
        if (data?.success) {
            await triggerRevalidation(["categories"]);
            return data;
        } else {
            throw new Error(data?.message ?? "Failed to create category.");
        }
    } catch (error) {
        console.log(error);
        throw new Error(error?.message ?? "Failed to create category.");
    }
}

// Update a category (PATCH /category/update/:id).
export async function updateCategory(categoryId, payload) {
    try {
        const { data } = await api.patch(`/category/update/${categoryId}`, payload);
        if (data?.success) {
            await triggerRevalidation(["categories"]);
            return data;
        } else {
            throw new Error(data?.message ?? "Failed to update category.");
        }
    } catch (error) {
        console.log(error);
        throw new Error(error?.message ?? "Failed to update category.");
    }
}