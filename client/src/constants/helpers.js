/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
// export function formatDate(dateStr) {
//     if (!dateStr) return null;
//     return new Date(dateStr).toLocaleDateString("en-US", {
//         year: "numeric", month: "short", day: "numeric"
//     });
// }

export const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

export const formatRelativeTime = (date) => {
    if (!date) return "";
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return formatDate(date);
};

export function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30)  return `${days}d ago`;
    return formatDate(dateStr);
}

export function getInitials(name = "") {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}