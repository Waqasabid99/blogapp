"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, AlertCircle } from "lucide-react";
import DashboardBox from "@/components/ui/DashboardBox";
import ValidationToast from "@/components/ui/ValidationToast";
import { updateCategory } from "@/api/categoryApi";
import { getAllCategories, getCategoryById } from "@/actions/category.action";

/* Main Component  */
const EditCategory = ({ categoryId }) => {
    const router = useRouter();
    const [category, setCategory] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    /* form state */
    const [name, setName] = useState(category?.name ?? "");
    const [description, setDescription] = useState(category?.description ?? "");
    const [parentId, setParentId] = useState(category?.parentId ?? "");

    /* ui state */
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const [category, allCategories] = await Promise.all([
                    getCategoryById(categoryId),
                    getAllCategories()
                ])
                if (category.data) {
                    setCategory(category.data);
                    setName(category.data.name || "");
                    setDescription(category.data.description || "");
                    setParentId(category.data.parentId || "");
                }
                if (allCategories.data) {
                    setAllCategories(allCategories.data);
                }
            } catch (error) {
                console.log("Error fetching categories : ", error);
                setToast({ type: "error", message: error?.message ?? "Failed to fetch categories." });
            }
        }
        fetchCategories();
    }, [])

    /* eligible parent options — cannot be itself or its own descendants */
    const descendantIds = new Set();
    const collectDescendants = (cats) => {
        cats.forEach((c) => {
            descendantIds.add(c.id);
            if (c.children?.length) collectDescendants(c.children);
        });
    };
    if (category?.children?.length) collectDescendants(category.children);

    const parentOptions = allCategories.filter(
        (c) => c.id !== category?.id && !descendantIds.has(c.id)
    );

    /* validation */
    const validate = () => {
        const e = {};
        if (!name?.trim()) e.name = "Name is required.";
        return e;
    };

    /* submit */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);

        try {
            if (!category?.id) {
                setToast({ type: "error", message: "Category data missing." });
                setLoading(false);
                return;
            }

            const data = await updateCategory(category.id, {
                name: name?.trim(),
                description: description?.trim(),
                parentId: parentId || null,
            });
            if (data.success) {
                router.refresh();
                setToast({ type: "success", message: "Category updated successfully." });
                setTimeout(() => router.back(), 1500);
            } else {
                setToast({ type: "error", message: data?.message ?? "Update failed." });
            }
        } catch (err) {
            setToast({ type: "error", message: err?.message ?? "Update failed." });
        } finally {
            setLoading(false);
        }
    };

    /* helpers */
    const fieldClass = (key) =>
        `form-input uc-input${errors[key] ? " uc-input--error" : ""}`;

    return (
        <>
            {/* page header */}
            <DashboardBox
                title="Edit Category"
                description={`Updating "${category?.name}"`}
            />

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>

                {toast && (
                    <ValidationToast
                        type={toast.type}
                        message={toast.message}
                    />
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="uc-card">

                        {/* ── Meta info row ── */}
                        <div className="uc-meta-row">
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">ID</span>
                                <span className="uc-meta-val">{category?.id}</span>
                            </div>
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Created</span>
                                <span className="uc-meta-val">
                                    {category?.createdAt
                                        ? new Date(category.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric", month: "short", day: "numeric"
                                        })
                                        : "—"}
                                </span>
                            </div>
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Last Updated</span>
                                <span className="uc-meta-val">
                                    {category?.updatedAt
                                        ? new Date(category.updatedAt).toLocaleDateString("en-US", {
                                            year: "numeric", month: "short", day: "numeric"
                                        })
                                        : "—"}
                                </span>
                            </div>
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Children</span>
                                <span className="uc-meta-val">{category?.children?.length ?? 0}</span>
                            </div>
                        </div>

                        {/* ── Fields ── */}
                        <div className="uc-grid" style={{ marginTop: 24 }}>

                            {/* Name */}
                            <div className="uc-field">
                                <label className="uc-label" htmlFor="cat-name">
                                    Name <span>*</span>
                                </label>
                                <input
                                    id="cat-name"
                                    type="text"
                                    className={fieldClass("name")}
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setErrors((p) => ({ ...p, name: "" }));
                                    }}
                                    placeholder="e.g. Technology"
                                    autoComplete="off"
                                    autoFocus
                                />
                                {errors.name && (
                                    <p className="uc-error-msg"><AlertCircle size={12} />{errors.name}</p>
                                )}
                            </div>

                            {/* Parent */}
                            <div className="uc-field">
                                <label className="uc-label" htmlFor="cat-parent">
                                    Parent Category
                                </label>
                                <div className="uc-select-wrap">
                                    <select
                                        id="cat-parent"
                                        className="form-input uc-input"
                                        value={parentId}
                                        onChange={(e) => setParentId(e.target.value)}
                                    >
                                        <option value="">None (top-level)</option>
                                        {parentOptions.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={15} className="uc-chevron" />
                                </div>
                                <p className="uc-hint">Leave empty to make this a top-level category.</p>
                            </div>

                            {/* Description */}
                            <div className="uc-field uc-full">
                                <label className="uc-label" htmlFor="cat-desc">
                                    Description
                                </label>
                                <textarea
                                    id="cat-desc"
                                    className="form-input uc-input uc-textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly describe what this category covers…"
                                    rows={3}
                                />
                                <p className="uc-hint">Optional. Shown on the category page.</p>
                            </div>
                        </div>

                        {/* ── Children display ── */}
                        {category?.children?.length > 0 && (
                            <div className="uc-children-section">
                                <p className="uc-children-label">
                                    Sub-categories ({category.children.length})
                                </p>
                                <div className="uc-children-list">
                                    {category.children.map((child) => (
                                        <span key={child.id} className="uc-child-badge">
                                            <span className="uc-child-badge-dot" />
                                            {child.name}
                                        </span>
                                    ))}
                                </div>
                                <p className="uc-hint" style={{ marginTop: 8 }}>
                                    Sub-categories are managed individually from the categories list.
                                </p>
                            </div>
                        )}

                        {/* ── Actions ── */}
                        <div className="uc-actions">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ minWidth: 130 }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={15} className="uc-spinner" style={{ marginRight: 6 }} />
                                        Saving…
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditCategory;