import Loader from "./Loader";
import ValidationToast from "./ValidationToast";

const DeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete this post?",
    description,
    post = null,
    isLoading = false,
    error = null,
    setError,
}) => {
    if (!isOpen) return null;

    const postDescription = description || (
        post
            ? <>Deleting <strong className="var-(--text-primary)">"{post.title}"</strong> will permanently remove it along with all comments, reactions, and analytics data. <strong className="var-(--text-primary)">This cannot be reversed.</strong></>
            : "This action cannot be undone and all associated data will be permanently removed."
    );

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-(--bg-primary)/30 backdrop-blur-sm animate-[fadeIn_0.18s_ease]"
        >
            <div className="w-full max-w-[440px] overflow-hidden rounded-[10px] border border-var-(--border-light) bg-var-(--bg-primary) shadow-[0_20px_48px_rgba(0,0,0,0.18)] animate-[slideUp_0.22s_cubic-bezier(0.34,1.2,0.64,1)]">
                {/* Header */}
                <div className="flex items-start gap-3.5 pt-6 px-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-var-(--brand-primary-light)">
                        <WarningIcon />
                    </div>
                    <div>
                        <p className="mb-1 text-lg font-bold leading-tight text-var-(--text-primary)">
                            {title}
                        </p>
                        <p className="text-[13px] text-var-(--text-muted)">
                            This action cannot be undone.
                        </p>
                    </div>
                </div>

                {error && (
                    <ValidationToast closeToast={() => setError(null)} message={error} type="error" />
                )}

                {/* Body */}
                <div className="px-6 pb-5 pt-[18px]">
                    {post && (
                        <div className="mb-3.5 flex items-center gap-3 rounded-md border border-var-(--border-light) bg-var-(--bg-secondary) px-3.5 py-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-var-(--bg-tertiary)">
                                <ArticleIcon />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-[13px] font-semibold text-var-(--text-primary)">
                                    {post.title}
                                </p>
                                {post.meta && (
                                    <p className="mt-0.5 text-xs text-var-(--text-muted)">
                                        {post.meta}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    <p className="text-[13px] leading-relaxed text-var-(--text-secondary)">
                        {postDescription}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2.5 px-6 pb-6">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="btn btn-outline h-[38px]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="btn text-white hover:bg-[#a93226] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                        style={{ background: "#c0392b" }}
                    >
                        {isLoading && <Loader size="sm" />}
                        {isLoading ? "Deleting..." : "Delete post"}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { transform: translateY(12px) scale(0.97); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
            `}</style>
        </div>
    );
};

const WarningIcon = () => (
    <svg width="20" height="20" fill="none" stroke="#ff6a00" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const ArticleIcon = () => (
    <svg width="16" height="16" fill="none" stroke="#8a8a8a" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
    </svg>
);

export default DeleteModal;