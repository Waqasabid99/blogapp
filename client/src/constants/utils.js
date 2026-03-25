"use client";
import api from "@/api/api";
import Loader from "@/components/ui/Loader";
import { AlertCircle, Archive, Calendar, CheckCircle2, ChevronDown, CircleDashed, FolderOpen, Hash, ImagePlus, Timer, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getInitials } from "./helpers";

export const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ─────────────────────────────────────────────────────────────
   TAG INPUT COMPONENT
───────────────────────────────────────────────────────────── */
export function TagSelector({ allTags, selectedTagIds, onChange }) {
    const [input, setInput] = useState("");
    const [focused, setFocused] = useState(false);

    const filtered = allTags?.filter(
        (t) =>
            !selectedTagIds.includes(t.id) &&
            t.name.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 8);

    const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id));

    const add = (tag) => {
        onChange([...selectedTagIds, tag.id]);
        setInput("");
    };

    const remove = (id) => onChange(selectedTagIds.filter((t) => t !== id));

    return (
        <div className="pc-tag-selector">
            <div className={`pc-tag-input-wrap${focused ? " pc-tag-input-wrap--focus" : ""}`}>
                {selectedTags.map((tag) => (
                    <span key={tag.id} className="pc-tag-chip">
                        <Hash size={10} />
                        {tag.name}
                        <button type="button" onClick={() => remove(tag.id)}>
                            <X size={10} />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 180)}
                    placeholder={selectedTags.length === 0 ? "Search tags…" : ""}
                    className="pc-tag-text-input"
                />
            </div>
            {focused && filtered.length > 0 && (
                <div className="pc-dropdown">
                    {filtered.map((tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            className="pc-dropdown-item"
                            onMouseDown={() => add(tag)}
                        >
                            <Hash size={12} />
                            {tag.name}
                            {tag.postCount > 0 && (
                                <span className="pc-dropdown-count">{tag.postCount} posts</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY SELECTOR COMPONENT
───────────────────────────────────────────────────────────── */
export function CategorySelector({ allCategories, selectedIds, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    const toggle = (id) => {
        onChange(selectedIds.includes(id)
            ? selectedIds.filter((c) => c !== id)
            : [...selectedIds, id]
        );
    };

    const selectedCategories = allCategories.filter((c) => selectedIds.includes(c.id));

    return (
        <div ref={ref} className="pc-cat-selector">
            <button
                type="button"
                className={`pc-cat-trigger${open ? " pc-cat-trigger--open" : ""}`}
                onClick={() => setOpen(!open)}
            >
                <FolderOpen size={13} />
                {selectedCategories.length === 0
                    ? "Select categories"
                    : selectedCategories.map(c => c.name).join(", ")
                }
                <ChevronDown size={13} style={{ marginLeft: "auto" }} />
            </button>

            {open && (
                <div className="pc-cat-dropdown">
                    {allCategories.map((cat) => {
                        const checked = selectedIds.includes(cat.id);
                        return (
                            <label key={cat.id} className="pc-cat-option">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggle(cat.id)}
                                />
                                <span className="pc-cat-check">
                                    {checked && <CheckCircle2 size={11} />}
                                </span>
                                <span className="pc-cat-name">{cat.name}</span>
                                {cat.children?.length > 0 && (
                                    <span className="pc-cat-badge">{cat.children.length}</span>
                                )}
                            </label>
                        );
                    })}
                </div>
            )}

            {selectedCategories.length > 0 && (
                <div className="pc-cat-chips">
                    {selectedCategories.map((cat) => (
                        <span key={cat.id} className="pc-cat-chip">
                            <FolderOpen size={10} />
                            {cat.name}
                            <button type="button" onClick={() => toggle(cat.id)}><X size={10} /></button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   THUMBNAIL UPLOADER
───────────────────────────────────────────────────────────── */
export function ThumbnailUploader({ value, onChange }) {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const upload = async (file) => {
        if (!file || !file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError("Image must be under 10MB.");
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            const { data } = await api.post("/media/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            onChange({ id: data?.data?.media?.id, url: data?.data?.cloudinaryData?.url, name: file.name });
        } catch (e) {
            setError(e?.response?.data?.message ?? "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) upload(file);
    };

    if (value) {
        return (
            <div className="pc-thumb-preview">
                <img src={value.url} alt="Cover" className="pc-thumb-img" />
                <div className="pc-thumb-overlay">
                    <button
                        type="button"
                        className="pc-thumb-change"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload size={13} /> Change
                    </button>
                    <button
                        type="button"
                        className="pc-thumb-remove"
                        onClick={() => onChange(null)}
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => upload(e.target.files?.[0])}
                />
            </div>
        );
    }

    return (
        <div>
            <div
                className={`pc-thumb-dropzone${dragOver ? " pc-thumb-dropzone--drag" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                {uploading ? (
                    <Loader size="sm" />
                ) : (
                    <>
                        <div className="pc-thumb-icon"><ImagePlus size={20} /></div>
                        <p className="pc-thumb-text">
                            <strong>Click to upload</strong> or drag &amp; drop
                        </p>
                        <p className="pc-thumb-sub">PNG, JPG, WebP · Max 10MB</p>
                    </>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => upload(e.target.files?.[0])}
                />
            </div>
            {error && (
                <p className="uc-error-msg" style={{ marginTop: 6 }}>
                    <AlertCircle size={12} />{error}
                </p>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   SECTION HEADER HELPER
───────────────────────────────────────────────────────────── */
export function SectionTitle({ icon: Icon, children }) {
    return (
        <div className="uc-section-title">
            {Icon && <Icon size={13} />}
            {children}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────────── */
export const STATUS_META = {
    DRAFT: { label: "Draft", color: "#6b7280", bg: "var(--bg-tertiary)" },
    PENDING: { label: "Pending Review", color: "#d97706", bg: "#fef3c7" },
    PUBLISHED: { label: "Published", color: "#16a34a", bg: "#f0fdf4" },
    SCHEDULED: { label: "Scheduled", color: "#7c3aed", bg: "#f5f3ff" },
    ARCHIVED: { label: "Archived", color: "#9ca3af", bg: "var(--bg-tertiary)" },
};

// Used for filtering
export const STATUS_CONFIG = {
    DRAFT:     { label: "Draft",     color: "#6b7280", bg: "#f3f4f6",  icon: CircleDashed  },
    PENDING:   { label: "Pending",   color: "#d97706", bg: "#fef3c7",  icon: Timer         },
    APPROVED:  { label: "Approved",  color: "#0891b2", bg: "#e0f2fe",  icon: CheckCircle2  },
    PUBLISHED: { label: "Published", color: "#16a34a", bg: "#f0fdf4",  icon: CheckCircle2  },
    SCHEDULED: { label: "Scheduled", color: "#7c3aed", bg: "#f5f3ff",  icon: Calendar      },
    REJECTED:  { label: "Rejected",  color: "#dc2626", bg: "#fef2f2",  icon: AlertCircle   },
    ARCHIVED:  { label: "Archived",  color: "#9ca3af", bg: "#f9fafb",  icon: Archive       },
};

// Used for filtering
export const SORT_OPTIONS = [
    { value: "createdAt",   label: "Date Created"   },
    { value: "publishedAt", label: "Date Published"  },
    { value: "updatedAt",   label: "Last Updated"    },
    { value: "title",       label: "Title (A–Z)"     },
    { value: "readingTime", label: "Reading Time"    },
    { value: "wordCount",   label: "Word Count"      },
];

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────────── */
export function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
    const Icon = cfg.icon;
    return (
        <span className="pg-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
            <Icon size={10} />
            {cfg.label}
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────────── */
export function Avatar({ author, size = 28 }) {
    const [err, setErr] = useState(false);
    if (author?.avatarUrl && !err) {
        return (
            <img
                src={author.avatarUrl}
                alt={author.name}
                className="pg-avatar"
                style={{ width: size, height: size }}
                onError={() => setErr(true)}
            />
        );
    }
    return (
        <span className="pg-avatar pg-avatar--fallback" style={{ width: size, height: size, fontSize: size * 0.36 }}>
            {getInitials(author?.name)}
        </span>
    );
}