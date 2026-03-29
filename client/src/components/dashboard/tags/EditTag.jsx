"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import DashboardBox from "@/components/ui/DashboardBox";
import ValidationToast from "@/components/ui/ValidationToast";
import { updateTag } from "@/api/tagApi";
import Loader from "@/components/ui/Loader";
import { getTagById } from "@/actions/tags.action";

/* Main Component  */
const EditTag = ({ tagId }) => {
    const router = useRouter();
    const [tag, setTag] = useState(null);
    /* form state */
    const [name, setName] = useState(tag?.name ?? "");
    const [description, setDescription] = useState(tag?.description ?? "");

    /* ui state */
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchTag = async () => {
            try {
                const data = await getTagById(tagId);
                console.log("Edit Tag page : ", data);
                if (data.success && data.data) {
                    setTag(data?.data);
                    setName(data?.data?.name || "");
                    setDescription(data?.data?.description || "");
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchTag();
    }, [tagId]);
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
            if (!tag?.id) {
                setToast({ type: "error", message: "Tag data missing." });
                setLoading(false);
                return;
            }

            const data = await updateTag(tag.id, {
                name: name?.trim(),
                description: description?.trim(),
            });
            if (data.success) {
                router.refresh();
                setToast({ type: "success", message: "tag updated successfully." });
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
                title="Edit tag"
                description={`Updating "${tag?.name}"`}
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
                                <span className="uc-meta-val">{tag?.id}</span>
                            </div>
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Created</span>
                                <span className="uc-meta-val">
                                    {tag?.createdAt
                                        ? new Date(tag.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric", month: "short", day: "numeric"
                                        })
                                        : "—"}
                                </span>
                            </div>

                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Children</span>
                                <span className="uc-meta-val">{tag?.children?.length ?? 0}</span>
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
                                    placeholder="Briefly describe what this tag covers…"
                                    rows={3}
                                />
                                <p className="uc-hint">Optional. Shown on the tag page.</p>
                            </div>
                        </div>

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
                                        <Loader size="sm" />
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

export default EditTag;