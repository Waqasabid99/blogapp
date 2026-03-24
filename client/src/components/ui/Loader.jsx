import animationData from "../../../public/blogLoading.json"
import Lottie from "./Lottie";

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
  showSpinner = true
}) {
  const { ring, text: textSize, gap } = sizeMap[size] ?? sizeMap.md;

  const content = (
    <span
      className={`inline-flex items-center justify-center ${gap} ${isInline ? "" : "flex-col"} ${className}`}
      role="status"
      aria-label={text ?? "Loading"}
    >
      {/* Spinner ring */}
      {showSpinner && (
      <span
        className={`
          ${ring}
          rounded-full
          mr-2
          border-(--border-light)
          border-t-(--brand-primary)
          animate-spin
        `}
      />
      )}

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
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-(--bg-primary)/50 backdrop-blur-sm"
      >
        <Lottie
          animationData={animationData}
          loop={true}
          autoPlay={true}
          height={100}
          width={100}
        />
        {content}
      </div>
    );
  }

  return content;
}