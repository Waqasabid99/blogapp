"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle, ChevronDown, Tag, FolderOpen,
    ImagePlus, BookOpen, Eye, Save, Send,
    Layers, Info, Clock, FileText,
    ChevronRight, PanelRight, PanelRightClose,
    Globe, Star, Pin, History, ExternalLink,
} from "lucide-react";
import ValidationToast from "@/components/ui/ValidationToast";
import { updatePost } from "@/api/postApi";
import useEditorJs from "@/constants/Editor";
import { CategorySelector, SectionTitle, STATUS_META, TagSelector, ThumbnailUploader } from "@/constants/utils";
import { STYLES } from "@/app/styles/postStyles";
import Loader from "@/components/ui/Loader";
import useAuthStore from "@/store/authStore";
import { getPostById } from "@/actions/post.client.action";

const EditPost = ({ postId, categories = [], tags = [], series = [] }) => {
    const router = useRouter();
    const { user } = useAuthStore();
    const [post, setPost] = useState(null);
    /* ── Derive initial values from post prop ── */
    const initialCategoryIds = post?.categories?.map((c) => c.category.id) ?? [];
    const initialTagIds = post?.tags?.map((t) => t.tag.id) ?? [];
    const initialThumbnail = post?.coverImage
        ? { id: post.coverImage.id, url: post.coverImage.url, name: "Cover image" }
        : null;
    const initialScheduledAt = post?.scheduledAt
        ? new Date(post.scheduledAt).toISOString().slice(0, 16)
        : "";

    /* ── Form State ── */
    const [title, setTitle] = useState(post?.title ?? "");
    const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
    const [content, setContent] = useState(post?.content ?? null);
    const [thumbnail, setThumbnail] = useState(initialThumbnail);
    const [selectedCategories, setSelectedCategories] = useState(initialCategoryIds);
    const [selectedTags, setSelectedTags] = useState(initialTagIds);
    // const [selectedSeries,     setSelectedSeries]     = useState(post?.seriesId     ?? "");
    const [status, setStatus] = useState(post?.status ?? "DRAFT");
    const [isFeatured, setIsFeatured] = useState(post?.isFeatured ?? false);
    const [isPinned, setIsPinned] = useState(post?.isPinned ?? false);
    const [scheduledAt, setScheduledAt] = useState(initialScheduledAt);

    /* ── SEO State ── */
    const [metaTitle, setMetaTitle] = useState(post?.seo?.metaTitle ?? post?.title ?? "");
    const [metaDescription, setMetaDescription] = useState(post?.seo?.metaDescription ?? post?.excerpt ?? "");

    /* ── UI State ── */
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("details");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [toast, setToast] = useState(null);
    const [wordCount, setWordCount] = useState(post?.wordCount ?? 0);
    const [readTime, setReadTime] = useState(post?.readingTime ?? 0);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await getPostById(postId);
                console.log(data)
                if (data.success) {
                    const fetchedPost = data.data;
                    setPost(fetchedPost);
                    setTitle(fetchedPost.title ?? "");
                    setExcerpt(fetchedPost.excerpt ?? "");
                    setContent(fetchedPost.content ?? null);
                    if (fetchedPost.coverImage) {
                        setThumbnail({ id: fetchedPost.coverImage.id, url: fetchedPost.coverImage.url, name: "Cover image" });
                    }
                    setSelectedCategories(fetchedPost.categories?.map((c) => c.category.id) ?? []);
                    setSelectedTags(fetchedPost.tags?.map((t) => t.tag.id) ?? []);
                    setStatus(fetchedPost.status ?? "DRAFT");
                    setIsFeatured(fetchedPost.isFeatured ?? false);
                    setIsPinned(fetchedPost.isPinned ?? false);
                    if (fetchedPost.scheduledAt) {
                        setScheduledAt(new Date(fetchedPost.scheduledAt).toISOString().slice(0, 16));
                    }
                    setMetaTitle(fetchedPost.seo?.metaTitle ?? fetchedPost.title ?? "");
                    setMetaDescription(fetchedPost.seo?.metaDescription ?? fetchedPost.excerpt ?? "");
                    setWordCount(fetchedPost.wordCount ?? 0);
                    setReadTime(fetchedPost.readingTime ?? 0);
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            }
        };
        fetchPost();
    }, [postId]);

    /* ── Track whether editor has been seeded with existing content ── */
    const seededRef = useRef(false);

    /* ── Editor ── */
    const onContentChange = useCallback((data) => {
        setContent(data);
        const text = data.blocks
            ?.map((b) => b?.data?.text || b?.data?.items?.join(" ") || "")
            .join(" ") ?? "";
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(words);
        setReadTime(Math.max(1, Math.ceil(words / 238)));
    }, []);

    const { editorRef, ready: editorReady } = useEditorJs("ep-editor-holder", onContentChange);

    /* ── Seed editor with existing content once it is ready ── */
    useEffect(() => {
        if (!editorReady || seededRef.current) return;
        if (!post?.content || !editorRef.current) return;

        // Editor.js exposes render() to load saved data
        editorRef?.current?.render(post.content).catch(console.error);
        seededRef.current = true;
    }, [editorReady, post?.content, editorRef]);

    /* ── Sync title → SEO title only when SEO title is still the old post title ── */
    useEffect(() => {
        setMetaTitle((prev) => (prev === post?.title ? title : prev));
    }, [title]);

    /* ── Validation ── */
    const validate = () => {
        const e = {};
        if (!title.trim()) e.title = "Title is required.";
        if (!content || !content.blocks || content.blocks.length === 0)
            e.content = "Post content cannot be empty.";
        return e;
    };

    /* ── Payload ── */
    const buildPayload = (overrideStatus) => ({
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        coverImageId: thumbnail?.id ?? null,
        categories: selectedCategories,
        tags: selectedTags,
        seriesId: null,
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
            const data = await updatePost(post.id, buildPayload("DRAFT"));
            if (data.success) {
                setToast({ type: "success", message: "Draft saved successfully." });
                router.refresh();
            } else {
                setToast({ type: "error", message: data?.message ?? "Failed to save draft." });
            }
        } catch (err) {
            setToast({ type: "error", message: err?.message ?? "Failed to save draft." });
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
            const data = await updatePost(post.id, buildPayload());
            if (data.success) {
                setToast({
                    type: "success",
                    message: status === "DRAFT" ? "Post saved as draft." : "Post updated successfully!",
                });
                setTimeout(() => router.push(`/dashboard/${user?.role}/${user?.id}/posts`), 1400);
            } else {
                setToast({ type: "error", message: data?.message ?? "Failed to update post." });
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
                            <span>Edit Post</span>
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
                        {/* View live post shortcut (only if published) */}
                        {post?.status === "PUBLISHED" && post?.slug && (
                            <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pc-stat"
                                title="View published post"
                                style={{ textDecoration: "none" }}
                            >
                                <ExternalLink size={12} />View
                            </a>
                        )}
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
                                ? <Loader size="sm" text="Saving..." />
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
                                ? <Loader size="sm" text="Updating..." />
                                : <><Send size={13} style={{ marginRight: 5 }} />{status === "DRAFT" ? "Save" : "Update"}</>
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

                        {/* Meta row — last saved, slug, author */}
                        <div className="uc-meta-row" style={{ marginBottom: 24 }}>
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Post ID</span>
                                <span className="uc-meta-val">{post?.id}</span>
                            </div>
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Slug</span>
                                <span className="uc-meta-val">{post?.slug ?? "—"}</span>
                            </div>
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Author</span>
                                <span className="uc-meta-val">{post?.author?.name ?? "—"}</span>
                            </div>
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Created</span>
                                <span className="uc-meta-val">
                                    {post?.createdAt
                                        ? new Date(post.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric", month: "short", day: "numeric",
                                        })
                                        : "—"}
                                </span>
                            </div>
                            <div className="uc-meta-item">
                                <span className="uc-meta-key">Published</span>
                                <span className="uc-meta-val">
                                    {post?.publishedAt
                                        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                                            year: "numeric", month: "short", day: "numeric",
                                        })
                                        : "Not published"}
                                </span>
                            </div>
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
                            <div id="ep-editor-holder" className="pc-editor-inner" />
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
                                <button
                                    type="button"
                                    className={`pc-tab${activeTab === "history" ? " pc-tab--active" : ""}`}
                                    onClick={() => setActiveTab("history")}
                                >
                                    <History size={13} />History
                                </button>
                            </div>

                            <div className="pc-sidebar-body">

                                {/* ════ DETAILS TAB ════ */}
                                {activeTab === "details" && (
                                    <>
                                        {/* ── Status & Visibility ── */}
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
                                                        {user?.role === "admin" || user?.role === "editor" ? (
                                                            <option value="PUBLISHED">Published</option>
                                                        ) : null}
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
                                        {/* {series.length > 0 && (
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
                                        )} */}
                                    </>
                                )}

                                {/* ════ SEO TAB ════ */}
                                {activeTab === "seo" && (
                                    <>
                                        <div className="pc-sidebar-section">
                                            <SectionTitle icon={Globe}>Search Engine Preview</SectionTitle>

                                            <div className="pc-seo-preview">
                                                <p className="pc-seo-url">
                                                    yoursite.com/blog/{post?.slug ?? (title
                                                        ? title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 50)
                                                        : "post-slug")}
                                                </p>
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

                                {/* ════ HISTORY TAB ════ */}
                                {activeTab === "history" && (
                                    <div className="pc-sidebar-section">
                                        <SectionTitle icon={History}>Post History</SectionTitle>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                                            {[
                                                {
                                                    label: "Created",
                                                    value: post?.createdAt
                                                        ? new Date(post.createdAt).toLocaleString("en-US", {
                                                            year: "numeric", month: "short", day: "numeric",
                                                            hour: "2-digit", minute: "2-digit",
                                                        })
                                                        : "—",
                                                },
                                                {
                                                    label: "Last Updated",
                                                    value: post?.updatedAt
                                                        ? new Date(post.updatedAt).toLocaleString("en-US", {
                                                            year: "numeric", month: "short", day: "numeric",
                                                            hour: "2-digit", minute: "2-digit",
                                                        })
                                                        : "—",
                                                },
                                                {
                                                    label: "Published",
                                                    value: post?.publishedAt
                                                        ? new Date(post.publishedAt).toLocaleString("en-US", {
                                                            year: "numeric", month: "short", day: "numeric",
                                                            hour: "2-digit", minute: "2-digit",
                                                        })
                                                        : "Not published",
                                                },
                                                { label: "Views", value: post?.viewCount ?? 0 },
                                                { label: "Reading time", value: `${post?.readingTime ?? readTime} min` },
                                                { label: "Word count", value: post?.wordCount ?? wordCount },
                                            ].map(({ label, value }) => (
                                                <div
                                                    key={label}
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        padding: "8px 12px",
                                                        background: "var(--bg-secondary)",
                                                        borderRadius: "var(--radius-md)",
                                                        border: "1px solid var(--border-light)",
                                                    }}
                                                >
                                                    <span style={{
                                                        fontSize: "var(--text-xs)",
                                                        fontWeight: "var(--font-semibold)",
                                                        textTransform: "uppercase",
                                                        letterSpacing: ".06em",
                                                        color: "var(--text-muted)",
                                                    }}>
                                                        {label}
                                                    </span>
                                                    <span style={{
                                                        fontSize: "var(--text-xs)",
                                                        color: "var(--text-secondary)",
                                                        fontFamily: "monospace",
                                                    }}>
                                                        {value}
                                                    </span>
                                                </div>
                                            ))}

                                            {/* Current slug */}
                                            <div
                                                style={{
                                                    padding: "8px 12px",
                                                    background: "var(--bg-secondary)",
                                                    borderRadius: "var(--radius-md)",
                                                    border: "1px solid var(--border-light)",
                                                }}
                                            >
                                                <span style={{
                                                    fontSize: "var(--text-xs)",
                                                    fontWeight: "var(--font-semibold)",
                                                    textTransform: "uppercase",
                                                    letterSpacing: ".06em",
                                                    color: "var(--text-muted)",
                                                    display: "block",
                                                    marginBottom: 4,
                                                }}>
                                                    Current Slug
                                                </span>
                                                <span style={{
                                                    fontSize: "var(--text-xs)",
                                                    color: "var(--text-secondary)",
                                                    fontFamily: "monospace",
                                                    wordBreak: "break-all",
                                                }}>
                                                    {post?.slug ?? "—"}
                                                </span>
                                                <p className="uc-hint" style={{ marginTop: 6 }}>
                                                    Slug updates automatically when you change the title. Old slugs are preserved as redirects.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </>
    );
};

export default EditPost;