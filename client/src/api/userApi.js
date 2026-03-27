import api from "@/api/api";

/**
 * Create a user (POST /users).
 */
export async function createUser(payload) {
    try {
        const { data } = await api.post("/users", payload);
        return data;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message ?? error.message ?? "Failed to create user",
        };
    }
}

/**
 * Update a user (PATCH /users/update/:id).
 */
export async function updateUser(userId, payload) {
    try {
        const { data } = await api.patch(`/users/update/${userId}`, payload);
        return data;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message ?? error.message ?? "Failed to update user",
        };
    }
}
