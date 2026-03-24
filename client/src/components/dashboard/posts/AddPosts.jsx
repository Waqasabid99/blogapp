"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle, ChevronDown, Tag, FolderOpen,
    ImagePlus, BookOpen, Eye, Save, Send,
    Layers, Info, Clock, FileText,
    ChevronRight, PanelRight, PanelRightClose,
    Globe, Star, Pin
} from "lucide-react";
import ValidationToast from "@/components/ui/ValidationToast";
import { createPost } from "@/api/postApi";
import useEditorJs from "@/constants/Editor";
import { CategorySelector, SectionTitle, STATUS_META, TagSelector, ThumbnailUploader } from "@/constants/utils";
import { STYLES } from "@/app/styles/postStyles";
import Loader from "@/components/ui/Loader";
import useAuthStore from "@/store/authStore";

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const AddPost = ({ categories = [], tags = [], series = [] }) => {
    const router = useRouter();
    const { user } = useAuthStore();

    /* ── Form State ── */
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState(null);
    const [thumbnail, setThumbnail] = useState(null); // { id, url, name }
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedSeries, setSelectedSeries] = useState("");
    const [status, setStatus] = useState("DRAFT");
    const [isFeatured, setIsFeatured] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [scheduledAt, setScheduledAt] = useState("");

    /* ── SEO State ── */
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");

    /* ── UI State ── */
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("details"); // details | seo
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [toast, setToast] = useState(null);
    const [wordCount, setWordCount] = useState(0);
    const [readTime, setReadTime] = useState(0);

    /* ── Editor ── */
    const onContentChange = useCallback((data) => {
        setContent(data);
        // Estimate word count
        const text = data.blocks
            ?.map((b) => b?.data?.text || b?.data?.items?.join(" ") || "")
            .join(" ") ?? "";
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(words);
        setReadTime(Math.max(1, Math.ceil(words / 238)));
    }, []);

    const { ready: editorReady } = useEditorJs("pc-editor-holder", onContentChange);

    /* ── Sync title to meta title ── */
    useEffect(() => {
        if (!metaTitle) setMetaTitle(title);
    }, [title]);

    /* ── Validation ── */
    const validate = () => {
        const e = {};
        if (!title.trim()) e.title = "Title is required.";
        if (!content || !content.blocks || content.blocks.length === 0)
            e.content = "Post content cannot be empty.";
        return e;
    };

    /* ── Helpers ── */
    const buildPayload = (overrideStatus) => ({
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        coverImageId: thumbnail?.id ?? null,
        categories: selectedCategories,
        tags: selectedTags,
        seriesId: selectedSeries || null,
        status: overrideStatus ?? status,
        isFeatured,
        isPinned,
        scheduledAt: scheduledAt || undefined,
    });

    /* ── Save as Draft ── */
    const handleSaveDraft = async () => {
        if (!title.trim()) {
            setErrors({ title: "Please add a title before saving." });
            return;
        }
        setSavingDraft(true);
        try {
            const data = await createPost(buildPayload("DRAFT"));
            if (data.success) {
                setToast({ type: "success", message: "Draft saved successfully." });
                setTimeout(() => router.push(`posts/${data.data.id}/edit`), 1200);
            } else {
                setToast({ type: "error", message: data?.message ?? "Failed to save draft." });
            }
        } catch (err) {
            setToast({ type: "error", message: err?.message ?? "Failed to save draft." });
        } finally {
            setSavingDraft(false);
        }
    };

    /* ── Publish ── */
    const handleSubmit = async (e) => {
        e?.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);

        try {
            const data = await createPost(buildPayload());
            if (data.success) {
                setToast({ type: "success", message: status === "DRAFT" ? "Post saved as draft." : "Post published!" });
                setTimeout(() => router.push(`/dashboard/${user?.role}/${user?.id}/posts`), 1400);
            } else {
                setToast({ type: "error", message: data?.message ?? "Failed to create post." });
            }
        } catch (err) {
            setToast({ type: "error", message: err?.message ?? "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };

    const statusMeta = STATUS_META[status] ?? STATUS_META.DRAFT;

    return (
        <>
            <style>{STYLES}</style>

            <div className="pc-root">

                {/* ── Top Bar ── */}
                <header className="pc-topbar">
                    <div className="pc-topbar-left">
                        <button
                            type="button"
                            className="pc-sidebar-toggle"
                            onClick={() => setSidebarOpen((v) => !v)}
                            title="Toggle panel"
                        >
                            {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
                        </button>
                        <div className="pc-breadcrumb">
                            <span>Posts</span>
                            <ChevronRight size={13} />
                            <span>New Post</span>
                        </div>
                    </div>

                    <div className="pc-topbar-stats">
                        {wordCount > 0 && (
                            <>
                                <span className="pc-stat"><FileText size={12} />{wordCount} words</span>
                                <span className="pc-stat"><Clock size={12} />{readTime} min read</span>
                            </>
                        )}
                        <span
                            className="pc-status-badge"
                            style={{ background: statusMeta.bg, color: statusMeta.color }}
                        >
                            {statusMeta.label}
                        </span>
                    </div>

                    <div className="pc-topbar-actions">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => router.back()}
                            disabled={loading || savingDraft}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={handleSaveDraft}
                            disabled={loading || savingDraft}
                        >
                            {savingDraft
                                ? <Loader size="sm" text={"Saving..."} />
                                : <><Save size={13} style={{ marginRight: 5 }} />Save Draft</>
                            }
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={loading || savingDraft}
                            style={{ minWidth: 130 }}
                        >
                            {loading
                                ? <Loader size="sm" text={"Publishing.."} />
                                : <><Send size={13} style={{ marginRight: 5 }} />{status === "DRAFT" ? "Save" : "Publish"}</>
                            }
                        </button>
                    </div>
                </header>

                {/* ── Toast ── */}
                {toast && (
                    <div className="pc-toast-wrap">
                        <ValidationToast
                            type={toast.type}
                            message={toast.message}
                        />
                    </div>
                )}

                {/* ── Layout ── */}
                <div className={`pc-layout${sidebarOpen ? " pc-layout--sidebar" : ""}`}>

                    {/* ════ MAIN EDITOR AREA ════ */}
                    <main className="pc-main">
                        {/* Title */}
                        <div className="pc-title-wrap">
                            <textarea
                                className={`pc-title-input${errors.title ? " pc-title-input--error" : ""}`}
                                placeholder="Post title…"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setErrors((p) => ({ ...p, title: "" }));
                                    // Auto-resize
                                    e.target.style.height = "auto";
                                    e.target.style.height = e.target.scrollHeight + "px";
                                }}
                                rows={1}
                                maxLength={200}
                            />
                            {errors.title && (
                                <p className="uc-error-msg" style={{ marginTop: 4 }}>
                                    <AlertCircle size={12} />{errors.title}
                                </p>
                            )}
                        </div>

                        {/* Editor container */}
                        <div className={`pc-editor-wrap${errors.content ? " pc-editor-wrap--error" : ""}`}>
                            {!editorReady && (
                                <div className="pc-editor-skeleton">
                                    <div className="pc-skeleton pc-skeleton--h3" />
                                    <div className="pc-skeleton pc-skeleton--p" />
                                    <div className="pc-skeleton pc-skeleton--p pc-skeleton--short" />
                                    <div className="pc-skeleton pc-skeleton--p" />
                                </div>
                            )}
                            <div id="pc-editor-holder" className="pc-editor-inner" />
                        </div>

                        {errors.content && (
                            <p className="uc-error-msg" style={{ marginTop: 6 }}>
                                <AlertCircle size={12} />{errors.content}
                            </p>
                        )}
                    </main>

                    {/* ════ RIGHT SIDEBAR ════ */}
                    {sidebarOpen && (
                        <aside className="pc-sidebar">

                            {/* Tab Bar */}
                            <div className="pc-tabs">
                                <button
                                    type="button"
                                    className={`pc-tab${activeTab === "details" ? " pc-tab--active" : ""}`}
                                    onClick={() => setActiveTab("details")}
                                >
                                    <Layers size={13} />Details
                                </button>
                                <button
                                    type="button"
                                    className={`pc-tab${activeTab === "seo" ? " pc-tab--active" : ""}`}
                                    onClick={() => setActiveTab("seo")}
                                >
                                    <Globe size={13} />SEO
                                </button>
                            </div>

                            <div className="pc-sidebar-body">

                                {activeTab === "details" && (
                                    <>
                                        {/* ── Status ── */}
                                        <div className="pc-sidebar-section">
                                            <SectionTitle icon={Eye}>Visibility &amp; Status</SectionTitle>
                                            <div className="uc-field">
                                                <div className="uc-select-wrap">
                                                    <select
                                                        className="form-input uc-input"
                                                        value={status}
                                                        onChange={(e) => setStatus(e.target.value)}
                                                    >
                                                        <option value="DRAFT">Draft</option>
                                                        <option value="PENDING">Submit for Review</option>
                                                        <option value="PUBLISHED">Published</option>
                                                        <option value="SCHEDULED">Scheduled</option>
                                                    </select>
                                                    <ChevronDown size={13} className="uc-chevron" />
                                                </div>
                                            </div>

                                            {status === "SCHEDULED" && (
                                                <div className="uc-field" style={{ marginTop: 10 }}>
                                                    <label className="uc-label">Publish Date</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-input uc-input"
                                                        value={scheduledAt}
                                                        onChange={(e) => setScheduledAt(e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            <div className="pc-toggle-group">
                                                <label className="pc-toggle-row">
                                                    <span className="pc-toggle-info">
                                                        <Star size={13} />
                                                        <span>Featured post</span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className={`pc-toggle${isFeatured ? " pc-toggle--on" : ""}`}
                                                        onClick={() => setIsFeatured((v) => !v)}
                                                    >
                                                        <span className="pc-toggle-thumb" />
                                                    </button>
                                                </label>
                                                <label className="pc-toggle-row">
                                                    <span className="pc-toggle-info">
                                                        <Pin size={13} />
                                                        <span>Pinned post</span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className={`pc-toggle${isPinned ? " pc-toggle--on" : ""}`}
                                                        onClick={() => setIsPinned((v) => !v)}
                                                    >
                                                        <span className="pc-toggle-thumb" />
                                                    </button>
                                                </label>
                                            </div>
                                        </div>

                                        {/* ── Cover Image ── */}
                                        <div className="pc-sidebar-section">
                                            <SectionTitle icon={ImagePlus}>Cover Image</SectionTitle>
                                            <ThumbnailUploader value={thumbnail} onChange={setThumbnail} />
                                        </div>

                                        {/* ── Excerpt ── */}
                                        <div className="pc-sidebar-section">
                                            <SectionTitle icon={FileText}>Excerpt</SectionTitle>
                                            <div className="uc-field">
                                                <textarea
                                                    className="form-input uc-input uc-textarea"
                                                    value={excerpt}
                                                    onChange={(e) => setExcerpt(e.target.value)}
                                                    placeholder="Write a short summary of your post…"
                                                    rows={3}
                                                    maxLength={300}
                                                />
                                                <p className="uc-hint">
                                                    {excerpt.length}/300 · Leave blank to auto-generate.
                                                </p>
                                            </div>
                                        </div>

                                        {/* ── Categories ── */}
                                        <div className="pc-sidebar-section">
                                            <SectionTitle icon={FolderOpen}>Categories</SectionTitle>
                                            <CategorySelector
                                                allCategories={categories}
                                                selectedIds={selectedCategories}
                                                onChange={setSelectedCategories}
                                            />
                                        </div>

                                        {/* ── Tags ── */}
                                        <div className="pc-sidebar-section">
                                            <SectionTitle icon={Tag}>Tags</SectionTitle>
                                            <TagSelector
                                                allTags={tags}
                                                selectedTagIds={selectedTags}
                                                onChange={setSelectedTags}
                                            />
                                        </div>

                                        {/* ── Series ── */}
                                        {series.length > 0 && (
                                            <div className="pc-sidebar-section">
                                                <SectionTitle icon={BookOpen}>Series</SectionTitle>
                                                <div className="uc-select-wrap">
                                                    <select
                                                        className="form-input uc-input"
                                                        value={selectedSeries}
                                                        onChange={(e) => setSelectedSeries(e.target.value)}
                                                    >
                                                        <option value="">No series</option>
                                                        {series.map((s) => (
                                                            <option key={s.id} value={s.id}>{s.title}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={13} className="uc-chevron" />
                                                </div>
                                                <p className="uc-hint" style={{ marginTop: 6 }}>
                                                    Group this post with a series.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === "seo" && (
                                    <>
                                        <div className="pc-sidebar-section">
                                            <SectionTitle icon={Globe}>Search Engine Preview</SectionTitle>

                                            <div className="pc-seo-preview">
                                                <p className="pc-seo-url">yoursite.com/blog/{title
                                                    ? title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 50)
                                                    : "post-slug"
                                                }</p>
                                                <p className="pc-seo-title">{metaTitle || title || "Post title"}</p>
                                                <p className="pc-seo-desc">{metaDescription || excerpt || "Post excerpt will appear here…"}</p>
                                            </div>

                                            <div className="uc-field" style={{ marginTop: 16 }}>
                                                <label className="uc-label">SEO Title</label>
                                                <input
                                                    type="text"
                                                    className="form-input uc-input"
                                                    value={metaTitle}
                                                    onChange={(e) => setMetaTitle(e.target.value)}
                                                    placeholder={title || "SEO title…"}
                                                    maxLength={70}
                                                />
                                                <p className="uc-hint">{metaTitle.length}/70 characters</p>
                                            </div>

                                            <div className="uc-field" style={{ marginTop: 12 }}>
                                                <label className="uc-label">Meta Description</label>
                                                <textarea
                                                    className="form-input uc-input uc-textarea"
                                                    value={metaDescription}
                                                    onChange={(e) => setMetaDescription(e.target.value)}
                                                    placeholder="Brief description for search engines…"
                                                    rows={3}
                                                    maxLength={160}
                                                />
                                                <p className={`uc-hint${metaDescription.length > 150 ? " pc-char-warn" : ""}`}>
                                                    {metaDescription.length}/160 characters
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pc-sidebar-section">
                                            <div className="pc-seo-checklist">
                                                <p className="pc-seo-check-title"><Info size={12} />SEO Checklist</p>
                                                {[
                                                    { pass: title.length >= 10 && title.length <= 70, label: "Title is 10–70 characters" },
                                                    { pass: title.length > 0, label: "Title is not empty" },
                                                    { pass: (excerpt || metaDescription).length >= 50, label: "Description is 50+ characters" },
                                                    { pass: !!thumbnail, label: "Cover image is set" },
                                                    { pass: selectedCategories.length > 0, label: "At least one category selected" },
                                                    { pass: selectedTags.length > 0, label: "At least one tag added" },
                                                    { pass: wordCount >= 300, label: "Post is 300+ words" },
                                                ].map((item, i) => (
                                                    <div key={i} className={`pc-seo-check-item${item.pass ? " pc-seo-check-item--pass" : ""}`}>
                                                        <span className="pc-seo-check-dot" />
                                                        {item.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </>
    );
};

export default AddPost;