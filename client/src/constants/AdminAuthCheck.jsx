"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

const AdminAuthCheck = ({ children }) => {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
        };
    });

    return children;
};

export default AdminAuthCheck;