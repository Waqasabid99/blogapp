"use client";

import api from "./api";

/**
 * Create a category (POST /category/create). Forwards cookies for verifyUser + permissions.
 */
export async function createCategory(payload) {
    try {
        const { data } = await api.post(`/category/create`, payload);
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * Update a category (PATCH /category/update/:id).
 */
export async function updateCategory(categoryId, payload) {
    try {
        const { data } = await api.patch(`/category/update/${categoryId}`, payload);
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}