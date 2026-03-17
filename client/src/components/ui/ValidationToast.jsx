import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    root: "fm-success",
  },
  error: {
    icon: AlertCircle,
    root: "fm-error",
  },
  warning: {
    icon: AlertTriangle,
    root: "fm-warning",
  },
  info: {
    icon: Info,
    root: "fm-info",
  },
};

const ValidationToast = ({ type = "info", message, className = "", closeToast }) => {
  if (!message) return null;

  const variant = VARIANTS[type] ?? VARIANTS.info;
  const Icon = variant.icon;

  return (
    <>
      <style>{`
        .fm-root {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          line-height: var(--line-normal);
          border-width: 1px;
          border-style: solid;
          align-items: center;
          margin: 10px 10px;
          animation: fm-in .18s ease;
        }
        @keyframes fm-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fm-icon {
          display: flex;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .fm-text { flex: 1; }

        /* success */
        .fm-success {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #166534;
        }
        .dark .fm-success {
          background: #052e16;
          border-color: #166534;
          color: #86efac;
        }

        /* error */
        .fm-error {
          background: #fef2f2;
          border-color: #fecaca;
          color: #991b1b;
        }
        .dark .fm-error {
          background: #2d0a0a;
          border-color: #7f1d1d;
          color: #fca5a5;
        }

        /* warning */
        .fm-warning {
          background: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
        }
        .dark .fm-warning {
          background: #1c1200;
          border-color: #78350f;
          color: #fcd34d;
        }

        /* info */
        .fm-info {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1e40af;
        }
        .dark .fm-info {
          background: #0d1a33;
          border-color: #1d4ed8;
          color: #93c5fd;
        }
      `}</style>

      <div
        className={`fm-root ${variant.root}${className ? ` ${className}` : ""}`}
        role={type === "error" ? "alert" : "status"}
        aria-live={type === "error" ? "assertive" : "polite"}
      >
        <span className="fm-icon" aria-hidden="true">
          <Icon size={15} />
        </span>
        <p className="fm-text">{message}</p>
        {closeToast && <X size={15} onClick={closeToast} className="cursor-pointer" />}
      </div>
    </>
  );
};

export default ValidationToast;