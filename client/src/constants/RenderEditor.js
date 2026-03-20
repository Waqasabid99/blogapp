import React from "react";

/* ── Helpers ────────────────────────────────────────────────────────────────── */

/**
 * Sanitises a raw HTML string coming from EditorJS inline-tool markup.
 * Uses the browser's DOMParser so we never ship raw __html untouched.
 * Falls back to an empty string if input is nullish.
 */
const sanitize = (html) => {
  if (!html && html !== 0) return "";
  if (typeof html !== "string") return String(html);
  return html;
};

/** Recursively renders EditorJS v2.28+ nested list items */
const ListItem = ({ item, isOrdered, depth = 0 }) => {
  /* New format: { content, meta, items[] }  |  Old format: plain string */
  const content = typeof item === "string" ? item : item?.content ?? "";
  const children = typeof item === "object" ? item?.items ?? [] : [];

  return (
    <li>
      <span dangerouslySetInnerHTML={{ __html: sanitize(content) }} />
      {children.length > 0 && (
        <NestedList items={children} isOrdered={isOrdered} depth={depth + 1} />
      )}
    </li>
  );
};

const NestedList = ({ items, isOrdered, depth }) => {
  const Tag = isOrdered ? "ol" : "ul";
  return (
    <Tag data-depth={depth}>
      {items.map((item, i) => (
        <ListItem key={i} item={item} isOrdered={isOrdered} depth={depth} />
      ))}
    </Tag>
  );
};

/* ── Individual block renderers ──────────────────────────────────────────────── */

const HeaderBlock = ({ data }) => {
  const level = Math.min(Math.max(parseInt(data.level, 10) || 2, 1), 6);
  const Tag = `h${level}`;
  return (
    <Tag
      className={`vp-heading vp-heading--${level}`}
      dangerouslySetInnerHTML={{ __html: sanitize(data.text) }}
    />
  );
};

const ParagraphBlock = ({ data }) => (
  <p
    className="vp-paragraph"
    dangerouslySetInnerHTML={{ __html: sanitize(data.text) }}
  />
);

const ListBlock = ({ data }) => {
  const isOrdered = data.style === "ordered";
  const Tag = isOrdered ? "ol" : "ul";

  return (
    <Tag className={`vp-list vp-list--${data.style}`}>
      {(data.items ?? []).map((item, i) => (
        <ListItem key={i} item={item} isOrdered={isOrdered} depth={0} />
      ))}
    </Tag>
  );
};

const ChecklistBlock = ({ data }) => (
  <ul className="vp-checklist" role="list">
    {(data.items ?? []).map((item, i) => {
      /* New format: { content, meta: { checked } }  |  Old: { text, checked } */
      const label =
        typeof item === "string"
          ? item
          : (item?.content ?? item?.text ?? "");
      const checked =
        typeof item === "object"
          ? !!(item?.meta?.checked ?? item?.checked)
          : false;

      return (
        <li
          key={i}
          className={`vp-checklist-item${checked ? " vp-checklist-item--checked" : ""}`}
          role="listitem"
        >
          <span
            className="vp-check-icon"
            aria-hidden="true"
            aria-checked={checked}
            role="checkbox"
          >
            {checked ? (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </span>
          <span dangerouslySetInnerHTML={{ __html: sanitize(label) }} />
        </li>
      );
    })}
  </ul>
);

const QuoteBlock = ({ data }) => (
  <blockquote
    className={`vp-blockquote vp-blockquote--${data.alignment || "left"}`}
  >
    <p dangerouslySetInnerHTML={{ __html: sanitize(data.text) }} />
    {data.caption && (
      <cite dangerouslySetInnerHTML={{ __html: sanitize(data.caption) }} />
    )}
  </blockquote>
);

const CodeBlock = ({ data }) => (
  <div className="vp-code-block">
    <div className="vp-code-header" aria-hidden="true">
      <span className="vp-code-dot" />
      <span className="vp-code-dot" />
      <span className="vp-code-dot" />
      {data.language && (
        <span className="vp-code-lang">{data.language}</span>
      )}
    </div>
    <pre>
      <code className={data.language ? `language-${data.language}` : undefined}>
        {data.code}
      </code>
    </pre>
  </div>
);

const ImageBlock = ({ data }) => {
  /* EditorJS image block can store URL either at data.url or data.file.url */
  const url = data.file?.url ?? data.url ?? "";
  const caption = data.caption ?? "";
  const withBorder = !!data.withBorder;
  const withBackground = !!data.withBackground;
  const stretched = !!data.stretched;

  if (!url) return null;

  return (
    <figure
      className={[
        "vp-figure",
        stretched ? "vp-figure--stretched" : "",
        withBackground ? "vp-figure--bg" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={url}
        alt={caption || ""}
        className={`vp-img${withBorder ? " vp-img--border" : ""}`}
        loading="lazy"
        decoding="async"
      />
      {caption && (
        <figcaption dangerouslySetInnerHTML={{ __html: sanitize(caption) }} />
      )}
    </figure>
  );
};

const DelimiterBlock = () => (
  <div className="vp-delimiter" role="separator" aria-hidden="true">
    <span />
    <span />
    <span />
  </div>
);

const WarningBlock = ({ data }) => (
  <div className="vp-warning" role="alert">
    <div className="vp-warning-icon" aria-hidden="true">⚠</div>
    <div>
      {data.title && <p className="vp-warning-title">{data.title}</p>}
      <p dangerouslySetInnerHTML={{ __html: sanitize(data.message) }} />
    </div>
  </div>
);

const TableBlock = ({ data }) => {
  if (!Array.isArray(data.content) || data.content.length === 0) return null;

  const hasHeadings = !!data.withHeadings;
  const [headRow, ...bodyRows] = hasHeadings ? data.content : [null, ...data.content];

  return (
    <div className="vp-table-wrap" role="region" tabIndex={0}>
      <table className="vp-table">
        {hasHeadings && headRow && (
          <thead>
            <tr>
              {headRow.map((cell, ci) => (
                <th
                  key={ci}
                  scope="col"
                  dangerouslySetInnerHTML={{ __html: sanitize(cell) }}
                />
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {(hasHeadings ? bodyRows : data.content).map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} dangerouslySetInnerHTML={{ __html: sanitize(cell) }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EmbedBlock = ({ data }) => {
  if (!data.embed) return null;
  return (
    <figure className="vp-embed">
      <div className="vp-embed-wrapper">
        <iframe
          src={data.embed}
          title={data.caption || "Embedded content"}
          allowFullScreen
          loading="lazy"
          style={{
            width: data.width ? `${data.width}px` : "100%",
            height: data.height ? `${data.height}px` : undefined,
          }}
        />
      </div>
      {data.caption && (
        <figcaption className="vp-embed-caption">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
};

const LinkToolBlock = ({ data }) => {
  const link = data.link ?? "";
  const meta = data.meta ?? {};
  const title = meta.title || link;
  const description = meta.description ?? "";
  const imageUrl = meta.image?.url ?? "";

  /* If meta is still being fetched or is empty, show a simple URL pill */
  const hasRichMeta = !!(title !== link || description || imageUrl);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`vp-link-card${!hasRichMeta ? " vp-link-card--plain" : ""}`}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="vp-link-card-img"
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="vp-link-card-body">
        <p className="vp-link-card-title">{title}</p>
        {description && (
          <p className="vp-link-card-desc">{description}</p>
        )}
        <span className="vp-link-card-url">{link}</span>
      </div>
    </a>
  );
};

const RawBlock = ({ data }) => (
  /* Raw HTML — render as-is; only use if your pipeline already sanitizes server-side */
  <div
    className="vp-raw"
    dangerouslySetInnerHTML={{ __html: data.html ?? "" }}
  />
);

const AttachesBlock = ({ data }) => {
  const file = data.file ?? {};
  const { url, name, size, extension } = file;
  if (!url) return null;

  const formattedSize = size
    ? size > 1_048_576
      ? `${(size / 1_048_576).toFixed(1)} MB`
      : `${(size / 1024).toFixed(0)} KB`
    : null;

  return (
    <a
      href={url}
      download={name || true}
      className="vp-attaches"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="vp-attaches-icon" aria-hidden="true">
        📎
      </span>
      <span className="vp-attaches-body">
        <span className="vp-attaches-name">{name || "Download"}</span>
        {(formattedSize || extension) && (
          <span className="vp-attaches-meta">
            {[extension?.toUpperCase(), formattedSize].filter(Boolean).join(" · ")}
          </span>
        )}
      </span>
    </a>
  );
};

/* ── Error Boundary ──────────────────────────────────────────────────────────── */

class BlockErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[RenderBlock] Failed to render block:", this.props.blockType, error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="vp-block-error" aria-label="Content block failed to render" />
      );
    }
    return this.props.children;
  }
}

/* ── Main renderer ───────────────────────────────────────────────────────────── */

const RenderBlock = ({ block }) => {
  if (!block?.type) return null;

  let content = null;

  switch (block.type) {
    case "header":
      content = <HeaderBlock data={block.data} />;
      break;
    case "paragraph":
      content = <ParagraphBlock data={block.data} />;
      break;
    case "list":
      /* EditorJS v2.28+ unifies list + checklist under the "list" type.
         style can be "ordered" | "unordered" | "checklist"             */
      if (block.data.style === "checklist") {
        content = <ChecklistBlock data={block.data} />;
      } else {
        content = <ListBlock data={block.data} />;
      }
      break;
    case "checklist":
      /* Legacy standalone checklist block (older EditorJS versions) */
      content = <ChecklistBlock data={block.data} />;
      break;
    case "quote":
      content = <QuoteBlock data={block.data} />;
      break;
    case "code":
      content = <CodeBlock data={block.data} />;
      break;
    case "image":
      content = <ImageBlock data={block.data} />;
      break;
    case "delimiter":
      content = <DelimiterBlock />;
      break;
    case "warning":
      content = <WarningBlock data={block.data} />;
      break;
    case "table":
      content = <TableBlock data={block.data} />;
      break;
    case "embed":
      content = <EmbedBlock data={block.data} />;
      break;
    case "linkTool":
      content = <LinkToolBlock data={block.data} />;
      break;
    case "raw":
      content = <RawBlock data={block.data} />;
      break;
    case "attaches":
      content = <AttachesBlock data={block.data} />;
      break;
    default:
      /* Unknown block — silently skip in production, warn in dev */
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[RenderBlock] Unknown block type: "${block.type}"`);
      }
      return null;
  }

  return (
    <BlockErrorBoundary blockType={block.type}>
      {content}
    </BlockErrorBoundary>
  );
};

export default RenderBlock;

/* ─────────────────────────────────────────────────────────────────────────────
   PostContent — convenience wrapper that iterates over blocks[]
───────────────────────────────────────────────────────────────────────────── */

export const PostContent = ({ content }) => {
  if (!content?.blocks?.length) return null;
  return (
    <article className="vp-post-content">
      {content.blocks.map((block) => (
        <RenderBlock key={block.id ?? Math.random()} block={block} />
      ))}
    </article>
  );
};