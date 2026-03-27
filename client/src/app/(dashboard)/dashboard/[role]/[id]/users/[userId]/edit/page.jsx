"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EditUser from "@/components/dashboard/users/EditUsers";
import { getAllRolesClient } from "@/actions/role.action";
import { getUserById } from "@/actions/user.action";

const EditUserPage = () => {
    const params = useParams();
    const userId = params?.userId;

    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            setLoading(true);
            const [rolesRes, userRes] = await Promise.all([
                getAllRolesClient(),
                getUserById(userId),
            ]);
            setRoles(rolesRes?.data ?? []);
            setUser(userRes?.data ?? null);
            setLoading(false);
        };
        fetchData();
    }, [userId]);

    if (loading) return null;

    return <EditUser user={user} roles={roles} />;
};

export default EditUserPage;