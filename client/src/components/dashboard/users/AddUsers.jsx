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
    Eye,
    EyeOff,
    CheckCircle2,
} from "lucide-react";
import DashboardBox from "@/components/ui/DashboardBox";
import ValidationToast from "@/components/ui/ValidationToast";
import Loader from "@/components/ui/Loader";
import api from "@/api/api";
import { createUser } from "@/api/userApi";
import useAuthStore from "@/store/authStore";
import { getAllRoles } from "@/actions/role.action";

const AddUser = () => {
    const { user: currentUser } = useAuthStore();
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [roles, setRoles] = useState([]);
    const isAdmin = currentUser?.role.toUpperCase() === "ADMIN";

    /* ── form state ── */
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [bio, setBio] = useState("");
    const [website, setWebsite] = useState("");
    const [twitter, setTwitter] = useState("");
    const [github, setGithub] = useState("");
    const [roleId, setRoleId] = useState("");

    /* ── avatar state ── */
    const [avatarFile, setAvatarFile] = useState(null);       // File object
    const [avatarPreview, setAvatarPreview] = useState(null); // blob URL
    const [avatarUrl, setAvatarUrl] = useState("");           // final Cloudinary URL
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarUploaded, setAvatarUploaded] = useState(false);
    const [avatarError, setAvatarError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    /* ── ui state ── */
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchRoles = async () => {
            const data = await getAllRoles();
            setRoles(data);
        };
        fetchRoles();
    }, []);

    /* ── password strength ── */
    const getPasswordStrength = (pw) => {
        if (!pw) return { score: 0, label: "", color: "" };
        let score = 0;
        if (pw.length >= 8) score++;
        if (pw.length >= 12) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
        if (score <= 2) return { score, label: "Fair", color: "#f97316" };
        if (score <= 3) return { score, label: "Good", color: "#eab308" };
        if (score <= 4) return { score, label: "Strong", color: "#22c55e" };
        return { score, label: "Very strong", color: "#16a34a" };
    };
    const pwStrength = getPasswordStrength(password);

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
        const preview = URL.createObjectURL(file);
        setAvatarPreview(preview);
    }, []);

    const handleFileChange = (e) => {
        processAvatarFile(e.target.files?.[0]);
        // reset so same file can be re-selected
        e.target.value = "";
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        processAvatarFile(e.dataTransfer.files?.[0]);
    }, [processAvatarFile]);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    const handleRemoveAvatar = () => {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatarUrl("");
        setAvatarUploaded(false);
        setAvatarError(null);
    };

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
            const msg = err?.response?.data?.message ?? err.message ?? "Avatar upload failed.";
            setAvatarError(msg);
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
        if (!email.trim()) {
            e.email = "Email is required.";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) e.email = "Invalid email format.";
        }
        if (!password) {
            e.password = "Password is required.";
        } else if (password.length < 8) {
            e.password = "Password must be at least 8 characters.";
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
            // Step 1 — upload avatar first if a file was selected but not yet uploaded
            let finalAvatarUrl = avatarUrl;
            if (avatarFile && !avatarUploaded) {
                finalAvatarUrl = await uploadAvatar();
                if (!finalAvatarUrl) {
                    // uploadAvatar already set avatarError; stop form submission
                    setLoading(false);
                    return;
                }
            }

            // Step 2 — create the user
            const payload = {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password,
                bio: bio.trim() || null,
                website: website.trim() || null,
                twitter: twitter.trim() || null,
                github: github.trim() || null,
                avatarUrl: finalAvatarUrl || null,
            };

            if (isAdmin && roleId) payload.roleId = roleId;

            const data = await createUser(payload);

            if (data.success) {
                setToast({ type: "success", message: "User created successfully." });
                router.refresh();
                setTimeout(() => router.back(), 1500);
            } else {
                setToast({ type: "error", message: data?.message ?? "User creation failed." });
            }
        } catch (err) {
            setToast({ type: "error", message: err?.message ?? "User creation failed." });
        } finally {
            setLoading(false);
        }
    };

    /* ── helpers ── */
    const fieldClass = (key) =>
        `form-input uc-input${errors[key] ? " uc-input--error" : ""}`;

    return (
        <>
            <DashboardBox
                title="Create User"
                description="Add a new user to your blog"
            />

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>

                {toast && <ValidationToast type={toast.type} message={toast.message} />}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="uc-card">

                        {/* ══ SECTION: Avatar ══ */}
                        <div className="uc-field">
                            <p className="uc-section-title" style={{ marginBottom: 10 }}>
                                <ImagePlus size={13} />
                                Profile Avatar
                                <span style={{ color: "var(--text-muted)", fontWeight: "var(--font-regular)", fontSize: "var(--text-xs)", marginLeft: 4 }}>
                                    (optional)
                                </span>
                            </p>

                            {!avatarPreview ? (
                                /* Drop zone */
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
                                    <div className="uc-dropzone-icon">
                                        <Upload size={20} />
                                    </div>
                                    <p className="uc-dropzone-text">
                                        <strong>Click to upload</strong> or drag &amp; drop
                                    </p>
                                    <p className="uc-dropzone-sub">PNG, JPG, GIF, WEBP — max 10 MB</p>
                                </div>
                            ) : (
                                /* Preview + upload button */
                                <div>
                                    <div className="uc-avatar-card">
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar preview"
                                            className="uc-avatar-img"
                                        />
                                        <div className="uc-avatar-info">
                                            <p className="uc-avatar-filename">{avatarFile?.name}</p>
                                            <p className="uc-avatar-filesize">
                                                {avatarFile ? (avatarFile.size / 1024).toFixed(1) + " KB" : ""}
                                            </p>
                                        </div>
                                        <div className="uc-avatar-actions">
                                            {avatarUploaded ? (
                                                <span className="uc-avatar-success-badge">
                                                    <CheckCircle2 size={11} /> Uploaded
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="uc-avatar-upload-btn"
                                                    onClick={uploadAvatar}
                                                    disabled={avatarUploading}
                                                >
                                                    {avatarUploading ? (
                                                        <><Loader size="sm" /> Uploading…</>
                                                    ) : (
                                                        <><Upload size={12} /> Upload</>
                                                    )}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="uc-avatar-remove-btn"
                                                onClick={handleRemoveAvatar}
                                                title="Remove"
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
                                            ? "Avatar will be attached to this user's profile."
                                            : "Click Upload to send to the server, or it will be uploaded automatically on save."}
                                    </p>
                                </div>
                            )}

                            {avatarError && !avatarPreview && (
                                <p className="uc-avatar-error">
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
                                    <label className="uc-label" htmlFor="cu-name">
                                        Name <span>*</span>
                                    </label>
                                    <input
                                        id="cu-name"
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
                                    <label className="uc-label" htmlFor="cu-email">
                                        Email <span>*</span>
                                    </label>
                                    <input
                                        id="cu-email"
                                        type="email"
                                        className={fieldClass("email")}
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                                        placeholder="user@example.com"
                                        autoComplete="off"
                                    />
                                    {errors.email && <p className="uc-error-msg"><AlertCircle size={12} />{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div className="uc-field uc-full">
                                    <label className="uc-label" htmlFor="cu-password">
                                        Password <span>*</span>
                                    </label>
                                    <div className="uc-pw-wrap">
                                        <input
                                            id="cu-password"
                                            type={showPassword ? "text" : "password"}
                                            className={`form-input uc-input${errors.password ? " uc-input--error" : ""}`}
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                                            placeholder="Min. 8 characters"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="uc-pw-toggle"
                                            onClick={() => setShowPassword((v) => !v)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {password && (
                                        <div className="uc-pw-strength">
                                            <div className="uc-pw-strength-track">
                                                <div
                                                    className="uc-pw-strength-fill"
                                                    style={{
                                                        width: `${(pwStrength.score / 5) * 100}%`,
                                                        background: pwStrength.color,
                                                    }}
                                                />
                                            </div>
                                            <p className="uc-pw-strength-label" style={{ color: pwStrength.color }}>
                                                {pwStrength.label}
                                            </p>
                                        </div>
                                    )}
                                    {errors.password && <p className="uc-error-msg"><AlertCircle size={12} />{errors.password}</p>}
                                </div>

                                {/* Bio */}
                                <div className="uc-field uc-full">
                                    <label className="uc-label" htmlFor="cu-bio">
                                        Bio{" "}
                                        <span style={{ color: "var(--text-muted)", fontWeight: "var(--font-regular)", fontSize: "var(--text-xs)" }}>
                                            ({bio.length}/500)
                                        </span>
                                    </label>
                                    <textarea
                                        id="cu-bio"
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
                                    <label className="uc-label" htmlFor="cu-website">Website</label>
                                    <div className="uc-input-wrap">
                                        <span className="uc-prefix"><Globe size={14} /></span>
                                        <input
                                            id="cu-website"
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
                                    <label className="uc-label" htmlFor="cu-twitter">Twitter / X</label>
                                    <div className="uc-input-wrap">
                                        <span className="uc-prefix"><Twitter size={14} /></span>
                                        <input
                                            id="cu-twitter"
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
                                    <label className="uc-label" htmlFor="cu-github">GitHub</label>
                                    <div className="uc-input-wrap">
                                        <span className="uc-prefix"><Github size={14} /></span>
                                        <input
                                            id="cu-github"
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
                        {isAdmin && roles.length > 0 && (
                            <div className="uc-section">
                                <p className="uc-section-title">
                                    <Shield size={13} />
                                    Role
                                    <span className="uc-admin-only-badge">
                                        <Shield size={9} /> Admin only
                                    </span>
                                </p>

                                <div className="uc-grid">
                                    <div className="uc-field">
                                        <label className="uc-label" htmlFor="cu-role">Assign Role</label>
                                        <div className="uc-select-wrap">
                                            <select
                                                id="cu-role"
                                                className="form-input uc-input"
                                                value={roleId}
                                                onChange={(e) => setRoleId(e.target.value)}
                                            >
                                                <option value="">— Default (user) —</option>
                                                {roles.map((r) => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={15} className="uc-chevron" />
                                        </div>
                                        <p className="uc-hint">
                                            Leave empty to assign the default "user" role.
                                        </p>
                                    </div>
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
                                style={{ minWidth: 140 }}
                            >
                                {loading ? (
                                    <><Loader size="sm" /> Creating…</>
                                ) : (
                                    "Create User"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddUser;