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
import { getAllCategories } from "@/actions/category.action";

/* ─── Flatten nested categories into a renderable list ─────────── */
const flattenCategories = (categories = [], depth = 0) => {
    const rows = [];
    categories.forEach((cat) => {
        rows.push({ ...cat, _depth: depth });
        if (cat.children?.length) {
            rows.push(...flattenCategories(cat.children, depth + 1));
        }
    });
    return rows;
};

/* ─── AllCategories ─────────────────────────────────────────────── */
const AllCategories = () => {
    const [data, setData] = useState([]);
    const [toDelete, setToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                console.log("All categories data : ", data);
                setData(data.data);
            } catch (error) {
                console.log("All categories error : ", error);
                setError(error.response.data.message);
            }
        }
        fetchCategories();
    }, [])

    /* flatten for table */
    const flatRows = flattenCategories(data);

    const handleDeleteConfirm = useCallback(async () => {
        if (!toDelete) return;
        setDeleteLoading(true);
        try {
            const { data } = await axios.delete(`${base_url}/category/delete`, { params: { id: toDelete.id }, withCredentials: true })
            if (data.success) {
                setData((prev) => prev.filter((cat) => cat.id !== toDelete.id));
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
                    {/* indent children */}
                    {row._depth > 0 && (
                        <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 2,
                            paddingLeft: `${row._depth * 16}px`,
                            color: "var(--text-muted)"
                        }}>
                            <ChevronRight size={13} style={{ flexShrink: 0 }} />
                        </span>
                    )}
                    <span style={{
                        fontWeight: row._depth === 0 ? "var(--font-semibold)" : "var(--font-regular)",
                        color: "var(--text-primary)",
                        fontSize: "var(--text-sm)"
                    }}>
                        {row.name}
                    </span>
                    {/* child count badge for parent rows */}
                    {row._depth === 0 && row.children?.length > 0 && (
                        <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "1px 8px",
                            borderRadius: "var(--radius-xl)",
                            background: "var(--brand-primary-light)",
                            color: "var(--brand-primary)",
                            fontSize: "10px",
                            fontWeight: "var(--font-semibold)",
                            letterSpacing: ".04em",
                            border: "1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)"
                        }}>
                            {row.children.length} sub
                        </span>
                    )}
                </div>
            ),
        },
        {
            label: "Slug",
            key: "slug",
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
                    {row.slug}
                </span>
            ),
        },
        {
            label: "Description",
            key: "description",
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
                    {row.description || <em style={{ opacity: .5 }}>No description</em>}
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
                        href={`categories/${row.id}/edit`}
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
                title="Categories"
                description="View and manage all categories and their sub-categories"
                button={
                    <Link href="categories/new" className="btn btn-primary">
                        Add Category
                    </Link>
                }
                className="mb-6"
            />

            <Table
                columns={columns}
                data={flatRows}
                emptyMessage="No categories found. Create your first category to get started."
                isLoading={false}
                pagination
                defaultPerPage={15}
            />

            {toDelete && (
                <DeleteModal
                    isOpen={!!toDelete}
                    onClose={() => setToDelete(null)}
                    title="Delete Category"
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

export default AllCategories;