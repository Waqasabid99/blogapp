"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import DashboardBox from "@/components/ui/DashboardBox";
import ValidationToast from "@/components/ui/ValidationToast";
import { createTag } from "@/api/tagApi";
import Loader from "@/components/ui/Loader";

/* Main Component */
const AddTag = ({ tags }) => {
    const router = useRouter();

    /* form state */
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    /* ui state */
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    /* validation */
    const validate = () => {
        const e = {};
        if (!name.trim()) e.name = "Name is required.";
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
            const data = await createTag({
                name: name.trim(),
                description: description.trim(),
            });
            if (data.success) {
                router.refresh();
                setToast({ type: "success", message: "tag created successfully." });
                setTimeout(() => router.back(), 1500);
            } else {
                setToast({ type: "error", message: data?.message ?? "Failed to create tag." });
            }
        } catch (err) {
            setToast({ type: "error", message: err?.message ?? "Failed to create tag." });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setErrors({});
        setToast(null);
    };

    const fieldClass = (key) =>
        `form-input ac-input${errors[key] ? " ac-input--error" : ""}`;

    return (
        <>
            <style>{`
        /* ── Card ── */
        .ac-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          padding: 28px 32px;
        }
        @media (max-width: 600px) {
          .ac-card { padding: 20px 16px; }
        }

        /* ── Grid ── */
        .ac-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 640px) {
          .ac-grid { grid-template-columns: 1fr; }
        }
        .ac-full { grid-column: 1 / -1; }

        /* ── Field ── */
        .ac-field { display: flex; flex-direction: column; gap: 6px; }
        .ac-label {
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }
        .ac-label span { color: var(--brand-primary); margin-left: 2px; }
        .ac-hint {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: 3px;
        }
        .ac-error-msg {
          font-size: var(--text-xs);
          color: #dc2626;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 3px;
        }
        .dark .ac-error-msg { color: #f87171; }

        /* ── Input ── */
        .ac-input {
          background: var(--bg-primary);
          color: var(--text-primary);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .ac-input:focus {
          outline: none;
          border-color: var(--brand-primary);
          box-shadow: var(--focus-ring);
        }
        .ac-input--error { border-color: #dc2626 !important; }
        .dark .ac-input--error { border-color: #f87171 !important; }

        /* ── Textarea ── */
        .ac-textarea { resize: vertical; min-height: 100px; }

        /* ── Select ── */
        .ac-select-wrap { position: relative; }
        .ac-select-wrap select {
          appearance: none;
          -webkit-appearance: none;
          padding-right: 36px;
          cursor: pointer;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .ac-select-wrap .ac-chevron {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--text-muted);
        }

        /* ── Actions ── */
        .ac-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid var(--border-light);
          flex-wrap: wrap;
        }
      `}</style>

            <DashboardBox
                title="Add tag"
                description="Create a new tag or sub-tag for your blog"
            />

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>

                {toast && (
                    <ValidationToast
                        type={toast.type}
                        message={toast.message}
                    />
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="ac-card">
                        <div className="ac-grid">

                            {/* Name */}
                            <div className="ac-field">
                                <label className="ac-label" htmlFor="cat-name">
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
                                    <p className="ac-error-msg"><AlertCircle size={12} />{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="ac-field ac-full">
                                <label className="ac-label" htmlFor="cat-desc">
                                    Description
                                </label>
                                <textarea
                                    id="cat-desc"
                                    className="form-input ac-input ac-textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly describe what this tag covers…"
                                    rows={3}
                                />
                                <p className="ac-hint">Optional. Shown on the tag page.</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="ac-actions">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={resetForm}
                                disabled={loading}
                            >
                                Clear
                            </button>
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
                                style={{ minWidth: 140 }}
                            >
                                {loading ? (
                                    <>
                                        <Loader size="sm" />
                                        Creating…
                                    </>
                                ) : (
                                    "Create tag"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddTag;