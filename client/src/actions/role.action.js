"use client";
import api from "@/api/api";

export const getAllRoles = async () => {
    try {
        const { data } = await api.get(`/role-permission/roles`);
        console.log("All roles action log : ", data);
        return data?.data;
    } catch (error) {
        console.log(error)
        return error;
    }
}

export const getAllPermissions = async () => {
    try {
        const { data } = await api.get(`/role-permission/permissions`);
        console.log("All permissions log : ", data);
        return data?.data;
    } catch (error) {
        console.log(error)
        return error;
    }
}