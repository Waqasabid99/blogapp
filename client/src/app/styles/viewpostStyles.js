export const VP_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

  /* ── Reading progress ── */
  .vp-progress-track {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--bg-tertiary);
    z-index: 200;
  }
  .vp-progress-fill {
    height: 100%;
    background: var(--brand-primary);
    transition: width .1s linear;
    border-radius: 0 99px 99px 0;
  }

  /* ── Root ── */
  .vp-root {
    max-width: 100vw;
    margin: 0 auto;
    padding: 0 24px 80px;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Breadcrumb ── */
  .vp-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 32px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .vp-breadcrumb a {
    color: var(--text-muted);
    text-decoration: none;
    transition: color .15s;
  }
  .vp-breadcrumb a:hover { color: var(--brand-primary); }
  .vp-breadcrumb span:last-child {
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 280px;
  }
  .vp-breadcrumb-sep { color: var(--border-medium); }

  /* ── Hero ── */
  .vp-hero {
    max-width: 80%;
  }

  .vp-cat-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 18px;
  }

  .vp-cat-pill {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--brand-primary);
    background: var(--brand-primary-light);
    border: 1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent);
    text-decoration: none;
    transition: opacity .15s;
  }
  .vp-cat-pill:hover { opacity: .8; }

  .vp-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 600;
  }
  .vp-badge--featured {
    background: #fef9c3;
    color: #a16207;
    border: 1px solid #fde68a;
  }
  .vp-badge--pinned {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
  }

  /* Title */
  .vp-title {
    font-family: 'Lora', Georgia, serif;
    font-size: clamp(2rem, 4vw, 3.2rem);
    font-weight: 700;
    line-height: 1.18;
    color: var(--text-primary);
    letter-spacing: -.02em;
    margin: 0 0 20px;
  }

  /* Excerpt */
  .vp-excerpt {
    font-size: 1.15rem;
    line-height: 1.7;
    color: var(--text-secondary);
    margin: 0 0 28px;
    font-style: italic;
    font-family: 'Lora', serif;
    border-left: 3px solid var(--brand-primary);
    padding-left: 16px;
  }

  /* Meta row */
  .vp-meta-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    padding: 20px 0;
    border-top: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light);
  }

  .vp-author-chip {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .vp-author-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-light);
    flex-shrink: 0;
  }
  .vp-author-avatar--fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--brand-primary-light);
    color: var(--brand-primary);
    font-weight: 700;
    font-size: 14px;
  }

  .vp-author-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .vp-author-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.2;
  }
  .vp-author-date {
    font-size: 12px;
    color: var(--text-muted);
  }

  .vp-meta-divider {
    width: 1px;
    height: 28px;
    background: var(--border-light);
    flex-shrink: 0;
  }

  .vp-stats {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .vp-stat {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--text-muted);
  }

  /* ── Cover ── */
  .vp-cover {
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-bottom: 0;
    position: relative;
  }
  .vp-cover-img {
    width: 100%;
    aspect-ratio: 21/9;
    object-fit: cover;
    display: block;
    border-radius: var(--radius-lg);
  }
  .vp-cover-caption {
    text-align: center;
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 8px;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .vp-cover-img { aspect-ratio: 16/9; }
  }

  /* ── Body layout ── */
  .vp-body {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 48px;
    margin-top: 48px;
    align-items: start;
  }

  @media (max-width: 1024px) {
    .vp-body {
      grid-template-columns: 1fr;
    }
    .vp-sidebar { display: none; }
  }

  /* ── Sidebar ── */
  .vp-sidebar {
    min-width: 0;
  }
  .vp-sidebar-sticky {
    position: sticky;
    top: 80px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* TOC */
  .vp-toc {
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 18px 20px;
  }
  .vp-toc-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--text-muted);
    margin: 0 0 12px;
  }
  .vp-toc-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .vp-toc-item a {
    display: block;
    padding: 5px 8px;
    border-radius: var(--radius-sm);
    font-size: 12.5px;
    color: var(--text-muted);
    text-decoration: none;
    line-height: 1.4;
    transition: color .15s, background .15s;
    border-left: 2px solid transparent;
  }
  .vp-toc-item a:hover {
    color: var(--text-primary);
    background: var(--bg-tertiary);
  }
  .vp-toc-item--active a {
    color: var(--brand-primary);
    border-left-color: var(--brand-primary);
    background: var(--brand-primary-light);
    font-weight: 500;
  }
  .vp-toc-item--h3 a { padding-left: 18px; font-size: 12px; }

  /* Share */
  .vp-share {
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 18px 20px;
  }
  .vp-share-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--text-muted);
    margin: 0 0 12px;
  }
  .vp-share-btns {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .vp-share-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--radius-md);
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    text-decoration: none;
    cursor: pointer;
    transition: border-color .15s, color .15s, background .15s;
  }
  .vp-share-btn:hover {
    border-color: var(--brand-primary);
    color: var(--brand-primary);
  }
  .vp-share-btn--copied {
    color: #16a34a;
    border-color: #bbf7d0;
    background: #f0fdf4;
  }

  /* ── Prose / content ── */
  .vp-content {
    min-width: 0;
    max-width: 720px;
  }

  .vp-series-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: var(--brand-primary-light);
    border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
    border-radius: var(--radius-lg);
    margin-bottom: 32px;
  }
  .vp-series-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--brand-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .vp-series-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--brand-primary);
    display: block;
    margin-bottom: 2px;
  }
  .vp-series-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    text-decoration: none;
    transition: color .15s;
  }
  .vp-series-name:hover { color: var(--brand-primary); }

  /* ── PROSE BLOCKS ── */
  .vp-prose { color: var(--text-primary); }

  .vp-heading {
    font-family: 'Lora', Georgia, serif;
    color: var(--text-primary);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -.01em;
    margin: 2.2em 0 .7em;
  }
  .vp-heading--2 { font-size: 1.75rem; }
  .vp-heading--3 { font-size: 1.35rem; }
  .vp-heading--4 { font-size: 1.1rem; }

  .vp-paragraph {
    font-size: 1.05rem;
    line-height: 1.85;
    margin: 0 0 1.4em;
    color: var(--text-secondary);
  }
  .vp-paragraph a {
    color: var(--brand-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .vp-paragraph b, .vp-paragraph strong { color: var(--text-primary); font-weight: 600; }
  .vp-paragraph i, .vp-paragraph em { font-style: italic; }
  .vp-paragraph code {
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    font-size: .9em;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    border-radius: 4px;
    padding: 2px 6px;
    color: var(--text-primary);
  }
  .vp-paragraph mark {
    background: #fef9c3;
    color: inherit;
    border-radius: 2px;
    padding: 0 2px;
  }

  .vp-list {
    margin: 0 0 1.4em 1.2em;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .vp-list li {
    font-size: 1.05rem;
    line-height: 1.75;
    color: var(--text-secondary);
    padding-left: 4px;
  }
  .vp-list--unordered { list-style: disc; }
  .vp-list--ordered  { list-style: decimal; }

  .vp-checklist {
    list-style: none;
    margin: 0 0 1.4em;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .vp-checklist-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 1.05rem;
    line-height: 1.6;
    color: var(--text-secondary);
  }
  .vp-check-icon {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1.5px solid var(--border-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 3px;
    color: #fff;
  }
  .vp-checklist-item--checked .vp-check-icon {
    background: var(--brand-primary);
    border-color: var(--brand-primary);
  }
  .vp-checklist-item--checked > span:last-child {
    text-decoration: line-through;
    opacity: .6;
  }

  .vp-blockquote {
    border-left: 4px solid var(--brand-primary);
    background: var(--bg-secondary);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    padding: 20px 24px;
    margin: 0 0 1.6em;
  }
  .vp-blockquote p {
    font-family: 'Lora', Georgia, serif;
    font-size: 1.15rem;
    font-style: italic;
    line-height: 1.7;
    color: var(--text-primary);
    margin: 0 0 8px;
  }
  .vp-blockquote cite {
    font-size: .9rem;
    color: var(--text-muted);
    font-style: normal;
  }
  .vp-blockquote cite::before { content: "— "; }

  .vp-code-block {
    background: #0f172a;
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin: 0 0 1.6em;
    border: 1px solid #1e293b;
  }
  .vp-code-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: #1e293b;
    border-bottom: 1px solid #334155;
  }
  .vp-code-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #475569;
  }
  .vp-code-dot:nth-child(1) { background: #f87171; }
  .vp-code-dot:nth-child(2) { background: #fbbf24; }
  .vp-code-dot:nth-child(3) { background: #4ade80; }
  .vp-code-block pre {
    margin: 0;
    padding: 20px 24px;
    overflow-x: auto;
    font-family: 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
    font-size: .9rem;
    line-height: 1.7;
    color: #e2e8f0;
  }
  .vp-code-block pre::-webkit-scrollbar { height: 4px; }
  .vp-code-block pre::-webkit-scrollbar-thumb { background: #334155; border-radius: 99px; }

  .vp-figure {
    margin: 0 0 1.6em;
    text-align: center;
  }
  .vp-figure--stretched { margin-left: -5%; margin-right: -5%; }
  .vp-figure--bg {
    background: var(--bg-secondary);
    padding: 16px;
    border-radius: var(--radius-lg);
  }
  .vp-img {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-md);
    display: inline-block;
  }
  .vp-img--border { border: 1px solid var(--border-light); }
  .vp-figure figcaption {
    font-size: .85rem;
    color: var(--text-muted);
    margin-top: 8px;
    font-style: italic;
  }

  .vp-delimiter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 2em 0;
  }
  .vp-delimiter span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--border-medium);
  }

  .vp-warning {
    display: flex;
    gap: 14px;
    padding: 16px 18px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: var(--radius-md);
    margin: 0 0 1.6em;
  }
  .dark .vp-warning { background: #422006; border-color: #92400e; }
  .vp-warning-icon {
    font-size: 18px;
    line-height: 1;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .vp-warning p { font-size: .95rem; color: var(--text-secondary); margin: 0; line-height: 1.6; }
  .vp-warning-title { font-weight: 600; color: var(--text-primary) !important; margin-bottom: 4px !important; }

  .vp-table-wrap {
    overflow-x: auto;
    margin: 0 0 1.6em;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
  }
  .vp-table {
    width: 100%;
    border-collapse: collapse;
    font-size: .95rem;
  }
  .vp-table th, .vp-table td {
    padding: 11px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-light);
    color: var(--text-secondary);
  }
  .vp-table th {
    font-weight: 600;
    color: var(--text-primary);
    background: var(--bg-secondary);
    font-size: .85rem;
    text-transform: uppercase;
    letter-spacing: .05em;
  }
  .vp-table tr:last-child td { border-bottom: none; }
  .vp-table tr:hover td { background: var(--bg-secondary); }

  .vp-embed {
    margin: 0 0 1.6em;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border-light);
    background: var(--bg-secondary);
  }
  .vp-embed iframe {
    width: 100%;
    aspect-ratio: 16/9;
    border: none;
    display: block;
  }
  .vp-embed-caption {
    text-align: center;
    font-size: .85rem;
    color: var(--text-muted);
    padding: 8px 16px 12px;
    font-style: italic;
    margin: 0;
  }

  .vp-link-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    background: var(--bg-secondary);
    text-decoration: none;
    margin: 0 0 1.6em;
    transition: border-color .15s, box-shadow .15s;
  }
  .vp-link-card:hover {
    border-color: var(--brand-primary);
    box-shadow: var(--shadow-sm);
  }
  .vp-link-card-img {
    width: 80px;
    height: 56px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
  }
  .vp-link-card-body { flex: 1; min-width: 0; }
  .vp-link-card-title {
    font-size: .95rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .vp-link-card-desc {
    font-size: .85rem;
    color: var(--text-muted);
    margin: 0 0 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
  }
  .vp-link-card-url {
    font-size: .78rem;
    color: #16a34a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  /* ── Tags section ── */
  .vp-tags-section {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    padding: 24px 0;
    border-top: 1px solid var(--border-light);
    margin-top: 40px;
  }
  .vp-tags-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--text-muted);
    flex-shrink: 0;
  }
  .vp-tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .vp-tag-pill {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    text-decoration: none;
    transition: border-color .15s, color .15s, background .15s;
  }
  .vp-tag-pill:hover {
    border-color: var(--brand-primary);
    color: var(--brand-primary);
    background: var(--brand-primary-light);
  }

  /* ── Author bio card ── */
  .vp-author-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    margin-top: 32px;
  }
  .vp-author-card-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-light);
    flex-shrink: 0;
  }
  .vp-author-card-avatar--fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--brand-primary-light);
    color: var(--brand-primary);
    font-weight: 700;
    font-size: 18px;
  }
  .vp-author-card-body { flex: 1; min-width: 0; }
  .vp-author-card-name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 6px;
  }
  .vp-author-card-bio {
    font-size: .9rem;
    color: var(--text-muted);
    line-height: 1.6;
    margin: 0;
  }

  /* ── Related posts ── */
  .vp-related {
    margin-top: 64px;
    padding-top: 40px;
    border-top: 1px solid var(--border-light);
  }
  .vp-related-heading {
    font-family: 'Lora', Georgia, serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 28px;
  }
  .vp-related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  @media (max-width: 640px) {
    .vp-related-grid { grid-template-columns: 1fr; }
  }
  .vp-related-card {
    text-decoration: none;
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: border-color .2s, box-shadow .2s, transform .2s;
  }
  .vp-related-card:hover {
    border-color: var(--border-medium);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  .vp-related-cover {
    aspect-ratio: 16/9;
    overflow: hidden;
    background: var(--bg-tertiary);
  }
  .vp-related-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform .4s;
  }
  .vp-related-card:hover .vp-related-cover img { transform: scale(1.04); }
  .vp-related-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }
  .vp-related-cat {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .07em;
    color: var(--brand-primary);
  }
  .vp-related-title {
    font-size: .95rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .vp-related-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--text-muted);
    margin-top: auto;
    padding-top: 8px;
  }
  .vp-related-meta span + span::before {
    content: "·";
    margin-right: 8px;
  }

  /* ── Responsive tweaks ── */
  @media (max-width: 768px) {
    .vp-root { padding: 0 16px 60px; }
    .vp-title { font-size: 1.8rem; }
    .vp-excerpt { font-size: 1rem; }
    .vp-paragraph { font-size: 1rem; }
    .vp-heading--2 { font-size: 1.4rem; }
    .vp-heading--3 { font-size: 1.15rem; }
    .vp-figure--stretched { margin-left: 0; margin-right: 0; }
  }
`;