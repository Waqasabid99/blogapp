"use client";

import { useEffect, useState } from "react";
import AllUsers from "@/components/dashboard/users/AllUsers";
import { getAllUsers } from "@/actions/user.action";

const UsersPage = () => {
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data?.data ?? null);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    return <AllUsers users={users} loading={loading} />;
};

export default UsersPage;