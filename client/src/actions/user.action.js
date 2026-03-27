import api from "@/api/api";

export const getAllUsers = async () => {
    try {
        const { data } = await api.get("/users");
        return data;
    } catch (error) {
        console.log(error);
        return { success: false, message: error?.response?.data?.message ?? error.message };
    }
};

export const getUserById = async (id) => {
    try {
        const { data } = await api.get(`/users/${id}`);
        return data;
    } catch (error) {
        console.log(error);
        return { success: false, message: error?.response?.data?.message ?? error.message };
    }
};