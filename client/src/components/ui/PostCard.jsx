"use client";
import { STYLES } from "@/app/styles/postgridStyles";
import { formatDate, timeAgo } from "@/constants/helpers";
import { Avatar, StatusBadge } from "@/constants/utils";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  FileText,
  FolderOpen,
  Hash,
  MoreHorizontal,
  Pin,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   POST CARD (grid view)
───────────────────────────────────────────────────────────── */
export function PostCard({
  post,
  onDelete,
  showActions,
  showDate = true,
  showTags = true,
  showAuthor = true,
  showCategories = true,
  showStatus = true,
  isHero = false
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cats = post?.categories?.map((c) => c.category) ?? [];
  const tags = post?.tags?.map((t) => t.tag) ?? [];
  console.log(post)
  return (
    <>
      <style>{STYLES}</style>
      <article className="pg-card">
        {/* Cover */}
        <div className="pg-card-cover">
          {post?.coverImage?.url ? (
            <Image
              src={post?.coverImage?.url}
              alt={post?.title}
              fill
              loading={isHero ? "eager" : "lazy"}
              priority={isHero}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="pg-card-img"
            />
          ) : (
            <div className="pg-card-no-img">
              <FileText size={28} />
            </div>
          )}
          <div className="pg-card-cover-badges">
            {post?.isFeatured && (
              <span className="pg-badge pg-badge--featured">
                <Star size={9} />
                Featured
              </span>
            )}
            {post?.isPinned && (
              <span className="pg-badge pg-badge--pinned">
                <Pin size={9} />
                Pinned
              </span>
            )}
          </div>
          {showStatus && post?.status && (
            <div className="pg-card-status-pos">
              <StatusBadge status={post?.status} />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="pg-card-body">
          {/* Categories */}
          {showCategories && (
            <>
              {cats?.length > 0 && (
                <div className="pg-card-cats">
                  {cats?.slice(0, 2)?.map((c) => (
                    <span key={c.id} className="pg-cat-label">
                      <FolderOpen size={9} />
                      {c.name}
                    </span>
                  ))}
                  {cats?.length > 2 && (
                    <span className="pg-cat-label">+{cats?.length - 2}</span>
                  )}
                </div>
              )}
            </>
          )}

          {/* Title */}
          <h3 className="pg-card-title">
            <Link href={`/blog/${post?.categories?.[0]?.category?.slug}/${post?.slug}`}>{post?.title}</Link>
          </h3>

          {/* Excerpt */}
          {post?.excerpt && <p className="pg-card-excerpt">{post?.excerpt}</p>}

          {/* Tags */}
          {showTags && (
            <>
              {tags?.length > 0 && (
                <div className="pg-card-tags">
                  {tags?.slice(0, 3)?.map((t) => (
                    <span key={t.id} className="pg-tag-chip">
                      <Hash size={9} />
                      {t.name}
                    </span>
                  ))}
                  {tags?.length > 3 && (
                    <span className="pg-tag-chip">+{tags?.length - 3}</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pg-card-footer">
          {showAuthor && post?.author && (
            <div className="pg-card-author">
              <Avatar author={post?.author} size={22} />
              <span className="pg-card-author-name">{post?.author?.name}</span>
            </div>
          )}

          <div className="pg-card-meta">
            {post?.readingTime && (
              <span className="pg-meta-item">
                <Clock size={10} />
                {post?.readingTime}m
              </span>
            )}
            {post?.wordCount && (
              <span className="pg-meta-item">
                <BookOpen size={10} />
                {post?.wordCount} words
              </span>
            )}
            {showDate && post?.createdAt && (
              <span className="pg-meta-item">
                <Calendar size={10} />
                {timeAgo(post?.publishedAt ?? post?.createdAt)}
              </span>
            )}
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
                    href={`posts/${post?.id}/edit`}
                    className="pg-action-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Edit3 size={13} />
                    Edit
                  </Link>
                  <Link
                    href={`posts/${post?.id}`}
                    className="pg-action-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Eye size={13} />
                    View
                  </Link>
                  <button
                    type="button"
                    className="pg-action-item pg-action-item--danger"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(post);
                    }}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   POST ROW (list view)
───────────────────────────────────────────────────────────── */
export function PostRow({
  post,
  onDelete,
  showActions,
  showDate = true,
  showTags = true,
  showAuthor = true,
  showCategories = true,
  showStatus = true,
}) {
  const cats = post?.categories?.map((c) => c.category) ?? [];
  const tags = post?.tags?.map((t) => t.tag) ?? [];
  return (
    <div className="pg-row">
      {/* Thumb */}
      <div className="pg-row-thumb">
        {post?.coverImage?.url ? (
          <Image src={post?.coverImage?.url} width={post?.coverImage?.width ?? 100} height={post?.coverImage?.height ?? 100} alt="" className="pg-row-img" />
        ) : (
          <div className="pg-row-no-img">
            <FileText size={16} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pg-row-info">
        <div className="pg-row-top">
          {showStatus && (
            <div className="pg-row-badges">
              <StatusBadge status={post?.status} />
              {post?.isFeatured && (
                <span className="pg-badge pg-badge--featured">
                  <Star size={9} />
                  Featured
                </span>
              )}
              {post?.isPinned && (
                <span className="pg-badge pg-badge--pinned">
                  <Pin size={9} />
                  Pinned
                </span>
              )}
            </div>
          )}
        </div>
        <h3 className="pg-row-title">
          <Link href={`/blog/${post?.categories?.[0]?.category?.slug}/${post?.slug}`}>{post?.title}</Link>
        </h3>
        {post?.excerpt && <p className="pg-row-excerpt">{post?.excerpt}</p>}

        <div className="pg-row-bottom">
          {showAuthor && (
            <div className="pg-row-author">
              <Avatar author={post?.author} size={18} />
              <span>{post?.author?.name}</span>
            </div>
          )}
          {showCategories && cats?.length > 0 && (
            <>
              {cats?.slice(0, 2)?.map((c) => (
                <span key={c.id} className="pg-cat-label">
                  <FolderOpen size={9} />
                  {c.name}
                </span>
              ))}
            </>
          )}
          {showTags && tags?.length > 0 && (
            <>
              {tags?.slice(0, 3)?.map((t) => (
                <span key={t.id} className="pg-tag-chip">
                  <Hash size={9} />
                  {t.name}
                </span>
              ))}
            </>
          )}

          {post?.readingTime && (
            <span className="pg-meta-item">
              <Clock size={10} />
              {post?.readingTime} min read
            </span>
          )}
          {post?.wordCount && (
            <span className="pg-meta-item">
              <BookOpen size={10} />
              {post?.wordCount} words
            </span>
          )}
          {showDate && (
            <span className="pg-meta-item">
              <Calendar size={10} />
              {formatDate(post?.publishedAt ?? post?.createdAt)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="pg-row-actions">
          <Link
            href={`posts/${post?.id}/edit`}
            className="btn btn-outline"
            style={{ padding: "5px 12px", fontSize: "var(--text-xs)" }}
          >
            <Edit3 size={12} style={{ marginRight: 4 }} />
            Edit
          </Link>
          <button
            type="button"
            className="btn"
            style={{
              padding: "5px 12px",
              fontSize: "var(--text-xs)",
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
            }}
            onClick={() => onDelete(post)}
          >
            <Trash2 size={12} style={{ marginRight: 4 }} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */

export function EmptyState({ hasFilters, onClear, text, subText, className = "" }) {
  return (
    <>
      <style>{STYLES}</style>
      <div className={`pg-empty ${className}`}>
        <div className="pg-empty-icon">
          <FileText size={32} />
        </div>
        <p className="pg-empty-title">
          {hasFilters ? "No posts match your filters" : text ?? "No Posts found"}
        </p>
        <p className="pg-empty-sub">
          {hasFilters
            ? "Try adjusting your search or filters."
            : subText ?? "Try creating a new post."}
        </p>
        {hasFilters && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClear}
            style={{ marginTop: 12 }}
          >
            <X size={13} style={{ marginRight: 5 }} />
            Clear filters
          </button>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────────────────────── */
export function Pagination({ pagination, onPageChange }) {
  const { page, totalPages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

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

        {pages?.[0] > 1 && (
          <>
            <button type="button" className="pg-page-btn" onClick={() => onPageChange(1)}>1</button>
            {pages?.[0] > 2 && <span className="pg-page-ellipsis">…</span>}
          </>
        )}

        {pages?.map((p) => (
          <button
            key={p}
            type="button"
            className={`pg-page-btn${p === page ? " pg-page-btn--active" : ""}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        {pages?.[pages?.length - 1] < totalPages && (
          <>
            {pages?.[pages.length - 1] < totalPages - 1 && <span className="pg-page-ellipsis">…</span>}
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