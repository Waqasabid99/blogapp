"use client";
import api from "@/api/api";

const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllUsers = async () => {
    try {
        const { data } = await api.get(`/users`);
        return data
    } catch (error) {
        console.log(error)
        return error
    }
}

export const getUserById = async (id) => {
    try {
        const { data } = await api.get(`/users/${id}`);
        return data
    } catch (error) {
        console.log(error)
        return error
    }
}