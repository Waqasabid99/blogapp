"use client";
import { triggerRevalidation } from "@/constants/helpers";
import api from "./api";

// Create a category (POST /category/create).
export async function createCategory(payload) {
    try {
        const { data } = await api.post(`/category/create`, payload);
        console.log("Create Category page : ", data);
        if (data.success) {
            await triggerRevalidation(["categories"]);
        }
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Update a category (PATCH /category/update/:id).
export async function updateCategory(categoryId, payload) {
    try {
        const { data } = await api.patch(`/category/update/${categoryId}`, payload);
        console.log("Update Category page : ", data);
        if (data.success) {
            await triggerRevalidation(["categories"]);
        }
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}