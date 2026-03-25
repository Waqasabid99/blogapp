"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";

const CheckAdminAuth = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated]);

    return <>{children}</>;
};

export default CheckAdminAuth;