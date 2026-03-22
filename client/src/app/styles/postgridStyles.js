export const STYLES = `
  .pg-root {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* ════ TOOLBAR ════ */
  .pg-toolbar {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pg-toolbar-top {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .pg-toolbar-title { flex: 1; min-width: 0; }

  .pg-title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    line-height: 1.2;
  }

  .pg-desc {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-top: 2px;
  }

  .pg-toolbar-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  /* Search */
  .pg-search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .pg-search-icon {
    position: absolute;
    left: 10px;
    color: var(--text-muted);
    pointer-events: none;
  }

  .pg-search {
    width: 220px;
    padding: 8px 32px 8px 32px;
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .pg-search:focus {
    outline: none;
    border-color: var(--brand-primary);
    box-shadow: var(--focus-ring);
  }

  .pg-search-clear {
    position: absolute;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    padding: 2px;
    border-radius: var(--radius-sm);
  }

  .pg-search-clear:hover { color: var(--text-primary); }

  /* Filter button */
  .pg-filter-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    background: transparent;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: border-color var(--transition-fast), color var(--transition-fast);
    white-space: nowrap;
  }

  .pg-filter-btn:hover,
  .pg-filter-btn--active {
    border-color: var(--brand-primary);
    color: var(--brand-primary);
  }

  .pg-filter-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--brand-primary);
    color: #fff;
    font-size: 10px;
    font-weight: var(--font-bold);
  }

  /* Sort */
  .pg-sort-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-muted);
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    padding: 8px 10px;
  }

  .pg-sort-select {
    border: none;
    background: transparent;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    outline: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
  }

  /* Layout toggle */
  .pg-layout-toggle {
    display: flex;
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .pg-layout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .pg-layout-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }
  .pg-layout-btn--active { background: var(--bg-secondary); color: var(--brand-primary); }

  /* Filter panel */
  .pg-filter-panel {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    padding: 14px 0 2px;
    border-top: 1px solid var(--border-light);
  }

  .pg-filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 140px;
  }

  .pg-filter-label {
    font-size: 10px;
    font-weight: var(--font-semibold);
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--text-muted);
  }

  .pg-filter-select-wrap {
    position: relative;
  }

  .pg-filter-select {
    width: 100%;
    padding: 7px 26px 7px 10px;
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    background: var(--bg-primary);
    color: var(--text-secondary);
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    outline: none;
    transition: border-color var(--transition-fast);
  }

  .pg-filter-select:focus { border-color: var(--brand-primary); }

  .pg-filter-chevron {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--text-muted);
  }

  .pg-filter-clear {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 18px;
    padding: 7px 12px;
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    background: transparent;
    font-size: var(--text-xs);
    color: var(--text-muted);
    cursor: pointer;
    align-self: flex-end;
    transition: color var(--transition-fast), border-color var(--transition-fast);
  }

  .pg-filter-clear:hover { color: #dc2626; border-color: #fecaca; }

  /* Active filter chips */
  .pg-active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-top: 8px;
    border-top: 1px solid var(--border-light);
  }

  .pg-active-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px 3px 10px;
    background: var(--brand-primary-light);
    border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
    border-radius: var(--radius-xl);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--brand-primary);
  }

  .pg-active-chip button {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    opacity: .7;
    padding: 0;
  }

  .pg-active-chip button:hover { opacity: 1; }

  /* ════ ERROR ════ */
  .pg-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: #dc2626;
    margin-bottom: 16px;
  }

  /* ════ GRID ════ */
  .pg-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  @media (max-width: 640px) {
    .pg-grid { grid-template-columns: 1fr; }
  }

  /* ════ CARD ════ */
  .pg-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  }

  .pg-card:hover {
    border-color: var(--border-medium);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  /* Cover */
  .pg-card-cover {
    position: relative;
    aspect-ratio: 16/9;
    background: var(--bg-tertiary);
    overflow: hidden;
    flex-shrink: 0;
  }

  .pg-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform .4s ease;
  }

  .pg-card:hover .pg-card-img { transform: scale(1.03); }

  .pg-card-no-img {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--border-medium);
    background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-light) 100%);
  }

  .pg-card-cover-badges {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    gap: 5px;
  }

  .pg-card-status-pos {
    position: absolute;
    bottom: 8px;
    right: 8px;
  }

  /* Body */
  .pg-card-body {
    padding: 16px 16px 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pg-card-cats {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .pg-card-title {
    font-size: var(--text-md);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    line-height: 1.35;
  }

  .pg-card-title a {
    color: inherit;
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .pg-card-title a:hover { color: var(--brand-primary); }

  .pg-card-excerpt {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.55;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  .pg-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: auto;
  }

  /* Footer */
  .pg-card-footer {
    padding: 10px 16px;
    border-top: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-secondary);
  }

  .pg-card-author {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .pg-card-author-name {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-weight: var(--font-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pg-card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* ════ LIST ════ */
  .pg-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--border-light);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  /* Row */
  .pg-row {
    display: flex;
    align-items: center;
    max-width: 100%;
    gap: 16px;
    padding: 14px 16px;
    background: var(--bg-primary);
    transition: background var(--transition-fast);
  }

  .pg-row:hover { background: var(--bg-secondary); }

  .pg-row-thumb {
    width: 80px;
    height: 54px;
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;
    background: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pg-row-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .pg-row-no-img {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--border-medium);
  }

  .pg-row-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .pg-row-top {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .pg-row-badges {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .pg-row-title {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pg-row-title a {
    color: inherit;
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .pg-row-title a:hover { color: var(--brand-primary); }

  .pg-row-excerpt {
    font-size: var(--text-xs);
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pg-row-bottom {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .pg-row-author {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-weight: var(--font-medium);
  }

  .pg-row-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  /* ════ SHARED ATOMS ════ */
  .pg-avatar {
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid var(--border-light);
    flex-shrink: 0;
  }

  .pg-avatar--fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--brand-primary-light);
    color: var(--brand-primary);
    font-weight: var(--font-bold);
    letter-spacing: -.02em;
  }

  .pg-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: var(--radius-xl);
    font-size: 10px;
    font-weight: var(--font-semibold);
    letter-spacing: .03em;
    white-space: nowrap;
  }

  .pg-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 7px;
    border-radius: var(--radius-xl);
    font-size: 10px;
    font-weight: var(--font-semibold);
    white-space: nowrap;
  }

  .pg-badge--featured {
    background: #fef9c3;
    color: #a16207;
    border: 1px solid #fde68a;
  }

  .pg-badge--pinned {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
  }

  .pg-cat-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: var(--font-semibold);
    text-transform: uppercase;
    letter-spacing: .05em;
    color: var(--brand-primary);
    background: var(--brand-primary-light);
    padding: 2px 7px;
    border-radius: var(--radius-xl);
    border: 1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent);
  }

  .pg-tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: var(--text-muted);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    padding: 2px 7px;
    border-radius: var(--radius-xl);
  }

  .pg-meta-item {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  /* ════ ACTION MENU ════ */
  .pg-card-actions { position: relative; flex-shrink: 0; }

  .pg-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);
    background: var(--bg-primary);
    color: var(--text-muted);
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .pg-action-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }

  .pg-action-menu {
    position: absolute;
    bottom: calc(100% + 4px);
    right: 0;
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    min-width: 140px;
    z-index: 50;
    padding: 4px 0;
    overflow: hidden;
  }

  .pg-action-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 14px;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .pg-action-item:hover { background: var(--bg-secondary); color: var(--text-primary); }

  .pg-action-item--danger:hover { background: #fef2f2; color: #dc2626; }

  /* ════ SKELETON ════ */
  .pg-card--skeleton { pointer-events: none; }
  .pg-row--skeleton { pointer-events: none; }

  .pg-skel {
    background: linear-gradient(
      90deg,
      var(--bg-tertiary) 25%,
      var(--bg-light) 50%,
      var(--bg-tertiary) 75%
    );
    background-size: 200% 100%;
    animation: pg-shimmer 1.5s infinite;
    border-radius: var(--radius-sm);
  }

  @keyframes pg-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .pg-skel--tag   { height: 16px; width: 70px;  }
  .pg-skel--title { height: 18px; width: 90%;   margin: 4px 0; }
  .pg-skel--text  { height: 14px; width: 100%;  }
  .pg-skel--short { width: 65%;   }
  .pg-skel--author { height: 22px; width: 110px; border-radius: 99px; }
  .pg-skel--meta  { height: 14px; width: 70px;  margin-left: auto; }

  .pg-card--skeleton .pg-card-cover {
    aspect-ratio: 16/9;
    border-radius: 0;
  }

  .pg-row--skeleton .pg-row-thumb {
    background: var(--bg-tertiary);
    animation: pg-shimmer 1.5s infinite;
    background-size: 200% 100%;
    background-image: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-light) 50%, var(--bg-tertiary) 75%);
  }

  /* ════ EMPTY STATE ════ */
  .pg-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    text-align: center;
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
  }

  .pg-empty-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px dashed var(--border-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    margin-bottom: 16px;
  }

  .pg-empty-title {
    font-size: var(--text-md);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .pg-empty-sub {
    font-size: var(--text-sm);
    color: var(--text-muted);
    max-width: 320px;
    line-height: 1.6;
  }

  /* ════ PAGINATION ════ */
  .pg-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 4px 0;
    flex-wrap: wrap;
    gap: 12px;
  }

  .pg-pagination-info {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  .pg-pagination-info strong { color: var(--text-secondary); }

  .pg-pagination-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .pg-page-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    height: 34px;
    padding: 0 6px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);
    background: var(--bg-primary);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
  }

  .pg-page-btn:hover:not(:disabled) {
    border-color: var(--brand-primary);
    color: var(--brand-primary);
  }

  .pg-page-btn:disabled {
    opacity: .4;
    cursor: not-allowed;
  }

  .pg-page-btn--active {
    background: var(--brand-primary);
    border-color: var(--brand-primary);
    color: #fff;
    font-weight: var(--font-semibold);
  }

  .pg-page-ellipsis {
    font-size: var(--text-sm);
    color: var(--text-muted);
    padding: 0 4px;
  }

  /* ════ RESPONSIVE ════ */
  @media (max-width: 768px) {
    .pg-toolbar-top { flex-direction: column; align-items: stretch; }
    .pg-toolbar-controls { justify-content: space-between; }
    .pg-search { width: 100%; }
    .pg-search-wrap { flex: 1; }
    .pg-row-excerpt { display: none; }
    .pg-row-actions { flex-direction: column; gap: 4px; }
  }

  @media (max-width: 480px) {
    .pg-filter-panel { flex-direction: column; align-items: stretch; }
    .pg-filter-group { min-width: unset; }
    .pg-pagination { flex-direction: column; align-items: center; }
    .pg-layout-toggle { display: none; }
  }
`;