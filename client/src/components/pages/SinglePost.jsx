"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { VP_STYLES } from "@/app/styles/viewpostStyles";
import RenderBlock from "@/constants/RenderEditor";
import { PostCard } from "../ui/PostCard";

/* ─────────────────────────────────────────────────────────────────────────────
   Reading progress bar
───────────────────────────────────────────────────────────────────────────── */
const ReadingProgress = () => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            const el = document.documentElement;
            const scrollTop = el.scrollTop || document.body.scrollTop;
            const scrollHeight = el.scrollHeight - el.clientHeight;
            setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (
        <div className="vp-progress-track">
            <div className="vp-progress-fill" style={{ width: `${progress}%` }} />
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Table of contents  (extracts h2 / h3 from EditorJS blocks)
───────────────────────────────────────────────────────────────────────────── */
const TableOfContents = ({ blocks = [] }) => {
    const [activeId, setActiveId] = useState("");
    const headings = blocks
        .filter((b) => b.type === "header" && b.data.level <= 3)
        .map((b) => ({
            id: b.id,
            text: b.data.text.replace(/<[^>]+>/g, ""),
            level: b.data.level,
        }));

    useEffect(() => {
        if (!headings.length) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                });
            },
            { rootMargin: "0px 0px -70% 0px" }
        );
        headings.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [headings.length]);

    if (headings.length < 2) return null;

    return (
        <nav className="vp-toc">
            <p className="vp-toc-title">On this page</p>
            <ol className="vp-toc-list">
                {headings.map(({ id, text, level }) => (
                    <li key={id} className={`vp-toc-item vp-toc-item--h${level}${activeId === id ? " vp-toc-item--active" : ""}`}>
                        <a href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }}>
                            {text}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Copy link button
───────────────────────────────────────────────────────────────────────────── */
const CopyLink = () => {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button className={`vp-share-btn${copied ? " vp-share-btn--copied" : ""}`} onClick={copy} title="Copy link">
            {copied ? (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            )}
            <span>{copied ? "Copied!" : "Copy link"}</span>
        </button>
    );
};

const ViewPost = ({ post, relatedPosts = [] }) => {
    const blocks = post?.content?.blocks ?? [];

    const formattedDate = post?.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
        })
        : post?.createdAt
            ? new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
            })
            : null;

    const authorInitials = post?.author?.name
        ? post.author.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    return (
        <>
            <style>{VP_STYLES}</style>

            <ReadingProgress />

            <article className="vp-root">

                {/* ── HERO ── */}
                <header className="vp-hero mt-10">
                    {/* Category badges */}
                    {post?.categories?.length > 0 && (
                        <div className="vp-cat-row">
                            {post.categories.map(({ category }) => (
                                <Link key={category.id} href={`/blog/category/${category.slug}`} className="vp-cat-pill">
                                    {category.name}
                                </Link>
                            ))}
                            {post?.isFeatured && <span className="vp-badge vp-badge--featured">⭐ Featured</span>}
                            {post?.isPinned && <span className="vp-badge vp-badge--pinned">📌 Pinned</span>}
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="vp-title">{post?.title}</h1>

                    {/* Excerpt */}
                    {post?.excerpt && (
                        <p className="vp-excerpt">{post.excerpt}</p>
                    )}

                    {/* Meta row */}
                    <div className="vp-meta-row">
                        {/* Author */}
                        <div className="vp-author-chip">
                            {post?.author?.avatarUrl ? (
                                <img
                                    src={post.author.avatarUrl}
                                    alt={post.author.name}
                                    className="vp-author-avatar"
                                />
                            ) : (
                                <span className="vp-author-avatar vp-author-avatar--fallback">
                                    {authorInitials}
                                </span>
                            )}
                            <div className="vp-author-info">
                                <span className="vp-author-name">{post?.author?.name ?? "Unknown"}</span>
                                {formattedDate && <span className="vp-author-date">{formattedDate}</span>}
                            </div>
                        </div>

                        <div className="vp-meta-divider" />

                        {/* Stats */}
                        <div className="vp-stats">
                            {post?.readingTime && (
                                <span className="vp-stat">
                                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    {post.readingTime} min read
                                </span>
                            )}
                            {post?.wordCount && (
                                <span className="vp-stat">
                                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 4h10M3 8h10M3 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    {post.wordCount.toLocaleString()} words
                                </span>
                            )}
                            {post?.viewCount > 0 && (
                                <span className="vp-stat">
                                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 3C4.5 3 2 8 2 8s2.5 5 6 5 6-5 6-5-2.5-5-6-5z" stroke="currentColor" strokeWidth="1.5" />
                                        <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    {post.viewCount.toLocaleString()} views
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── COVER IMAGE ── */}
                {post?.coverImage?.url && (
                    <div className="vp-cover">
                        <img
                            src={post.coverImage.url}
                            alt={post.coverImage.altText || post.title}
                            className="vp-cover-img"
                            priority="true"
                        />
                        {post.coverImage.altText && (
                            <p className="vp-cover-caption">{post.coverImage.altText}</p>
                        )}
                    </div>
                )}

                {/* ── BODY ── */}
                <div className="vp-body">

                    {/* ── SIDEBAR (TOC + Share) ── */}
                    <aside className="vp-sidebar">
                        <div className="vp-sidebar-sticky">
                            <TableOfContents blocks={blocks} />

                            {/* Share */}
                            <div className="vp-share">
                                <p className="vp-share-title">Share</p>
                                <div className="vp-share-btns">
                                    <a
                                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post?.title ?? "")}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="vp-share-btn"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                        <span>Twitter</span>
                                    </a>
                                    <a
                                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&title=${encodeURIComponent(post?.title ?? "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="vp-share-btn"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        <span>LinkedIn</span>
                                    </a>
                                    <CopyLink />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ── MAIN CONTENT ── */}
                    <main className="vp-content">

                        {/* Series banner */}
                        {post?.series && (
                            <div className="vp-series-banner">
                                <div className="vp-series-icon">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="vp-series-body">
                                    <span className="vp-series-label">Part of a series</span>
                                    <Link href={`/blog/series/${post.series.slug}`} className="vp-series-name">
                                        {post.series.title}
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* EditorJS blocks */}
                        <div className="vp-prose">
                            {blocks.map((block) => (
                                <div key={block.id} id={block.id}>
                                    <RenderBlock block={block} />
                                </div>
                            ))}
                        </div>

                        {/* ── TAGS ── */}
                        {post?.tags?.length > 0 && (
                            <div className="vp-tags-section">
                                <span className="vp-tags-label">Tags</span>
                                <div className="vp-tags-list">
                                    {post.tags.map(({ tag }) => (
                                        <Link key={tag.id} href={`/blog/tag/${tag.slug}`} className="vp-tag-pill">
                                            #{tag.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── AUTHOR BIO ── */}
                        {post?.author && (
                            <div className="vp-author-card">
                                {post.author.avatarUrl ? (
                                    <img src={post.author.avatarUrl} alt={post.author.name} className="vp-author-card-avatar" />
                                ) : (
                                    <span className="vp-author-card-avatar vp-author-card-avatar--fallback">
                                        {authorInitials}
                                    </span>
                                )}
                                <div className="vp-author-card-body">
                                    <p className="vp-author-card-name">{post.author.name}</p>
                                    {post.author.bio && (
                                        <p className="vp-author-card-bio">{post.author.bio}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* ── RELATED POSTS ── */}
                {relatedPosts.length > 0 && (
                    <section className="vp-related">
                        <h2 className="vp-related-heading">More to read</h2>
                        <div className="pg-grid">
                            {relatedPosts?.map((post) => (
                                <PostCard key={post.id} post={post} showActions={false} />
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </>
    );
};

export default ViewPost;