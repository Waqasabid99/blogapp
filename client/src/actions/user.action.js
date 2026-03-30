"use client";
import api from "@/api/api";

export const getAllUsers = async () => {
    try {
        const { data } = await api.get("/users");
        return data.data
    } catch (error) {
        console.log(error)
        return error
    }
};

export const getUserById = async (id) => {
    try {
        const { data } = await api.get(`/users/${id}`);
        return data.data
    } catch (error) {
        console.log(error)
        return error
    }
};