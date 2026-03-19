"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle, ChevronDown, Tag, FolderOpen,
    ImagePlus, BookOpen, Eye, Save, Send,
    Layers, Info, Clock, FileText,
    ChevronRight, PanelRight, PanelRightClose,
    Globe, Star, Pin, History, RefreshCw, Loader2,
    CheckCircle2, AlertTriangle
} from "lucide-react";
import ValidationToast from "@/components/ui/ValidationToast";
import api from "@/api/api";
import useEditorJs from "@/constants/Editor";
import { CategorySelector, SectionTitle, STATUS_META, TagSelector, ThumbnailUploader } from "@/constants/utils";
import { STYLES } from "@/app/styles/postStyles";
import Loader from "@/components/ui/Loader";
import { formatDate, formatRelativeTime } from "@/constants/helpers";

const EditPost = ({ postId, categories = [], tags = [], series = [] }) => {
    const router = useRouter();

    /* ── Original post data (for dirty-tracking) ── */
    const originalRef = useRef(null);

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
    const [activeTab, setActiveTab] = useState("details");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [fetchingPost, setFetchingPost] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [toast, setToast] = useState(null);
    const [wordCount, setWordCount] = useState(0);
    const [readTime, setReadTime] = useState(0);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    /* ── Editor ── */
    const onContentChange = useCallback((data) => {
        setContent(data);
        const text = data.blocks
            ?.map((b) => b?.data?.text || b?.data?.items?.join(" ") || "")
            .join(" ") ?? "";
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(words);
        setReadTime(Math.max(1, Math.ceil(words / 238)));
        setIsDirty(true);
    }, []);

    const { ready: editorReady, editorRef: editor } = useEditorJs("pc-editor-holder", onContentChange, !fetchingPost && !fetchError);

    /* ── Auto-dismiss toast ── */
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    /* ── Fetch post on mount ── */
    useEffect(() => {
        if (!postId) return;

        const fetchPost = async () => {
            setFetchingPost(true);
            setFetchError(null);
            try {
                const { data } = await api.get(`/post/postId/${postId}`, { withCredentials: true });
                if (!data.success) throw new Error(data.message ?? "Failed to load post.");

                const post = data.data;
                originalRef.current = post;

                /* Populate form fields */
                setTitle(post.title ?? "");
                setExcerpt(post.excerpt ?? "");
                setStatus(post.status ?? "DRAFT");
                setIsFeatured(post.isFeatured ?? false);
                setIsPinned(post.isPinned ?? false);
                setScheduledAt(
                    post.scheduledAt
                        ? new Date(post.scheduledAt).toISOString().slice(0, 16)
                        : ""
                );
                setSelectedCategories(
                    (post.categories ?? []).map((c) => c.category?.id ?? c.categoryId ?? c.id).filter(Boolean)
                );
                setSelectedTags(
                    (post.tags ?? []).map((t) => t.tag?.id ?? t.tagId ?? t.id).filter(Boolean)
                );
                setSelectedSeries(post.seriesId ?? "");

                if (post.coverImage) {
                    setThumbnail({ id: post.coverImage.id, url: post.coverImage.url, name: post.coverImage.altText ?? "Cover image" });
                }

                /* SEO */
                if (post.seo) {
                    setMetaTitle(post.seo.metaTitle ?? "");
                    setMetaDescription(post.seo.metaDescription ?? "");
                }

                /* Word count from stored value */
                if (post.wordCount) {
                    setWordCount(post.wordCount);
                    setReadTime(post.readingTime ?? Math.max(1, Math.ceil(post.wordCount / 238)));
                }

                /* Hydrate editor with existing content */
                if (editorReady && editor.current && post.content) {
                    editor.current.render(post.content);
                    setContent(post.content);
                }

                setLastSaved(post.updatedAt ? new Date(post.updatedAt) : null);
                setIsDirty(false);
            } catch (err) {
                setFetchError(err?.response?.data?.message ?? err.message ?? "Failed to load post.");
            } finally {
                setFetchingPost(false);
            }
        };

        fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId, editorReady]);

    /* ── Hydrate editor once it becomes ready (if data already fetched) ── */
useEffect(() => {
    if (editorReady && editor.current && originalRef.current?.content && !content) {
        editor.current.render(originalRef.current.content);
        setContent(originalRef.current.content);
    }
}, [editorReady]);

    /* ── Sync title → meta title (only if user hasn't touched meta title) ── */
    useEffect(() => {
        if (!metaTitle || metaTitle === originalRef.current?.title) {
            setMetaTitle(title);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title]);

    /* ── Mark dirty when key fields change (after initial load) ── */
    useEffect(() => {
        if (!originalRef.current) return;
        setIsDirty(true);
    }, [title, excerpt, selectedCategories, selectedTags, selectedSeries, status, isFeatured, isPinned, scheduledAt, thumbnail, metaTitle, metaDescription]);

    /* ── Warn on unsaved changes ── */
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    /* ── Validation ── */
    const validate = () => {
        const e = {};
        if (!title.trim()) e.title = "Title is required.";
        if (!content || !content.blocks || content.blocks.length === 0)
            e.content = "Post content cannot be empty.";
        return e;
    };

    /* ── Payload builder ── */
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
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
    });

    /* ── Save as Draft ── */
    const handleSaveDraft = async () => {
        if (!title.trim()) {
            setErrors({ title: "Please add a title before saving." });
            return;
        }
        setSavingDraft(true);
        try {
            const { data } = await api.put(`/post/${postId}`, buildPayload("DRAFT"), { withCredentials: true });
            if (data.success) {
                setToast({ type: "success", message: "Draft saved successfully." });
                setLastSaved(new Date());
                setIsDirty(false);
            }
        } catch (err) {
            setToast({ type: "error", message: err?.response?.data?.message ?? "Failed to save draft." });
        } finally {
            setSavingDraft(false);
        }
    };

    /* ── Update / Publish ── */
    const handleSubmit = async (e) => {
        e?.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);

        try {
            const { data } = await api.put(`/post/${postId}`, buildPayload(), { withCredentials: true });
            if (data.success) {
                setToast({ type: "success", message: status === "DRAFT" ? "Post updated." : "Post updated & published!" });
                setLastSaved(new Date());
                setIsDirty(false);
                setTimeout(() => router.push("/posts"), 1400);
            } else {
                throw new Error(data?.message ?? "Failed to update post.");
            }
        } catch (err) {
            setToast({ type: "error", message: err?.response?.data?.message ?? err.message ?? "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };

    /* ── Reset to last saved ── */
    const handleReset = () => {
        const post = originalRef.current;
        if (!post) return;
        setTitle(post.title ?? "");
        setExcerpt(post.excerpt ?? "");
        setStatus(post.status ?? "DRAFT");
        setIsFeatured(post.isFeatured ?? false);
        setIsPinned(post.isPinned ?? false);
        setScheduledAt(post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : "");
        setSelectedCategories((post.categories ?? []).map((c) => c.category?.id ?? c.categoryId).filter(Boolean));
        setSelectedTags((post.tags ?? []).map((t) => t.tag?.id ?? t.tagId).filter(Boolean));
        setSelectedSeries(post.seriesId ?? "");
        if (post.coverImage) {
            setThumbnail({ id: post.coverImage.id, url: post.coverImage.url, name: post.coverImage.altText ?? "Cover image" });
        } else {
            setThumbnail(null);
        }
        setMetaTitle(post.seo?.metaTitle ?? "");
        setMetaDescription(post.seo?.metaDescription ?? "");
        if (editor.current && post.content) editor.current.render(post.content);
        setContent(post.content ?? null);
        setIsDirty(false);
        setToast({ type: "success", message: "Reset to last saved version." });
    };

    const statusMeta = STATUS_META[status] ?? STATUS_META.DRAFT;

    /* ── Loading screen ── */
    if (fetchingPost) {
        return (
            <>
                <style>{STYLES}</style>
                <style>{EDIT_EXTRA_STYLES}</style>
                <div className="pc-root ep-loading-screen">
                    <div className="ep-loading-inner">
                        <Loader size="md" text="Loading post…" />
                    </div>
                </div>
            </>
        );
    }

    /* ── Error screen ── */
    if (fetchError) {
        return (
            <>
                <style>{STYLES}</style>
                <style>{EDIT_EXTRA_STYLES}</style>
                <div className="pc-root ep-loading-screen">
                    <div className="ep-error-inner">
                        <AlertTriangle size={36} className="ep-error-icon" />
                        <p className="ep-error-title">Failed to load post</p>
                        <p className="ep-error-msg">{fetchError}</p>
                        <button className="btn btn-outline" onClick={() => router.back()}>Go back</button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{STYLES}</style>
            <style>{EDIT_EXTRA_STYLES}</style>

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
                            <span className="ep-breadcrumb-title" title={title}>{title || "Untitled"}</span>
                            <ChevronRight size={13} />
                            <span>Edit</span>
                        </div>
                    </div>

                    <div className="pc-topbar-stats">
                        {isDirty && (
                            <span className="ep-unsaved-badge">
                                <span className="ep-unsaved-dot" />
                                Unsaved changes
                            </span>
                        )}
                        {!isDirty && lastSaved && (
                            <span className="ep-saved-badge">
                                <CheckCircle2 size={11} />
                                Saved {formatRelativeTime(lastSaved)}
                            </span>
                        )}
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
                        {isDirty && (
                            <button
                                type="button"
                                className="btn btn-ghost ep-reset-btn"
                                onClick={handleReset}
                                title="Discard changes"
                                disabled={loading || savingDraft}
                            >
                                <RefreshCw size={13} />
                                Reset
                            </button>
                        )}
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
                                ? <><Loader size="sm" style={{ marginRight: 5 }} />Saving…</>
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
                                ? <><Loader size="sm" style={{ marginRight: 5 }} />Updating…</>
                                : <><Send size={13} style={{ marginRight: 5 }} />{status === "DRAFT" ? "Update" : "Update & Publish"}</>
                            }
                        </button>
                    </div>
                </header>

                {/* ── Toast ── */}
                {toast && (
                    <div className="pc-toast-wrap">
                        <ValidationToast type={toast.type} message={toast.message} />
                    </div>
                )}

                {/* ── Layout ── */}
                <div className={`pc-layout${sidebarOpen ? " pc-layout--sidebar" : ""}`}>

                    {/* ════ MAIN EDITOR AREA ════ */}
                    <main className="pc-main">

                        {/* Edit mode banner */}
                        <div className="ep-edit-banner">
                            <History size={13} />
                            <span>Editing existing post — changes will create a new revision.</span>
                        </div>

                        {/* Title */}
                        <div className="pc-title-wrap">
                            <textarea
                                className={`pc-title-input${errors.title ? " pc-title-input--error" : ""}`}
                                placeholder="Post title…"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setErrors((p) => ({ ...p, title: "" }));
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

                        {/* Editor */}
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

                                        {/* ── Post Meta Info ── */}
                                        {originalRef.current && (
                                            <div className="pc-sidebar-section ep-meta-section">
                                                <SectionTitle icon={Info}>Post Info</SectionTitle>
                                                <div className="ep-meta-grid">
                                                    {originalRef.current.createdAt && (
                                                        <div className="ep-meta-item">
                                                            <span className="ep-meta-key">Created</span>
                                                            <span className="ep-meta-val">{formatDate(originalRef.current.createdAt)}</span>
                                                        </div>
                                                    )}
                                                    {originalRef.current.updatedAt && (
                                                        <div className="ep-meta-item">
                                                            <span className="ep-meta-key">Last Updated</span>
                                                            <span className="ep-meta-val">{formatDate(originalRef.current.updatedAt)}</span>
                                                        </div>
                                                    )}
                                                    {originalRef.current.publishedAt && (
                                                        <div className="ep-meta-item">
                                                            <span className="ep-meta-key">Published</span>
                                                            <span className="ep-meta-val">{formatDate(originalRef.current.publishedAt)}</span>
                                                        </div>
                                                    )}
                                                    {originalRef.current.viewCount !== undefined && (
                                                        <div className="ep-meta-item">
                                                            <span className="ep-meta-key">Views</span>
                                                            <span className="ep-meta-val">{originalRef.current.viewCount.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    {originalRef.current.slug && (
                                                        <div className="ep-meta-item ep-meta-full">
                                                            <span className="ep-meta-key">Slug</span>
                                                            <span className="ep-meta-val ep-meta-slug">{originalRef.current.slug}</span>
                                                        </div>
                                                    )}
                                                </div>
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
                                                    : originalRef.current?.slug ?? "post-slug"
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

const EDIT_EXTRA_STYLES = `
  /* ── Loading / error screens ── */
  .ep-loading-screen {
    align-items: center;
    justify-content: center;
  }

  .ep-loading-inner,
  .ep-error-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 60px 24px;
    text-align: center;
  }

  @keyframes ep-spin { to { transform: rotate(360deg); } }
  .ep-loading-spinner {
    animation: ep-spin .8s linear infinite;
    color: var(--brand-primary);
  }

  .ep-loading-text {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  .ep-error-icon { color: #dc2626; }
  .ep-error-title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }
  .ep-error-msg {
    font-size: var(--text-sm);
    color: var(--text-muted);
    max-width: 360px;
  }

  /* ── Breadcrumb title truncation ── */
  .ep-breadcrumb-title {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
  }

  /* ── Unsaved / saved badges ── */
  .ep-unsaved-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: var(--font-semibold);
    color: #d97706;
    background: #fffbeb;
    border: 1px solid #fde68a;
    padding: 3px 10px;
    border-radius: var(--radius-xl);
    letter-spacing: .02em;
  }

  .dark .ep-unsaved-badge {
    background: #451a03;
    border-color: #78350f;
    color: #fbbf24;
  }

  .ep-unsaved-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #d97706;
    animation: ep-pulse-dot 1.4s ease-in-out infinite;
  }

  @keyframes ep-pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: .3; }
  }

  .ep-saved-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: #16a34a;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    padding: 3px 10px;
    border-radius: var(--radius-xl);
    font-weight: var(--font-semibold);
  }

  .dark .ep-saved-badge {
    background: #052e16;
    border-color: #14532d;
    color: #4ade80;
  }

  /* ── Reset button ── */
  .ep-reset-btn {
    gap: 5px;
    font-size: var(--text-xs);
    color: var(--text-muted);
    padding: 7px 12px;
  }

  .ep-reset-btn:hover {
    color: #dc2626;
    background: #fef2f2;
  }

  /* ── Edit mode banner ── */
  .ep-edit-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 14px;
    background: var(--brand-primary-light);
    border: 1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    color: var(--brand-primary);
    font-weight: var(--font-medium);
    margin-bottom: 22px;
    letter-spacing: .01em;
  }

  /* ── Post meta info grid ── */
  .ep-meta-section {}

  .ep-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 14px 16px;
  }

  .ep-meta-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .ep-meta-full {
    grid-column: 1 / -1;
  }

  .ep-meta-key {
    font-size: 10px;
    font-weight: var(--font-semibold);
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--text-muted);
  }

  .ep-meta-val {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }

  .ep-meta-slug {
    font-family: monospace;
    word-break: break-all;
    color: var(--brand-primary);
  }
`;

export default EditPost;