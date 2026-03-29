"use client";

import api from "./api";

/**
 * Create a user (POST /users). Forwards cookies for verifyUser + permissions.
 */
export async function createUser(payload) {
    try {
        const { data } = await api.post(`/users`, {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
    
        return data?.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

/**
 * Update a user (PATCH /users/update/:id).
 */
export async function updateUser(userId, payload) {
    try {
        const { data } = await api.patch(`/users/update/${userId}`, {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        return data?.data;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}