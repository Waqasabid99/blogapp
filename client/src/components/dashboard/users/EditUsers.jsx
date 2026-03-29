"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ChevronDown,
    Shield,
    User,
    Globe,
    Github,
    Twitter,
    Upload,
    X,
    ImagePlus,
    CheckCircle2,
} from "lucide-react";
import DashboardBox from "@/components/ui/DashboardBox";
import ValidationToast from "@/components/ui/ValidationToast";
import Loader from "@/components/ui/Loader";
import api from "@/api/api";
import { updateUser } from "@/api/userApi";
import useAuthStore from "@/store/authStore";
import { getUserById } from "@/actions/user.action";
import { getAllRoles } from "@/actions/role.action";

const EditUser = ({ userId }) => {
    const { user: currentUser } = useAuthStore();
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [roles, setRoles] = useState([]);
    const [user, setUser] = useState(null);
    const isAdmin = currentUser?.role.toUpperCase() === "ADMIN";

    /* ── form state ── */
    const [name, setName] = useState(user?.name ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [bio, setBio] = useState(user?.bio ?? "");
    const [website, setWebsite] = useState(user?.website ?? "");
    const [twitter, setTwitter] = useState(user?.twitter ?? "");
    const [github, setGithub] = useState(user?.github ?? "");
    const [roleId, setRoleId] = useState(user?.role?.id ?? "");

    /* ── avatar state ── */
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarUploaded, setAvatarUploaded] = useState(false);
    const [avatarError, setAvatarError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    /* ── ui state ── */
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const [user, roles] = await Promise.all([
                getUserById(userId),
                getAllRoles(),
            ])
            console.log("Edit Page : ", user, roles);
            setUser(user);
            setRoles(roles);
        }
        fetchData();
    }, [userId]);

    /* ── avatar handlers ── */
    const processAvatarFile = useCallback((file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setAvatarError("Only image files are allowed.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setAvatarError("Image must be under 10 MB.");
            return;
        }
        setAvatarError(null);
        setAvatarUploaded(false);
        setAvatarUrl("");
        setAvatarFile(file);
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(URL.createObjectURL(file));
    }, [avatarPreview]);

    const handleFileChange = (e) => {
        processAvatarFile(e.target.files?.[0]);
        e.target.value = "";
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        processAvatarFile(e.dataTransfer.files?.[0]);
    }, [processAvatarFile]);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    /* Remove avatar entirely — clears both existing URL and any new file */
    const handleRemoveAvatar = () => {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatarUrl("");
        setAvatarUploaded(false);
        setAvatarError(null);
    };

    /* Upload the picked file to /media/upload, store returned CDN URL */
    const uploadAvatar = async () => {
        if (!avatarFile) return null;
        setAvatarUploading(true);
        setAvatarError(null);
        try {
            const formData = new FormData();
            formData.append("file", avatarFile);

            const { data } = await api.post("/media/upload", formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (!data.success) throw new Error(data?.message ?? "Upload failed.");
            const url = data.data?.media?.url ?? data.data?.cloudinaryData?.url ?? data.url;
            setAvatarUrl(url);
            setAvatarUploaded(true);
            return url;
        } catch (err) {
            setAvatarError(err?.response?.data?.message ?? err.message ?? "Avatar upload failed.");
            return null;
        } finally {
            setAvatarUploading(false);
        }
    };

    /* ── validation ── */
    const validate = () => {
        const e = {};
        if (!name.trim()) e.name = "Name is required.";
        if (name.trim().length > 100) e.name = "Name must not exceed 100 characters.";
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) e.email = "Invalid email format.";
        }
        if (bio && bio.length > 500) e.bio = "Bio must not exceed 500 characters.";
        if (website && !/^https?:\/\/.+/.test(website))
            e.website = "Website must start with http:// or https://";
        return e;
    };

    /* ── submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);

        try {
            // If a new file was picked but not manually uploaded yet, do it now
            let finalAvatarUrl = avatarUrl;
            if (avatarFile && !avatarUploaded) {
                finalAvatarUrl = await uploadAvatar();
                if (!finalAvatarUrl) { setLoading(false); return; }
            }

            const payload = {
                name: name.trim(),
                email: email.trim() || undefined,
                bio: bio.trim() || null,
                website: website.trim() || null,
                twitter: twitter.trim() || null,
                github: github.trim() || null,
                avatarUrl: finalAvatarUrl || null,
            };

            if (isAdmin && roleId) payload.roleId = roleId;

            const data = await updateUser(user.id, payload);

            if (data.success) {
                setToast({ type: "success", message: "User updated successfully." });
                router.refresh();
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

    /* ── helpers ── */
    const fieldClass = (key) =>
        `form-input uc-input${errors[key] ? " uc-input--error" : ""}`;

    const getRoleBadgeStyle = (slug) => {
        const map = {
            admin: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
            editor: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
            author: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
            user: { bg: "var(--bg-tertiary)", color: "var(--text-muted)", border: "var(--border-light)" },
        };
        return map[slug] || map.user;
    };

    const badgeStyle = getRoleBadgeStyle(user?.role?.slug);

    /* Derived avatar display state */
    const hasNewFile = !!avatarFile;
    const hasExistingUrl = !avatarFile && !!avatarUrl;
    const isEmpty = !avatarFile && !avatarUrl;

    return (
        <>
            <DashboardBox
                title="Edit User"
                description={`Updating profile for "${user?.name}"`}
            />

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>

                {toast && <ValidationToast type={toast.type} message={toast.message} />}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="uc-card">

                        {/* ── Meta strip ── */}
                        <div className="uc-meta-row">
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">ID</span>
                                <span className="uc-meta-val">{user?.id}</span>
                            </div>
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Joined</span>
                                <span className="uc-meta-val">
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric", month: "short", day: "numeric",
                                        })
                                        : "—"}
                                </span>
                            </div>
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Last Updated</span>
                                <span className="uc-meta-val">
                                    {user?.updatedAt
                                        ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                                            year: "numeric", month: "short", day: "numeric",
                                        })
                                        : "—"}
                                </span>
                            </div>
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Current Role</span>
                                <span
                                    className="uc-role-badge"
                                    style={{
                                        background: badgeStyle.bg,
                                        color: badgeStyle.color,
                                        border: `1px solid ${badgeStyle.border}`,
                                    }}
                                >
                                    {user?.role?.name ?? "—"}
                                </span>
                            </div>
                        </div>

                        {/* ══ SECTION: Avatar ══ */}
                        <div className="uc-section">
                            <p className="uc-section-title">
                                <ImagePlus size={13} />
                                Profile Avatar
                            </p>

                            {/* ── State 1: nothing at all → drop zone ── */}
                            {isEmpty && (
                                <div
                                    className={`uc-dropzone${isDragging ? " uc-dropzone--drag" : ""}`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                    />
                                    <div className="uc-dropzone-icon"><Upload size={20} /></div>
                                    <p className="uc-dropzone-text">
                                        <strong>Click to upload</strong> or drag &amp; drop
                                    </p>
                                    <p className="uc-dropzone-sub">PNG, JPG, GIF, WEBP — max 10 MB</p>
                                </div>
                            )}

                            {/* ── State 2: existing saved URL, no new file ── */}
                            {hasExistingUrl && (
                                <>
                                    <div className="uc-avatar-card">
                                        <img src={avatarUrl} alt="Current avatar" className="uc-avatar-img" />
                                        <div className="uc-avatar-info">
                                            <p className="uc-avatar-filename">Current avatar</p>
                                            <p className="uc-avatar-meta" style={{
                                                whiteSpace: "nowrap", overflow: "hidden",
                                                textOverflow: "ellipsis", maxWidth: 240,
                                            }}>
                                                {avatarUrl}
                                            </p>
                                        </div>
                                        <div className="uc-avatar-actions">
                                            <span className="uc-avatar-saved-badge">Saved</span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: "none" }}
                                            />
                                            <button
                                                type="button"
                                                className="uc-avatar-change-btn"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload size={12} /> Change
                                            </button>
                                            <button
                                                type="button"
                                                className="uc-avatar-remove-btn"
                                                onClick={handleRemoveAvatar}
                                                title="Remove avatar"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="uc-hint" style={{ marginTop: 6 }}>
                                        Click "Change" to replace with a new image, or × to remove it entirely.
                                    </p>
                                </>
                            )}

                            {/* ── State 3: new file picked (blob preview) ── */}
                            {hasNewFile && (
                                <>
                                    {/* Hidden inputs for drag-drop and change button */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                    />
                                    <div
                                        className={`uc-avatar-card${isDragging ? " uc-dropzone--drag" : ""}`}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                    >
                                        <img src={avatarPreview} alt="New avatar preview" className="uc-avatar-img" />
                                        <div className="uc-avatar-info">
                                            <p className="uc-avatar-filename">{avatarFile?.name}</p>
                                            <p className="uc-avatar-meta">
                                                {avatarFile
                                                    ? `${(avatarFile.size / 1024).toFixed(1)} KB · new file`
                                                    : ""}
                                            </p>
                                        </div>
                                        <div className="uc-avatar-actions">
                                            {avatarUploaded ? (
                                                <span className="uc-avatar-success-badge">
                                                    <CheckCircle2 size={11} /> Uploaded
                                                </span>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="uc-avatar-upload-btn"
                                                        onClick={uploadAvatar}
                                                        disabled={avatarUploading}
                                                    >
                                                        {avatarUploading
                                                            ? <><Loader size="sm" /> Uploading…</>
                                                            : <><Upload size={12} /> Upload</>}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="uc-avatar-change-btn"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={avatarUploading}
                                                    >
                                                        Change
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                type="button"
                                                className="uc-avatar-remove-btn"
                                                onClick={handleRemoveAvatar}
                                                title="Remove"
                                                disabled={avatarUploading}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    {avatarError && (
                                        <p className="uc-avatar-error">
                                            <AlertCircle size={12} /> {avatarError}
                                        </p>
                                    )}
                                    <p className="uc-hint" style={{ marginTop: 6 }}>
                                        {avatarUploaded
                                            ? "New avatar ready — will be saved when you submit."
                                            : "Click Upload now, or it will upload automatically when you save."}
                                    </p>
                                </>
                            )}

                            {/* Drop zone error shown before any file is set */}
                            {avatarError && isEmpty && (
                                <p className="uc-avatar-error" style={{ marginTop: 6 }}>
                                    <AlertCircle size={12} /> {avatarError}
                                </p>
                            )}
                        </div>

                        {/* ══ SECTION: Basic Info ══ */}
                        <div className="uc-section">
                            <p className="uc-section-title">
                                <User size={13} />
                                Basic Information
                            </p>

                            <div className="uc-grid">

                                {/* Name */}
                                <div className="uc-field">
                                    <label className="uc-label" htmlFor="u-name">
                                        Name <span>*</span>
                                    </label>
                                    <input
                                        id="u-name"
                                        type="text"
                                        className={fieldClass("name")}
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                                        placeholder="e.g. John Doe"
                                        autoComplete="off"
                                        autoFocus
                                        maxLength={100}
                                    />
                                    {errors.name && <p className="uc-error-msg"><AlertCircle size={12} />{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div className="uc-field">
                                    <label className="uc-label" htmlFor="u-email">Email</label>
                                    <input
                                        id="u-email"
                                        type="email"
                                        className={fieldClass("email")}
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                                        placeholder="user@example.com"
                                        autoComplete="off"
                                    />
                                    {errors.email && <p className="uc-error-msg"><AlertCircle size={12} />{errors.email}</p>}
                                </div>

                                {/* Bio */}
                                <div className="uc-field uc-full">
                                    <label className="uc-label" htmlFor="u-bio">
                                        Bio{" "}
                                        <span style={{ color: "var(--text-muted)", fontWeight: "var(--font-regular)", fontSize: "var(--text-xs)" }}>
                                            ({bio.length}/500)
                                        </span>
                                    </label>
                                    <textarea
                                        id="u-bio"
                                        className={`form-input uc-input uc-textarea${errors.bio ? " uc-input--error" : ""}`}
                                        value={bio}
                                        onChange={(e) => { setBio(e.target.value); setErrors((p) => ({ ...p, bio: "" })); }}
                                        placeholder="A short bio about this user…"
                                        rows={3}
                                        maxLength={500}
                                    />
                                    {errors.bio && <p className="uc-error-msg"><AlertCircle size={12} />{errors.bio}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ══ SECTION: Social & Web ══ */}
                        <div className="uc-section">
                            <p className="uc-section-title">
                                <Globe size={13} />
                                Social &amp; Web
                            </p>

                            <div className="uc-grid">

                                {/* Website */}
                                <div className="uc-field">
                                    <label className="uc-label" htmlFor="u-website">Website</label>
                                    <div className="uc-input-wrap">
                                        <span className="uc-prefix"><Globe size={14} /></span>
                                        <input
                                            id="u-website"
                                            type="url"
                                            className={fieldClass("website")}
                                            value={website}
                                            onChange={(e) => { setWebsite(e.target.value); setErrors((p) => ({ ...p, website: "" })); }}
                                            placeholder="https://yoursite.com"
                                            autoComplete="off"
                                        />
                                    </div>
                                    {errors.website && <p className="uc-error-msg"><AlertCircle size={12} />{errors.website}</p>}
                                </div>

                                {/* Twitter */}
                                <div className="uc-field">
                                    <label className="uc-label" htmlFor="u-twitter">Twitter / X</label>
                                    <div className="uc-input-wrap">
                                        <span className="uc-prefix"><Twitter size={14} /></span>
                                        <input
                                            id="u-twitter"
                                            type="text"
                                            className="form-input uc-input"
                                            value={twitter}
                                            onChange={(e) => setTwitter(e.target.value)}
                                            placeholder="@username"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                {/* GitHub */}
                                <div className="uc-field">
                                    <label className="uc-label" htmlFor="u-github">GitHub</label>
                                    <div className="uc-input-wrap">
                                        <span className="uc-prefix"><Github size={14} /></span>
                                        <input
                                            id="u-github"
                                            type="text"
                                            className="form-input uc-input"
                                            value={github}
                                            onChange={(e) => setGithub(e.target.value)}
                                            placeholder="username"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ══ SECTION: Role (Admin only) ══ */}
                        {isAdmin && roles?.length > 0 && (
                            <div className="uc-section">
                                <p className="uc-section-title">
                                    <Shield size={13} />
                                    Role &amp; Permissions
                                    <span className="uc-admin-only-badge">
                                        <Shield size={9} /> Admin only
                                    </span>
                                </p>

                                <div className="uc-grid">
                                    <div className="uc-field">
                                        <label className="uc-label" htmlFor="u-role">Assign Role</label>
                                        <div className="uc-select-wrap">
                                            <select
                                                id="u-role"
                                                className="form-input uc-input"
                                                value={roleId}
                                                onChange={(e) => setRoleId(e.target.value)}
                                            >
                                                <option value="">— Select role —</option>
                                                {roles.map((r) => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={15} className="uc-chevron" />
                                        </div>
                                        <p className="uc-hint">Changing the role updates what this user can do.</p>
                                    </div>

                                    {user?.role?.permissions?.length > 0 && (
                                        <div className="uc-field">
                                            <p className="uc-label">Current Permissions</p>
                                            <div className="uc-perms-wrap">
                                                {user.role.permissions.map((p, i) => (
                                                    <span key={i} className="uc-perm-chip">
                                                        {p.permission?.action}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                                disabled={loading || avatarUploading}
                                style={{ minWidth: 130 }}
                            >
                                {loading ? <><Loader size="sm" /> Saving…</> : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditUser;