"use client";

import { useEffect, useState } from "react";
import AddUser from "@/components/dashboard/users/AddUsers";
import { getAllRolesClient } from "@/actions/role.action";

const AddUserPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      const data = await getAllRolesClient();
      setRoles(data?.data ?? []);
      setLoading(false);
    };
    fetchRoles();
  }, []);

  return <AddUser roles={roles} rolesLoading={loading} />;
};

export default AddUserPage;