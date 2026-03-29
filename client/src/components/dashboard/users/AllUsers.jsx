"use client";
import DashboardBox from "@/components/ui/DashboardBox";
import Table from "@/components/ui/Table";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import DeleteModal from "@/components/ui/DeleteModal";
import axios from "axios";
import { base_url } from "@/constants/utils";
import { useRouter } from "next/navigation";
import { getAllUsers } from "@/actions/user.action";

/* Allusers */
const AllUsers = () => {
    const [data, setData] = useState([]);
    const [toDelete, setToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                console.log("All Users page : ", data);
                setData(data?.users || []);
            } catch (error) {
                console.log(error);
            }
        };

        fetchUsers();
    }, [])

    const handleDeleteConfirm = useCallback(async () => {
        if (!toDelete) return;
        setDeleteLoading(true);
        try {
            const { data } = await axios.delete(`${base_url}/users/delete/${toDelete.id}`, { withCredentials: true })
            if (data.success) {
                setData((prev) => prev.filter((user) => user.id !== toDelete.id));
                setToDelete(null);
                router.refresh();
            }
        } catch (error) {
            setError(error.response.data.message);
        } finally {
            setDeleteLoading(false);
        }
    }, [toDelete]);

    const columns = [
        {
            label: "Name",
            key: "name",
            render: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                        fontWeight: row._depth === 0 ? "var(--font-semibold)" : "var(--font-regular)",
                        color: "var(--text-primary)",
                        fontSize: "var(--text-sm)"
                    }}>
                        {row.name}
                    </span>
                </div>
            ),
        },
        {
            label: "Role",
            key: "role",
            render: (row) => (
                <span style={{
                    fontFamily: "monospace",
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    background: "var(--bg-tertiary)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-light)"
                }}>
                    {row?.role?.name}
                </span>
            ),
        },
        {
            label: "Email",
            key: "email",
            render: (row) => (
                <span style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-muted)",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    maxWidth: 260,
                }}>
                    {row.email || <em style={{ opacity: .5 }}>No email</em>}
                </span>
            ),
        },
        {
            label: "Bio",
            key: "bio",
            render: (row) => (
                <span style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-muted)",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    maxWidth: 260,
                }}>
                    {row.bio || <em style={{ opacity: .5 }}>No bio</em>}
                </span>
            ),
        },
        {
            label: "Twitter",
            key: "twitter",
            render: (row) => (
                <span style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-muted)",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    maxWidth: 260,
                }}>
                    {row.twitter || <em style={{ opacity: .5 }}>No twitter</em>}
                </span>
            ),
        },
        {
            label: "Actions",
            key: "actions",
            align: "right",
            sortable: false,
            render: (row) => (
                <div style={{ display: "flex", gap: 8, justifyContent: "start" }}>
                    <Link
                        href={`users/${row.id}/edit`}
                        className="btn btn-outline"
                        style={{ padding: "6px 14px", fontSize: "var(--text-xs)" }}
                    >
                        Edit
                    </Link>
                    <button
                        className="btn"
                        style={{
                            padding: "6px 14px",
                            fontSize: "var(--text-xs)",
                            background: "#fef2f2",
                            color: "#dc2626",
                            border: "1px solid #fecaca"
                        }}
                        onClick={() => setToDelete(row)}
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <DashboardBox
                title="users"
                description="View and manage all users and their sub-users"
                button={
                    <Link href="users/new" className="btn btn-primary">
                        Add user
                    </Link>
                }
                className="mb-6"
            />

            <Table
                columns={columns}
                data={data}
                emptyMessage="No users found. Create your first user to get started."
                isLoading={false}
                pagination
                defaultPerPage={10}
            />

            {toDelete && (
                <DeleteModal
                    isOpen={!!toDelete}
                    onClose={() => setToDelete(null)}
                    title="Delete user"
                    description={`Are you sure you want to delete "${toDelete.name}"?`}
                    onConfirm={handleDeleteConfirm}
                    isLoading={deleteLoading}
                    error={error}
                    setError={setError}
                />
            )}
        </div>
    );
};

export default AllUsers;