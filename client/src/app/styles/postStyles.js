export const STYLES = `
  /* ── Root ── */
  .pc-root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--bg-light);
  }

  /* ── Topbar ── */
  .pc-topbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px;
    height: 56px;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-light);
    position: sticky;
    top: 0;
    z-index: 50;
    flex-shrink: 0;
  }

  .pc-topbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .pc-sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .pc-sidebar-toggle:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .pc-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  .pc-breadcrumb span:last-child {
    color: var(--text-primary);
    font-weight: var(--font-medium);
  }

  .pc-topbar-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .pc-stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .pc-status-badge {
    padding: 3px 10px;
    border-radius: var(--radius-xl);
    font-size: 11px;
    font-weight: var(--font-semibold);
    letter-spacing: .03em;
  }

  .pc-topbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* ── Toast ── */
  .pc-toast-wrap {
    padding: 12px 20px 0;
  }

  /* ── Layout ── */
  .pc-layout {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .pc-layout--sidebar .pc-main {
    max-width: none;
  }

  /* ── Main ── */
  .pc-main {
    flex: 1;
    min-width: 0;
    padding: 40px;
    max-width: 860px;
    margin: 0 auto;
    width: 100%;
  }

  .pc-layout--sidebar .pc-main {
    margin: 0;
    padding: 36px 48px;
  }

  @media (max-width: 768px) {
    .pc-main {
      padding: 24px 16px;
    }
    .pc-layout--sidebar .pc-main {
      padding: 24px 16px;
    }
  }

  /* ── Title ── */
  .pc-title-wrap {
    margin-bottom: 28px;
  }

  .pc-title-input {
    width: 100%;
    font-size: 2.2rem;
    font-weight: var(--font-bold);
    line-height: 1.2;
    color: var(--text-primary);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    outline: none;
    resize: none;
    overflow: hidden;
    padding: 0 0 12px;
    transition: border-color var(--transition-fast);
  }

  .pc-title-input::placeholder {
    color: var(--text-muted);
    opacity: .5;
  }

  .pc-title-input:focus {
    border-bottom-color: var(--brand-primary);
  }

  .pc-title-input--error {
    border-bottom-color: #dc2626 !important;
  }

  /* ── Editor ── */
  .pc-editor-wrap {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    min-height: 500px;
    padding: 28px 32px;
    transition: border-color var(--transition-fast);
  }

  .pc-editor-wrap:focus-within {
    border-color: var(--border-medium);
  }

  .pc-editor-wrap--error {
    border-color: #dc2626;
  }

  .pc-editor-inner {
    min-height: 440px;
  }

  /* Override Editor.js styles */
  .ce-block__content,
  .ce-toolbar__content {
    max-width: none !important;
  }

  .cdx-input {
    background: var(--bg-secondary) !important;
    border-color: var(--border-light) !important;
    color: var(--text-primary) !important;
  }

  .ce-paragraph {
    color: var(--text-primary) !important;
    font-size: var(--text-md) !important;
    line-height: var(--line-relaxed) !important;
  }

  /* Skeleton loader */
  .pc-editor-skeleton {
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pc-skeleton {
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
    animation: pc-pulse 1.6s ease-in-out infinite;
  }

  .pc-skeleton--h3 {
    height: 28px;
    width: 55%;
  }

  .pc-skeleton--p {
    height: 16px;
    width: 100%;
  }

  .pc-skeleton--short {
    width: 72%;
  }

  @keyframes pc-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .45; }
  }

  /* ── Sidebar ── */
  .pc-sidebar {
    width: 320px;
    flex-shrink: 0;
    background: var(--bg-primary);
    border-left: 1px solid var(--border-light);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 56px;
    height: calc(100vh - 56px);
    overflow: hidden;
  }

  @media (max-width: 900px) {
    .pc-sidebar {
      display: none;
    }
  }

  /* ── Tabs ── */
  .pc-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-light);
    flex-shrink: 0;
  }

  .pc-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px 0;
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--text-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: color var(--transition-fast);
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .pc-tab:hover { color: var(--text-primary); }

  .pc-tab--active {
    color: var(--brand-primary);
    border-bottom-color: var(--brand-primary);
  }

  /* ── Sidebar body ── */
  .pc-sidebar-body {
    flex: 1;
    overflow-y: auto;
    padding: 0;
    scrollbar-width: thin;
  }

  .pc-sidebar-body::-webkit-scrollbar { width: 4px; }
  .pc-sidebar-body::-webkit-scrollbar-thumb {
    background: var(--border-medium);
    border-radius: 99px;
  }

  /* ── Sidebar sections ── */
  .pc-sidebar-section {
    padding: 18px 20px;
    border-bottom: 1px solid var(--border-light);
  }

  .pc-sidebar-section:last-child {
    border-bottom: none;
  }

  /* ── Toggle ── */
  .pc-toggle-group {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pc-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }

  .pc-toggle-info {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .pc-toggle {
    width: 36px;
    height: 20px;
    border-radius: 99px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-medium);
    cursor: pointer;
    position: relative;
    transition: background var(--transition-fast), border-color var(--transition-fast);
    flex-shrink: 0;
  }

  .pc-toggle--on {
    background: var(--brand-primary);
    border-color: var(--brand-primary);
  }

  .pc-toggle-thumb {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    top: 2px;
    left: 2px;
    transition: transform var(--transition-fast);
    box-shadow: var(--shadow-sm);
  }

  .pc-toggle--on .pc-toggle-thumb {
    transform: translateX(16px);
  }

  /* ── Thumbnail ── */
  .pc-thumb-dropzone {
    border: 2px dashed var(--border-light);
    border-radius: var(--radius-lg);
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    background: var(--bg-secondary);
    text-align: center;
    transition: border-color .2s, background .2s;
  }

  .pc-thumb-dropzone:hover,
  .pc-thumb-dropzone--drag {
    border-color: var(--brand-primary);
    background: var(--brand-primary-light);
  }

  .pc-thumb-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    border: 1px solid var(--border-light);
  }

  .pc-thumb-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .pc-thumb-text strong { color: var(--brand-primary); font-weight: var(--font-semibold); }

  .pc-thumb-sub {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .pc-thumb-preview {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border-light);
  }

  .pc-thumb-img {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
    display: block;
  }

  .pc-thumb-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity .2s;
  }

  .pc-thumb-preview:hover .pc-thumb-overlay { opacity: 1; }

  .pc-thumb-change {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 14px;
    border-radius: var(--radius-md);
    background: #fff;
    color: #111;
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    border: none;
    cursor: pointer;
  }

  .pc-thumb-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: var(--radius-md);
    background: #fef2f2;
    color: #dc2626;
    border: none;
    cursor: pointer;
  }

  /* ── Tag selector ── */
  .pc-tag-selector { position: relative; }

  .pc-tag-input-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid var(--border-black);
    border-radius: var(--radius-sm);
    background: var(--bg-primary);
    min-height: 40px;
    cursor: text;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    align-items: center;
  }

  .pc-tag-input-wrap--focus {
    border-color: var(--brand-primary);
    box-shadow: var(--focus-ring);
  }

  .pc-tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px 3px 8px;
    background: var(--brand-primary-light);
    border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
    border-radius: var(--radius-xl);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--brand-primary);
    line-height: 1;
  }

  .pc-tag-chip button {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    margin-left: 2px;
    opacity: .7;
  }

  .pc-tag-chip button:hover { opacity: 1; }

  .pc-tag-text-input {
    flex: 1;
    min-width: 80px;
    border: none;
    outline: none;
    background: transparent;
    font-size: var(--text-sm);
    color: var(--text-primary);
    padding: 0;
  }

  .pc-tag-text-input::placeholder { color: var(--text-muted); }

  /* ── Category selector ── */
  .pc-cat-selector { position: relative; }

  .pc-cat-trigger {
    display: flex;
    align-items: center;
    gap: 7px;
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border-black);
    border-radius: var(--radius-sm);
    background: var(--bg-primary);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    cursor: pointer;
    text-align: left;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pc-cat-trigger:hover,
  .pc-cat-trigger--open {
    border-color: var(--brand-primary);
    box-shadow: var(--focus-ring);
  }

  .pc-cat-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 100;
    max-height: 220px;
    overflow-y: auto;
    padding: 6px 0;
  }

  .pc-cat-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    cursor: pointer;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    transition: background var(--transition-fast);
  }

  .pc-cat-option:hover { background: var(--bg-secondary); }

  .pc-cat-option input { display: none; }

  .pc-cat-check {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1.5px solid var(--border-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background var(--transition-fast), border-color var(--transition-fast);
    color: #fff;
  }

  .pc-cat-option input:checked + .pc-cat-check {
    background: var(--brand-primary);
    border-color: var(--brand-primary);
  }

  .pc-cat-name { flex: 1; }

  .pc-cat-badge {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: var(--radius-xl);
    background: var(--bg-tertiary);
    color: var(--text-muted);
  }

  .pc-cat-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .pc-cat-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    background: var(--brand-primary-light);
    border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
    border-radius: var(--radius-xl);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--brand-primary);
  }

  .pc-cat-chip button {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    opacity: .7;
  }

  .pc-cat-chip button:hover { opacity: 1; }

  /* ── Generic dropdown ── */
  .pc-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 100;
    max-height: 240px;
    overflow-y: auto;
    padding: 4px 0;
  }

  .pc-dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    text-align: left;
    transition: background var(--transition-fast);
  }

  .pc-dropdown-item:hover { background: var(--bg-secondary); }

  .pc-dropdown-count {
    margin-left: auto;
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  /* ── SEO ── */
  .pc-seo-preview {
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .pc-seo-url {
    font-size: 12px;
    color: #16a34a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pc-seo-title {
    font-size: 15px;
    color: #1a0dab;
    font-weight: var(--font-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dark .pc-seo-title { color: #8ab4f8; }

  .pc-seo-desc {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .pc-char-warn { color: #dc2626 !important; }

  /* ── SEO checklist ── */
  .pc-seo-checklist {
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 14px 16px;
  }

  .pc-seo-check-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--text-muted);
    margin-bottom: 10px;
  }

  .pc-seo-check-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-xs);
    color: var(--text-muted);
    padding: 4px 0;
  }

  .pc-seo-check-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--border-medium);
    flex-shrink: 0;
    transition: background .2s;
  }

  .pc-seo-check-item--pass .pc-seo-check-dot {
    background: #16a34a;
  }

  .pc-seo-check-item--pass {
    color: var(--text-secondary);
  }

  /* ── Spinner ── */
  @keyframes pc-spin { to { transform: rotate(360deg); } }
  .pc-spinner { animation: pc-spin .65s linear infinite; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .pc-topbar-stats { display: none; }
    .pc-topbar-actions .btn-outline { display: none; }
  }

  @media (max-width: 480px) {
    .pc-title-input { font-size: 1.6rem; }
    .pc-breadcrumb { display: none; }
  }
`;