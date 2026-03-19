"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    Search, X, ChevronDown, ChevronLeft, ChevronRight,
    Clock, BookOpen, Star, Pin, Eye, Calendar, Hash, FolderOpen,
    LayoutGrid, List, ArrowUpDown, Filter, FileText,
    Edit3, Trash2, MoreHorizontal, AlertCircle
} from "lucide-react";
import axios from "axios";
import { Avatar, base_url, SORT_OPTIONS, STATUS_CONFIG, StatusBadge } from "@/constants/utils";
import DeleteModal from "@/components/ui/DeleteModal";
import { CardSkeleton, RowSkeleton } from "./Loadingskeletons/PostSkeleton";
import { STYLES } from "@/app/styles/postgridStyles";
import { formatDate, timeAgo } from "@/constants/helpers";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */

const PER_PAGE_OPTIONS = [10, 20, 30, 50];

/* ─────────────────────────────────────────────────────────────
   POST CARD (grid view)
───────────────────────────────────────────────────────────── */
function PostCard({ post, onDelete, showActions }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const cats = post.categories?.map((c) => c.category) ?? [];
    const tags = post.tags?.map((t) => t.tag) ?? [];

    return (
        <article className="pg-card">
            {/* Cover */}
            <div className="pg-card-cover">
                {post.coverImage?.url
                    ? <img src={post.coverImage.url} alt={post.title} className="pg-card-img" />
                    : <div className="pg-card-no-img">
                        <FileText size={28} />
                    </div>
                }
                <div className="pg-card-cover-badges">
                    {post.isFeatured && (
                        <span className="pg-badge pg-badge--featured"><Star size={9} />Featured</span>
                    )}
                    {post.isPinned && (
                        <span className="pg-badge pg-badge--pinned"><Pin size={9} />Pinned</span>
                    )}
                </div>
                <div className="pg-card-status-pos">
                    <StatusBadge status={post.status} />
                </div>
            </div>

            {/* Body */}
            <div className="pg-card-body">
                {/* Categories */}
                {cats.length > 0 && (
                    <div className="pg-card-cats">
                        {cats.slice(0, 2).map((c) => (
                            <span key={c.id} className="pg-cat-label">
                                <FolderOpen size={9} />{c.name}
                            </span>
                        ))}
                        {cats.length > 2 && <span className="pg-cat-label">+{cats.length - 2}</span>}
                    </div>
                )}

                {/* Title */}
                <h3 className="pg-card-title">
                    <Link href={`posts/${post.id}/edit`}>{post.title}</Link>
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className="pg-card-excerpt">{post.excerpt}</p>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="pg-card-tags">
                        {tags.slice(0, 3).map((t) => (
                            <span key={t.id} className="pg-tag-chip"><Hash size={9} />{t.name}</span>
                        ))}
                        {tags.length > 3 && <span className="pg-tag-chip">+{tags.length - 3}</span>}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="pg-card-footer">
                <div className="pg-card-author">
                    <Avatar author={post.author} size={22} />
                    <span className="pg-card-author-name">{post.author?.name}</span>
                </div>

                <div className="pg-card-meta">
                    {post.readingTime && (
                        <span className="pg-meta-item"><Clock size={10} />{post.readingTime}m</span>
                    )}
                    <span className="pg-meta-item">
                        <Calendar size={10} />
                        {timeAgo(post.publishedAt ?? post.createdAt)}
                    </span>
                </div>

                {showActions && (
                    <div ref={menuRef} className="pg-card-actions">
                        <button
                            type="button"
                            className="pg-action-btn"
                            onClick={() => setMenuOpen((v) => !v)}
                        >
                            <MoreHorizontal size={14} />
                        </button>
                        {menuOpen && (
                            <div className="pg-action-menu">
                                <Link
                                    href={`posts/${post.id}/edit`}
                                    className="pg-action-item"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <Edit3 size={13} />Edit
                                </Link>
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="pg-action-item"
                                    target="_blank"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <Eye size={13} />View
                                </Link>
                                <button
                                    type="button"
                                    className="pg-action-item pg-action-item--danger"
                                    onClick={() => { setMenuOpen(false); onDelete(post); }}
                                >
                                    <Trash2 size={13} />Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}

/* ─────────────────────────────────────────────────────────────
   POST ROW (list view)
───────────────────────────────────────────────────────────── */
function PostRow({ post, onDelete, showActions }) {
    const cats = post.categories?.map((c) => c.category) ?? [];
    const tags = post.tags?.map((t) => t.tag) ?? [];

    return (
        <div className="pg-row">
            {/* Thumb */}
            <div className="pg-row-thumb">
                {post.coverImage?.url
                    ? <img src={post.coverImage.url} alt="" className="pg-row-img" />
                    : <div className="pg-row-no-img"><FileText size={16} /></div>
                }
            </div>

            {/* Info */}
            <div className="pg-row-info">
                <div className="pg-row-top">
                    <div className="pg-row-badges">
                        <StatusBadge status={post.status} />
                        {post.isFeatured && <span className="pg-badge pg-badge--featured"><Star size={9} />Featured</span>}
                        {post.isPinned   && <span className="pg-badge pg-badge--pinned"><Pin size={9} />Pinned</span>}
                    </div>
                </div>
                <h3 className="pg-row-title">
                    <Link href={`posts/${post.id}/edit`}>{post.title}</Link>
                </h3>
                {post.excerpt && <p className="pg-row-excerpt">{post.excerpt}</p>}

                <div className="pg-row-bottom">
                    <div className="pg-row-author">
                        <Avatar author={post.author} size={18} />
                        <span>{post.author?.name}</span>
                    </div>

                    {cats.slice(0, 2).map((c) => (
                        <span key={c.id} className="pg-cat-label"><FolderOpen size={9} />{c.name}</span>
                    ))}

                    {tags.slice(0, 3).map((t) => (
                        <span key={t.id} className="pg-tag-chip"><Hash size={9} />{t.name}</span>
                    ))}

                    {post.readingTime && (
                        <span className="pg-meta-item"><Clock size={10} />{post.readingTime} min read</span>
                    )}
                    {post.wordCount && (
                        <span className="pg-meta-item"><BookOpen size={10} />{post.wordCount} words</span>
                    )}
                    <span className="pg-meta-item">
                        <Calendar size={10} />
                        {formatDate(post.publishedAt ?? post.createdAt)}
                    </span>
                </div>
            </div>

            {/* Actions */}
            {showActions && (
                <div className="pg-row-actions">
                    <Link href={`posts/${post.id}/edit`} className="btn btn-outline" style={{ padding: "5px 12px", fontSize: "var(--text-xs)" }}>
                        <Edit3 size={12} style={{ marginRight: 4 }} />Edit
                    </Link>
                    <button
                        type="button"
                        className="btn"
                        style={{ padding: "5px 12px", fontSize: "var(--text-xs)", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                        onClick={() => onDelete(post)}
                    >
                        <Trash2 size={12} style={{ marginRight: 4 }} />Delete
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */
function EmptyState({ hasFilters, onClear }) {
    return (
        <div className="pg-empty">
            <div className="pg-empty-icon">
                <FileText size={32} />
            </div>
            <p className="pg-empty-title">
                {hasFilters ? "No posts match your filters" : "No posts yet"}
            </p>
            <p className="pg-empty-sub">
                {hasFilters
                    ? "Try adjusting your search or filters."
                    : "Create your first post to get started."
                }
            </p>
            {hasFilters && (
                <button type="button" className="btn btn-outline" onClick={onClear} style={{ marginTop: 12 }}>
                    <X size={13} style={{ marginRight: 5 }} />Clear filters
                </button>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────────────────────── */
function Pagination({ pagination, onPageChange }) {
    const { page, totalPages, total, limit } = pagination;
    const from = (page - 1) * limit + 1;
    const to   = Math.min(page * limit, total);

    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
        pages.push(i);
    }

    return (
        <div className="pg-pagination">
            <span className="pg-pagination-info">
                Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> posts
            </span>
            <div className="pg-pagination-controls">
                <button
                    type="button"
                    className="pg-page-btn"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ChevronLeft size={14} />
                </button>

                {pages[0] > 1 && (
                    <>
                        <button type="button" className="pg-page-btn" onClick={() => onPageChange(1)}>1</button>
                        {pages[0] > 2 && <span className="pg-page-ellipsis">…</span>}
                    </>
                )}

                {pages.map((p) => (
                    <button
                        key={p}
                        type="button"
                        className={`pg-page-btn${p === page ? " pg-page-btn--active" : ""}`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                ))}

                {pages[pages.length - 1] < totalPages && (
                    <>
                        {pages[pages.length - 1] < totalPages - 1 && <span className="pg-page-ellipsis">…</span>}
                        <button type="button" className="pg-page-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                    </>
                )}

                <button
                    type="button"
                    className="pg-page-btn"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

const PostGrid = ({
    initialData   = null,
    categories    = [],
    tags          = [],
    showActions   = true,
    defaultLayout = "grid",
    defaultLimit  = 10,
    title         = "All Posts",
    description   = "Manage and organise your content",
    addHref       = "posts/new",
    fixedStatus   = null,
    className     = "",
}) => {
    const router       = useRouter();
    const pathname     = usePathname();
    const searchParams = useSearchParams();

    /* ── Filter state ── */
    const [search,    setSearch]    = useState(searchParams.get("search") ?? "");
    const [status,    setStatus]    = useState(fixedStatus ?? searchParams.get("status") ?? "");
    const [category,  setCategory]  = useState(searchParams.get("category") ?? "");
    const [tag,       setTag]       = useState(searchParams.get("tag") ?? "");
    const [sortBy,    setSortBy]    = useState(searchParams.get("sortBy") ?? "createdAt");
    const [order,     setOrder]     = useState(searchParams.get("order") ?? "desc");
    const [page,      setPage]      = useState(Number(searchParams.get("page")) || 1);
    const [limit,     setLimit]     = useState(Number(searchParams.get("limit")) || defaultLimit);
    const [layout,    setLayout]    = useState(defaultLayout);
    const [filtersOpen, setFiltersOpen] = useState(false);

    /* ── Data state ── */
    const [posts,      setPosts]      = useState(initialData?.posts ?? []);
    const [pagination, setPagination] = useState(initialData?.pagination ?? null);
    const [loading,    setLoading]    = useState(!initialData);
    const [error,      setError]      = useState(null);

    /* ── Delete state ── */
    const [toDelete,     setToDelete]     = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError,   setDeleteError]   = useState(null);

    /* ── Search debounce ── */
    const searchTimer = useRef(null);
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 380);
        return () => clearTimeout(searchTimer.current);
    }, [search]);

    /* ── Fetch ── */
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set("page",   page);
            params.set("limit",  limit);
            params.set("sortBy", sortBy);
            params.set("order",  order);
            if (debouncedSearch) params.set("search",   debouncedSearch);
            if (status)          params.set("status",   status);
            if (category)        params.set("category", category);
            if (tag)             params.set("tag",      tag);

            const { data } = await axios.get(
                `${base_url}/post?${params.toString()}`,
                { withCredentials: true }
            );

            if (data.success) {
                setPosts(data.data.posts);
                setPagination(data.data.pagination);
            }
        } catch (err) {
            setError(err?.response?.data?.message ?? "Failed to load posts.");
        } finally {
            setLoading(false);
        }
    }, [page, limit, sortBy, order, debouncedSearch, status, category, tag]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    /* ── Delete handler ── */
    const handleDelete = useCallback(async () => {
        if (!toDelete) return;
        setDeleteLoading(true);
        try {
            const { data } = await axios.delete(
                `${base_url}/post/${toDelete.id}`,
                { withCredentials: true }
            );
            if (data.success) {
                setPosts((prev) => prev.filter((p) => p.id !== toDelete.id));
                setToDelete(null);
                router.refresh();
            }
        } catch (err) {
            setDeleteError(err?.response?.data?.message ?? "Failed to delete post.");
        } finally {
            setDeleteLoading(false);
        }
    }, [toDelete]);

    /* ── Clear filters ── */
    const clearFilters = () => {
        setSearch("");
        if (!fixedStatus) setStatus("");
        setCategory("");
        setTag("");
        setSortBy("createdAt");
        setOrder("desc");
        setPage(1);
    };

    const hasActiveFilters = debouncedSearch || (status && !fixedStatus) || category || tag;

    const activeFilterCount = [
        debouncedSearch,
        status && !fixedStatus ? status : null,
        category,
        tag,
    ].filter(Boolean).length;

    return (
        <>
            <style>{STYLES}</style>

            <div className={`pg-root ${className}`}>

                {/* ── Toolbar ── */}
                <div className="pg-toolbar">
                    <div className="pg-toolbar-top">
                        {/* Title */}
                        <div className="pg-toolbar-title">
                            <h2 className="pg-title">{title}</h2>
                            {description && <p className="pg-desc">{description}</p>}
                        </div>

                        {/* Right controls */}
                        <div className="pg-toolbar-controls">
                            {/* Search */}
                            <div className="pg-search-wrap">
                                <Search size={14} className="pg-search-icon" />
                                <input
                                    type="text"
                                    className="pg-search"
                                    placeholder="Search posts…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {search && (
                                    <button type="button" className="pg-search-clear" onClick={() => setSearch("")}>
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Filter toggle */}
                            <button
                                type="button"
                                className={`pg-filter-btn${filtersOpen ? " pg-filter-btn--active" : ""}`}
                                onClick={() => setFiltersOpen((v) => !v)}
                            >
                                <Filter size={13} />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="pg-filter-count">{activeFilterCount}</span>
                                )}
                            </button>

                            {/* Sort */}
                            <div className="pg-sort-wrap">
                                <ArrowUpDown size={13} />
                                <select
                                    className="pg-sort-select"
                                    value={`${sortBy}-${order}`}
                                    onChange={(e) => {
                                        const [field, ord] = e.target.value.split("-");
                                        setSortBy(field);
                                        setOrder(ord);
                                        setPage(1);
                                    }}
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <optgroup key={opt.value} label={opt.label}>
                                            <option value={`${opt.value}-desc`}>{opt.label} ↓</option>
                                            <option value={`${opt.value}-asc`}>{opt.label} ↑</option>
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Layout toggle */}
                            <div className="pg-layout-toggle">
                                <button
                                    type="button"
                                    className={`pg-layout-btn${layout === "grid" ? " pg-layout-btn--active" : ""}`}
                                    onClick={() => setLayout("grid")}
                                    title="Grid view"
                                >
                                    <LayoutGrid size={14} />
                                </button>
                                <button
                                    type="button"
                                    className={`pg-layout-btn${layout === "list" ? " pg-layout-btn--active" : ""}`}
                                    onClick={() => setLayout("list")}
                                    title="List view"
                                >
                                    <List size={14} />
                                </button>
                            </div>

                            {/* Add post */}
                            <Link href={addHref} className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
                                + New Post
                            </Link>
                        </div>
                    </div>

                    {/* ── Filter panel ── */}
                    {filtersOpen && (
                        <div className="pg-filter-panel">
                            {/* Status */}
                            {!fixedStatus && (
                                <div className="pg-filter-group">
                                    <label className="pg-filter-label">Status</label>
                                    <div className="pg-filter-select-wrap">
                                        <select
                                            className="pg-filter-select"
                                            value={status}
                                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                                        >
                                            <option value="">All statuses</option>
                                            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                                                <option key={val} value={val}>{cfg.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={12} className="pg-filter-chevron" />
                                    </div>
                                </div>
                            )}

                            {/* Category */}
                            {categories.length > 0 && (
                                <div className="pg-filter-group">
                                    <label className="pg-filter-label">Category</label>
                                    <div className="pg-filter-select-wrap">
                                        <select
                                            className="pg-filter-select"
                                            value={category}
                                            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                                        >
                                            <option value="">All categories</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={12} className="pg-filter-chevron" />
                                    </div>
                                </div>
                            )}

                            {/* Tag */}
                            {tags.length > 0 && (
                                <div className="pg-filter-group">
                                    <label className="pg-filter-label">Tag</label>
                                    <div className="pg-filter-select-wrap">
                                        <select
                                            className="pg-filter-select"
                                            value={tag}
                                            onChange={(e) => { setTag(e.target.value); setPage(1); }}
                                        >
                                            <option value="">All tags</option>
                                            {tags.map((t) => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={12} className="pg-filter-chevron" />
                                    </div>
                                </div>
                            )}

                            {/* Per page */}
                            <div className="pg-filter-group">
                                <label className="pg-filter-label">Per page</label>
                                <div className="pg-filter-select-wrap">
                                    <select
                                        className="pg-filter-select"
                                        value={limit}
                                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                    >
                                        {PER_PAGE_OPTIONS.map((n) => (
                                            <option key={n} value={n}>{n} posts</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className="pg-filter-chevron" />
                                </div>
                            </div>

                            {/* Clear */}
                            {hasActiveFilters && (
                                <button type="button" className="pg-filter-clear" onClick={clearFilters}>
                                    <X size={12} />Clear all
                                </button>
                            )}
                        </div>
                    )}

                    {/* Active filter chips */}
                    {hasActiveFilters && (
                        <div className="pg-active-filters">
                            {debouncedSearch && (
                                <span className="pg-active-chip">
                                    Search: "{debouncedSearch}"
                                    <button type="button" onClick={() => setSearch("")}><X size={10} /></button>
                                </span>
                            )}
                            {status && !fixedStatus && (
                                <span className="pg-active-chip">
                                    Status: {STATUS_CONFIG[status]?.label ?? status}
                                    <button type="button" onClick={() => setStatus("")}><X size={10} /></button>
                                </span>
                            )}
                            {category && (
                                <span className="pg-active-chip">
                                    Category: {categories.find((c) => c.id === category)?.name ?? category}
                                    <button type="button" onClick={() => setCategory("")}><X size={10} /></button>
                                </span>
                            )}
                            {tag && (
                                <span className="pg-active-chip">
                                    Tag: {tags.find((t) => t.id === tag)?.name ?? tag}
                                    <button type="button" onClick={() => setTag("")}><X size={10} /></button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="pg-error">
                        <AlertCircle size={15} />
                        {error}
                        <button type="button" className="btn btn-outline" onClick={fetchPosts} style={{ marginLeft: "auto", padding: "4px 12px", fontSize: "var(--text-xs)" }}>
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Grid / List ── */}
                {layout === "grid" ? (
                    <div className="pg-grid">
                        {loading
                            ? Array.from({ length: limit > 6 ? 6 : limit }).map((_, i) => <CardSkeleton key={i} />)
                            : posts.length === 0
                                ? <div style={{ gridColumn: "1 / -1" }}>
                                    <EmptyState hasFilters={!!hasActiveFilters} onClear={clearFilters} />
                                  </div>
                                : posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onDelete={setToDelete}
                                        showActions={showActions}
                                    />
                                ))
                        }
                    </div>
                ) : (
                    <div className="pg-list">
                        {loading
                            ? Array.from({ length: limit > 8 ? 8 : limit }).map((_, i) => <RowSkeleton key={i} />)
                            : posts.length === 0
                                ? <EmptyState hasFilters={!!hasActiveFilters} onClear={clearFilters} />
                                : posts.map((post) => (
                                    <PostRow
                                        key={post.id}
                                        post={post}
                                        onDelete={setToDelete}
                                        showActions={showActions}
                                    />
                                ))
                        }
                    </div>
                )}

                {/* ── Pagination ── */}
                {!loading && pagination && pagination.totalPages > 1 && (
                    <Pagination pagination={pagination} onPageChange={setPage} />
                )}
            </div>

            {/* ── Delete modal ── */}
            {toDelete && (
                <DeleteModal
                    isOpen={!!toDelete}
                    onClose={() => { setToDelete(null); setDeleteError(null); }}
                    title="Delete post"
                    description={`Are you sure you want to delete "${toDelete.title}"? This action cannot be undone.`}
                    onConfirm={handleDelete}
                    isLoading={deleteLoading}
                    error={deleteError}
                    setError={setDeleteError}
                />
            )}
        </>
    );
};

export default PostGrid;