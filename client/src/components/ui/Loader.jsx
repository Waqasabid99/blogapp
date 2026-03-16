// components/Loader.jsx

/**
 * Reusable Loader Component
 *
 * Props:
 *  - size     : "sm" | "md" | "lg" (default: "md")
 *  - text     : string — optional label rendered below the spinner
 *  - fullPage : boolean — centers the loader in the full viewport (default: false)
 *  - className: string — extra utility classes for the wrapper
 */

const sizeMap = {
  sm: {
    ring: "w-4 h-4 border-2",
    text: "text-xs",
    gap: "gap-2",
  },
  md: {
    ring: "w-7 h-7 border-[3px]",
    text: "text-sm",
    gap: "gap-3",
  },
  lg: {
    ring: "w-11 h-11 border-4",
    text: "text-base",
    gap: "gap-4",
  },
};

export default function Loader({
  size = "md",
  text,
  fullPage = false,
  className = "",
  isInline = true,
}) {
  const { ring, text: textSize, gap } = sizeMap[size] ?? sizeMap.md;

  const content = (
    <span
      className={`inline-flex items-center justify-center ${gap} ${isInline ? "" : "flex-col"} ${className}`}
      role="status"
      aria-label={text ?? "Loading"}
    >
      {/* Spinner ring */}
      <span
        className={`
          ${ring}
          rounded-full
          border-(--border-light)
          border-t-(--brand-primary)
          animate-spin
        `}
      />

      {/* Optional label */}
      {text && (
        <span
          className={`${textSize} font-medium tracking-wide`}
          style={{ color: "var(--text-muted)" }}
        >
          {text}
        </span>
      )}
    </span>
  );

  if (fullPage) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        {content}
      </div>
    );
  }

  return content;
}