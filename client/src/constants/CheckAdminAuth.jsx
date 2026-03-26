"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";

const CheckAdminAuth = ({ children }) => {
    const { isAuthenticated, isCheckingAuth } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Wait until the auth check is complete before deciding to redirect.
        // Without this guard, the initial isAuthenticated: false state
        // (before checkAuth resolves) would immediately redirect on every refresh.
        if (!isCheckingAuth && !isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, isCheckingAuth]);

    // Render nothing while auth is still being verified
    if (isCheckingAuth) return null;

    return <>{children}</>;
};

export default CheckAdminAuth;