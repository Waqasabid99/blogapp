"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
    Eye, Users, MessageSquare, TrendingUp, TrendingDown,
    FileText, Layers, Activity,
    RefreshCw, ArrowUpRight,
    Heart, Globe, Monitor, Smartphone,
    UserCheck, UserPlus, Zap, Award,
    AlertCircle,
} from "lucide-react";
import api from "@/api/api";

/* ─────────────────────────────────────────
   Constants
   Fix #3: COLORS uses real hex values — CSS vars like var(--brand-primary)
   are not supported in SVG fill/stroke attributes used by Recharts.
───────────────────────────────────────── */
const COLORS = ["#6d50e8", "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const fmt = (n) =>
    n >= 1_000_000
        ? (n / 1_000_000).toFixed(1) + "M"
        : n >= 1_000
        ? (n / 1_000).toFixed(1) + "K"
        : String(n ?? 0);

const fmtPct = (n) =>
    n !== undefined && n !== null ? `${parseFloat(n).toFixed(1)}%` : "—";

const trendColor = (t) => {
    const v = parseFloat(t);
    if (isNaN(v)) return "var(--text-muted)";
    return v >= 0 ? "#16a34a" : "#dc2626";
};

const trendBg = (t) => {
    const v = parseFloat(t);
    if (isNaN(v)) return "var(--bg-tertiary)";
    return v >= 0 ? "#f0fdf4" : "#fef2f2";
};

/* ─────────────────────────────────────────
   Skeleton loader
───────────────────────────────────────── */
const Skeleton = ({ w = "100%", h = 20, radius = 6 }) => (
    <div
        style={{
            width: w, height: h, borderRadius: radius,
            background: "var(--bg-tertiary)",
            animation: "pulse 1.6s ease-in-out infinite",
        }}
    />
);

/* ─────────────────────────────────────────
   Error Banner
───────────────────────────────────────── */
const ErrorBanner = ({ message, onRetry }) => (
    <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", borderRadius: "var(--radius-md)",
        background: "#fef2f2", border: "1px solid #fecaca",
        marginBottom: 24,
    }}>
        <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: "var(--text-sm)", color: "#dc2626" }}>{message}</span>
        <button
            onClick={onRetry}
            style={{
                fontSize: "var(--text-xs)", fontWeight: "var(--font-semibold)",
                color: "#dc2626", background: "transparent", border: "1px solid #fca5a5",
                borderRadius: "var(--radius-md)", padding: "4px 10px", cursor: "pointer",
            }}
        >
            Retry
        </button>
    </div>
);

/* ─────────────────────────────────────────
   Stat Card
───────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, trend, sub, color = "#6d50e8", loading }) => (
    <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{
                width: 40, height: 40, borderRadius: "var(--radius-md)",
                background: color + "18",
                display: "flex", alignItems: "center", justifyContent: "center",
                color,
            }}>
                <Icon size={18} />
            </div>
            {trend !== undefined && !loading && (
                <span style={{
                    fontSize: "var(--text-xs)", fontWeight: "var(--font-semibold)",
                    color: trendColor(trend),
                    background: trendBg(trend),
                    padding: "3px 8px", borderRadius: 99,
                    display: "flex", alignItems: "center", gap: 3,
                }}>
                    {parseFloat(trend) >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {trend}
                </span>
            )}
        </div>
        {loading ? (
            <>
                <Skeleton h={28} w="60%" radius={4} />
                <div style={{ marginTop: 6 }}><Skeleton h={14} w="80%" radius={4} /></div>
            </>
        ) : (
            <>
                <p style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", color: "var(--text-primary)", lineHeight: 1.2 }}>
                    {fmt(value)}
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>
                    {label}
                    {sub && <span style={{ marginLeft: 6, color: "var(--text-secondary)" }}>{sub}</span>}
                </p>
            </>
        )}
    </div>
);

/* ─────────────────────────────────────────
   Section header
───────────────────────────────────────── */
const SectionHeader = ({ title, description, right }) => (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)", color: "var(--text-primary)" }}>{title}</h2>
            {description && <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>{description}</p>}
        </div>
        {right}
    </div>
);

/* ─────────────────────────────────────────
   Custom recharts tooltip
───────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "var(--bg-primary)", border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-md)", padding: "10px 14px",
            boxShadow: "var(--shadow-md)", fontSize: "var(--text-xs)",
        }}>
            <p style={{ color: "var(--text-muted)", marginBottom: 6, fontWeight: "var(--font-medium)" }}>{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color, fontWeight: "var(--font-semibold)" }}>
                    {p.name}: {fmt(p.value)}
                </p>
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────
   Empty State
───────────────────────────────────────── */
const EmptyState = ({ label }) => (
    <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
        {label}
    </div>
);

/* ─────────────────────────────────────────
   Post Stat inline
───────────────────────────────────────── */
const PostStat = ({ icon: Icon, val }) => (
    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
        <Icon size={10} /> {fmt(val)}
    </span>
);

/* ─────────────────────────────────────────
   Status Badge
───────────────────────────────────────── */
const StatusBadge = ({ status }) => {
    const map = {
        PUBLISHED: { bg: "#f0fdf4", color: "#16a34a", label: "Published" },
        DRAFT: { bg: "#fffbeb", color: "#d97706", label: "Draft" },
        ARCHIVED: { bg: "var(--bg-tertiary)", color: "var(--text-muted)", label: "Archived" },
    };
    const s = map[status] ?? map.ARCHIVED;
    return (
        <span style={{
            fontSize: 10, fontWeight: "var(--font-semibold)", padding: "2px 7px",
            borderRadius: 99, background: s.bg, color: s.color, flexShrink: 0,
        }}>
            {s.label}
        </span>
    );
};

/* ─────────────────────────────────────────
   Metric Row (used in user analytics table)
───────────────────────────────────────── */
const MetricRow = ({ icon: Icon, label, value, color, loading }) => (
    <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 0", borderBottom: "1px solid var(--border-light)",
    }}>
        <div style={{
            width: 34, height: 34, borderRadius: "var(--radius-md)",
            background: color + "18", display: "flex", alignItems: "center",
            justifyContent: "center", color, flexShrink: 0,
        }}>
            <Icon size={15} />
        </div>
        <span style={{ flex: 1, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{label}</span>
        {loading
            ? <Skeleton w={48} h={16} radius={4} />
            : <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-semibold)", color: "var(--text-primary)" }}>{value}</span>
        }
    </div>
);

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function AnalyticsDashboard() {
    const [overview, setOverview] = useState(null);
    const [traffic, setTraffic] = useState(null);
    const [contentData, setContentData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Fix #4: track fetch errors
    const [period, setPeriod] = useState(30);
    const [activeTab, setActiveTab] = useState("overview");

    // Fix #1 & #3: Memoize date strings so they're stable across renders.
    // Without this, new Date() on every render produces a new string reference,
    // causing useCallback to recreate fetchAll, which triggers the useEffect
    // infinitely.
    const { startDate, endDate } = useMemo(() => ({
        startDate: new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
    }), [period]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ov, tr, ct, ud] = await Promise.allSettled([
                api.get(`/analytics/dashboard`, { params: { startDate, endDate } }),
                api.get(`/analytics/traffic`, { params: { startDate, endDate, granularity: "day" } }),
                api.get(`/analytics/content`, { params: { limit: 10, sortBy: "views" } }),
                api.get(`/analytics/users`, { params: { startDate, endDate } }),
            ]);

            // Fix #4: surface error to the user if all requests fail
            const allFailed = [ov, tr, ct, ud].every((r) => r.status === "rejected");
            if (allFailed) {
                setError("Failed to load analytics data. Please check your connection and try again.");
            } else {
                if (ov.status === "fulfilled") setOverview(ov.value.data.data);
                if (tr.status === "fulfilled") setTraffic(tr.value.data.data);
                if (ct.status === "fulfilled") setContentData(ct.value.data.data);
                if (ud.status === "fulfilled") setUserData(ud.value.data.data);
            }
        } catch (err) {
            // Fix #4: catch unexpected errors and surface them
            setError("An unexpected error occurred while loading analytics.");
            console.error("Analytics fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* ── Derived data — Fix #8: memoize so these don't recompute on every render ── */
    const trafficSeries = useMemo(() =>
        traffic?.timeSeries?.map((d) => ({
            date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            Views: d.views,
            Visitors: d.uniqueVisitors,
        })) ?? [],
    [traffic]);

    const referrerData = useMemo(() =>
        traffic?.referrers?.slice(0, 6).map((r) => ({ name: r.domain, value: r.count })) ?? [],
    [traffic]);

    const deviceData = useMemo(() =>
        traffic?.devices
            ? [
                  { name: "Desktop", value: traffic.devices.desktop },
                  { name: "Mobile", value: traffic.devices.mobile },
              ]
            : [],
    [traffic]);

    const allPosts = useMemo(() => contentData?.posts ?? [], [contentData]);

    const topPosts = useMemo(() =>
        contentData?.posts?.slice(0, 5) ?? overview?.topPosts ?? [],
    [contentData, overview]);

    const recentActivity = useMemo(() => overview?.recentActivity ?? [], [overview]);

    const userRoleData = useMemo(() =>
        userData?.userRoles?.map((r) => ({ name: r.role, value: r.count })) ?? [],
    [userData]);

    const topContributors = useMemo(() => userData?.topContributors ?? [], [userData]);

    // Fix #8: memoize engagement radar derived data
    const engagementRadar = useMemo(() =>
        allPosts.slice(0, 6).map((p) => ({
            post: p.title.length > 14 ? p.title.slice(0, 14) + "…" : p.title,
            Views: Math.min(p.viewCount, 9999),
            Likes: p.likeCount * 10,
            Comments: p.commentCount * 20,
            Bookmarks: (p.bookmarkCount ?? 0) * 30,
        })),
    [allPosts]);

    /* ── Tab config ── */
    const tabs = [
        { key: "overview", label: "Overview" },
        { key: "traffic", label: "Traffic" },
        { key: "content", label: "Content" },
        { key: "users", label: "Users" },
    ];

    return (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 0 64px" }}>

            {/* ── Page Header ── */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 24,
            }}>
                <div>
                    <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", color: "var(--text-primary)" }}>
                        Analytics Dashboard
                    </h1>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>
                        Monitor performance and audience insights
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {/* Fix #6: aria-label on period buttons for screen readers */}
                    {[7, 30, 90].map((d) => (
                        <button
                            key={d}
                            onClick={() => setPeriod(d)}
                            aria-label={`Last ${d} days`}
                            aria-pressed={period === d}
                            className="btn"
                            style={{
                                padding: "6px 14px",
                                fontSize: "var(--text-xs)",
                                fontWeight: "var(--font-medium)",
                                background: period === d ? "var(--brand-primary)" : "var(--bg-primary)",
                                color: period === d ? "#fff" : "var(--text-secondary)",
                                border: `1px solid ${period === d ? "var(--brand-primary)" : "var(--border-light)"}`,
                                borderRadius: "var(--radius-md)",
                                cursor: "pointer",
                            }}
                        >
                            {d}d
                        </button>
                    ))}
                    {/* Fix #7 (refresh button): disabled styling made explicit */}
                    <button
                        className="btn btn-outline"
                        style={{
                            padding: "6px 12px",
                            fontSize: "var(--text-xs)",
                            display: "flex", alignItems: "center", gap: 6,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.5 : 1,
                        }}
                        onClick={fetchAll}
                        disabled={loading}
                        aria-label="Refresh analytics data"
                    >
                        <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Fix #4: Show error banner when data fetch fails */}
            {error && <ErrorBanner message={error} onRetry={fetchAll} />}

            {/* Fix #5: role="tablist" + role="tab" + aria-selected on tab buttons */}
            <div
                role="tablist"
                aria-label="Analytics sections"
                style={{
                    display: "flex", gap: 4, marginBottom: 24,
                    borderBottom: "1px solid var(--border-light)", paddingBottom: 0,
                }}
            >
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        role="tab"
                        aria-selected={activeTab === t.key}
                        aria-controls={`panel-${t.key}`}
                        id={`tab-${t.key}`}
                        onClick={() => setActiveTab(t.key)}
                        style={{
                            padding: "8px 16px",
                            fontSize: "var(--text-sm)",
                            fontWeight: activeTab === t.key ? "var(--font-semibold)" : "var(--font-medium)",
                            color: activeTab === t.key ? "var(--brand-primary)" : "var(--text-muted)",
                            background: "transparent",
                            border: "none",
                            borderBottom: `2px solid ${activeTab === t.key ? "var(--brand-primary)" : "transparent"}`,
                            cursor: "pointer",
                            marginBottom: -1,
                            transition: "color 0.15s, border-color 0.15s",
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════════
                OVERVIEW TAB
            ══════════════════════════════════════════ */}
            {activeTab === "overview" && (
                <div
                    role="tabpanel"
                    id="panel-overview"
                    aria-labelledby="tab-overview"
                >
                    {/* ── Stat Cards ── */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: 16, marginBottom: 24,
                    }}>
                        <StatCard
                            icon={Eye} label="Total Views" color={COLORS[0]}
                            value={overview?.engagement?.totalViews}
                            trend={overview?.engagement?.trends?.views}
                            sub={`${fmt(overview?.engagement?.uniqueVisitors)} unique`}
                            loading={loading}
                        />
                        <StatCard
                            icon={Users} label="Total Users" color={COLORS[1]}
                            value={overview?.users?.total}
                            trend={overview?.users?.trend}
                            sub={`+${fmt(overview?.users?.new)} new`}
                            loading={loading}
                        />
                        <StatCard
                            icon={MessageSquare} label="Comments" color={COLORS[2]}
                            value={overview?.engagement?.totalComments}
                            trend={overview?.engagement?.trends?.comments}
                            sub={`${fmt(overview?.engagement?.newComments)} new`}
                            loading={loading}
                        />
                        <StatCard
                            icon={FileText} label="Published Posts" color={COLORS[3]}
                            value={overview?.content?.publishedPosts}
                            sub={`${fmt(overview?.content?.draftPosts)} drafts`}
                            loading={loading}
                        />
                        <StatCard
                            icon={Heart} label="Total Likes" color={COLORS[5]}
                            value={overview?.engagement?.totalLikes}
                            trend={overview?.engagement?.trends?.likes}
                            loading={loading}
                        />
                        <StatCard
                            icon={Layers} label="Categories" color={COLORS[4]}
                            value={overview?.content?.totalCategories}
                            sub={`${fmt(overview?.content?.totalTags)} tags`}
                            loading={loading}
                        />
                    </div>

                    {/* ── Traffic Chart (area) ── */}
                    <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)", marginBottom: 24 }}>
                        <SectionHeader
                            title="Traffic Overview"
                            description={`Views & unique visitors — last ${period} days`}
                        />
                        {loading ? (
                            <Skeleton h={260} radius={8} />
                        ) : trafficSeries.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={trafficSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.18} />
                                            <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.14} />
                                            <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                                    <Area type="monotone" dataKey="Views" stroke={COLORS[0]} strokeWidth={2} fill="url(#gViews)" dot={false} />
                                    <Area type="monotone" dataKey="Visitors" stroke={COLORS[1]} strokeWidth={2} fill="url(#gVisitors)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : <EmptyState label="No traffic data for this period" />}
                    </div>

                    {/* ── 2-col: Top Posts + Recent Activity ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                        {/* Top Posts */}
                        <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
                            <SectionHeader title="Top Posts" description="Most viewed content" />
                            {loading ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {[...Array(4)].map((_, i) => <Skeleton key={i} h={52} radius={6} />)}
                                </div>
                            ) : topPosts.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    {topPosts.map((post, i) => (
                                        <div key={post.id} style={{
                                            display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                                            borderBottom: i < topPosts.length - 1 ? "1px solid var(--border-light)" : "none",
                                        }}>
                                            <span style={{
                                                width: 24, height: 24, borderRadius: 4,
                                                background: i === 0 ? COLORS[0] : "var(--bg-tertiary)",
                                                color: i === 0 ? "#fff" : "var(--text-muted)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "var(--text-xs)", fontWeight: "var(--font-bold)",
                                                flexShrink: 0,
                                            }}>{i + 1}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)",
                                                    color: "var(--text-primary)",
                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                }}>{post.title}</p>
                                                <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                                                    <PostStat icon={Eye} val={post.viewCount} />
                                                    <PostStat icon={MessageSquare} val={post.commentCount} />
                                                    <PostStat icon={Heart} val={post.likeCount} />
                                                </div>
                                            </div>
                                            <ArrowUpRight size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                                        </div>
                                    ))}
                                </div>
                            ) : <EmptyState label="No published posts yet" />}
                        </div>

                        {/* Recent Activity */}
                        <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
                            <SectionHeader title="Recent Activity" description="Latest content updates" />
                            {loading ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {[...Array(4)].map((_, i) => <Skeleton key={i} h={52} radius={6} />)}
                                </div>
                            ) : recentActivity.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    {recentActivity.map((item, i) => (
                                        <div key={item.id} style={{
                                            display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0",
                                            borderBottom: i < recentActivity.length - 1 ? "1px solid var(--border-light)" : "none",
                                        }}>
                                            <div style={{
                                                width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                                                background: item.status === "PUBLISHED" ? "#16a34a"
                                                    : item.status === "DRAFT" ? "#f59e0b" : "var(--text-muted)",
                                            }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    fontSize: "var(--text-sm)", color: "var(--text-primary)",
                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                }}>{item.title}</p>
                                                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
                                                    by {item.author?.name} · {new Date(item.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <StatusBadge status={item.status} />
                                        </div>
                                    ))}
                                </div>
                            ) : <EmptyState label="No recent activity" />}
                        </div>
                    </div>

                    {/* ── Content Performance Bar Chart ── */}
                    {!loading && allPosts.length > 0 ? (
                        <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
                            <SectionHeader title="Content Performance" description="Views, comments & likes across top posts" />
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart
                                    data={allPosts.slice(0, 8).map((p) => ({
                                        name: p.title.length > 22 ? p.title.slice(0, 22) + "…" : p.title,
                                        Views: p.viewCount,
                                        Comments: p.commentCount,
                                        Likes: p.likeCount,
                                    }))}
                                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Bar dataKey="Views" fill={COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={36} />
                                    <Bar dataKey="Comments" fill={COLORS[1]} radius={[4, 4, 0, 0]} maxBarSize={36} />
                                    <Bar dataKey="Likes" fill={COLORS[3]} radius={[4, 4, 0, 0]} maxBarSize={36} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : loading ? (
                        <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
                            <Skeleton h={240} radius={8} />
                        </div>
                    ) : null}
                </div>
            )}

            {/* ══════════════════════════════════════════
                TRAFFIC TAB
            ══════════════════════════════════════════ */}
            {activeTab === "traffic" && (
                <div
                    role="tabpanel"
                    id="panel-traffic"
                    aria-labelledby="tab-traffic"
                >
                    {/* Traffic summary cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                        <StatCard
                            icon={Eye} label="Total Views" color={COLORS[0]}
                            value={traffic?.summary?.totalViews}
                            loading={loading}
                        />
                        <StatCard
                            icon={Users} label="Unique Visitors" color={COLORS[1]}
                            value={traffic?.summary?.uniqueVisitors}
                            loading={loading}
                        />
                        <StatCard
                            icon={Activity} label="Avg Views / Day" color={COLORS[2]}
                            value={traffic?.summary?.avgViewsPerBucket}
                            loading={loading}
                        />
                    </div>

                    {/* Line chart for traffic */}
                    <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)", marginBottom: 24 }}>
                        <SectionHeader
                            title="Views Over Time"
                            description={`Daily breakdown — last ${period} days`}
                        />
                        {loading ? <Skeleton h={280} radius={8} /> : trafficSeries.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={trafficSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                                    <Line type="monotone" dataKey="Views" stroke={COLORS[0]} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Visitors" stroke={COLORS[1]} strokeWidth={2} dot={false} strokeDasharray="5 3" activeDot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <EmptyState label="No traffic data available" />}
                    </div>

                    {/* 2-col: Referrers + Device Split */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {/* Referrers */}
                        <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
                            <SectionHeader title="Top Referrers" description="Where your visitors come from" />
                            {loading ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {[...Array(6)].map((_, i) => <Skeleton key={i} h={36} radius={6} />)}
                                </div>
                            ) : referrerData.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {referrerData.map((r, i) => {
                                        const maxVal = referrerData[0]?.value || 1;
                                        return (
                                            <div key={r.name}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--text-secondary)", fontWeight: "var(--font-medium)" }}>
                                                        <Globe size={11} style={{ color: COLORS[i % COLORS.length] }} />
                                                        {r.name}
                                                    </span>
                                                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{fmt(r.value)}</span>
                                                </div>
                                                <div style={{ height: 5, background: "var(--bg-tertiary)", borderRadius: 99, overflow: "hidden" }}>
                                                    <div style={{
                                                        height: "100%",
                                                        width: `${(r.value / maxVal) * 100}%`,
                                                        background: COLORS[i % COLORS.length],
                                                        borderRadius: 99,
                                                        transition: "width 0.6s ease",
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <EmptyState label="No referrer data yet" />}
                        </div>

                        {/* Devices */}
                        <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
                            <SectionHeader title="Device Split" description="Desktop vs mobile visitors" />
                            {loading ? (
                                <Skeleton h={200} radius={8} />
                            ) : deviceData.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    <ResponsiveContainer width="100%" height={160}>
                                        <PieChart>
                                            <Pie
                                                data={deviceData} cx="50%" cy="50%"
                                                innerRadius={48} outerRadius={72}
                                                dataKey="value" paddingAngle={3}
                                            >
                                                {deviceData.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<ChartTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {deviceData.map((d, i) => {
                                            const total = deviceData.reduce((a, b) => a + b.value, 0);
                                            const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
                                            const DevIcon = d.name === "Desktop" ? Monitor : Smartphone;
                                            return (
                                                <div key={d.name} style={{
                                                    display: "flex", alignItems: "center", gap: 10,
                                                    padding: "8px 12px", borderRadius: "var(--radius-md)",
                                                    background: "var(--bg-secondary)",
                                                }}>
                                                    <DevIcon size={14} style={{ color: COLORS[i] }} />
                                                    <span style={{ flex: 1, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{d.name}</span>
                                                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{fmt(d.value)}</span>
                                                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-semibold)", color: "var(--text-primary)", minWidth: 38, textAlign: "right" }}>{pct}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : <EmptyState label="No device data yet" />}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
                CONTENT TAB
            ══════════════════════════════════════════ */}
            {activeTab === "content" && (
                <div
                    role="tabpanel"
                    id="panel-content"
                    aria-labelledby="tab-content"
                >
                    {/* Engagement Radar */}
                    {!loading && engagementRadar.length > 0 && (
                        <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)", marginBottom: 24 }}>
                            <SectionHeader title="Engagement Radar" description="Multi-dimensional engagement across top posts" />
                            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                                <ResponsiveContainer width="50%" height={280}>
                                    <RadarChart data={engagementRadar}>
                                        <PolarGrid stroke="var(--border-light)" />
                                        <PolarAngleAxis dataKey="post" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                                        <PolarRadiusAxis tick={false} axisLine={false} />
                                        <Radar name="Views" dataKey="Views" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.15} />
                                        <Radar name="Likes (×10)" dataKey="Likes" stroke={COLORS[5]} fill={COLORS[5]} fillOpacity={0.1} />
                                        <Radar name="Comments (×20)" dataKey="Comments" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.1} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Tooltip content={<ChartTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 8 }}>Engagement score by post</p>
                                    {allPosts.slice(0, 6).map((p, i) => (
                                        <div key={p.id} style={{
                                            display: "flex", alignItems: "center", gap: 10,
                                            padding: "8px 12px", borderRadius: "var(--radius-md)",
                                            background: "var(--bg-secondary)",
                                        }}>
                                            <span style={{
                                                width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                                                background: COLORS[i % COLORS.length] + "22",
                                                color: COLORS[i % COLORS.length],
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 10, fontWeight: "var(--font-bold)",
                                            }}>{i + 1}</span>
                                            <span style={{
                                                flex: 1, fontSize: "var(--text-xs)", color: "var(--text-secondary)",
                                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                            }}>{p.title}</span>
                                            <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--font-semibold)", color: "var(--text-primary)" }}>
                                                {p.engagementScore ?? "—"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTR + Engagement table */}
                    <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)", marginBottom: 24 }}>
                        <SectionHeader title="Content Analytics Table" description="Detailed stats for all posts" />
                        {loading ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {[...Array(6)].map((_, i) => <Skeleton key={i} h={44} radius={6} />)}
                            </div>
                        ) : allPosts.length > 0 ? (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)" }}>
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                                            {["Title", "Status", "Views", "Comments", "Likes", "Bookmarks", "CTR", "Score", "Read Time"].map((h) => (
                                                <th key={h} style={{
                                                    padding: "8px 12px", textAlign: "left",
                                                    color: "var(--text-muted)", fontWeight: "var(--font-semibold)",
                                                    whiteSpace: "nowrap",
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allPosts.map((post, i) => (
                                            <tr key={post.id} style={{
                                                borderBottom: "1px solid var(--border-light)",
                                                background: i % 2 === 0 ? "transparent" : "var(--bg-secondary)",
                                            }}>
                                                <td style={{ padding: "10px 12px", color: "var(--text-primary)", fontWeight: "var(--font-medium)", maxWidth: 220 }}>
                                                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {post.title}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "10px 12px" }}><StatusBadge status={post.status} /></td>
                                                <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{fmt(post.viewCount)}</td>
                                                <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{fmt(post.commentCount)}</td>
                                                <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{fmt(post.likeCount)}</td>
                                                <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{fmt(post.bookmarkCount ?? 0)}</td>
                                                <td style={{ padding: "10px 12px", color: post.ctr > 5 ? "#16a34a" : "var(--text-secondary)" }}>
                                                    {fmtPct(post.ctr)}
                                                </td>
                                                <td style={{ padding: "10px 12px" }}>
                                                    <span style={{
                                                        fontWeight: "var(--font-semibold)",
                                                        color: post.engagementScore > 50 ? "#16a34a" : "var(--text-primary)",
                                                    }}>
                                                        {post.engagementScore ?? "—"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>{post.readingTime ?? "—"} min</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState label="No content data yet" />}
                    </div>

                    {/* Performance bar chart */}
                    {!loading && allPosts.length > 0 && (
                        <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
                            <SectionHeader title="Content Performance" description="Views, comments & likes — top 8 posts" />
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart
                                    data={allPosts.slice(0, 8).map((p) => ({
                                        name: p.title.length > 18 ? p.title.slice(0, 18) + "…" : p.title,
                                        Views: p.viewCount,
                                        Comments: p.commentCount,
                                        Likes: p.likeCount,
                                    }))}
                                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Bar dataKey="Views" fill={COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={32} />
                                    <Bar dataKey="Comments" fill={COLORS[1]} radius={[4, 4, 0, 0]} maxBarSize={32} />
                                    <Bar dataKey="Likes" fill={COLORS[3]} radius={[4, 4, 0, 0]} maxBarSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════
                USERS TAB
            ══════════════════════════════════════════ */}
            {activeTab === "users" && (
                <div
                    role="tabpanel"
                    id="panel-users"
                    aria-labelledby="tab-users"
                >
                    {/* User stat cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                        <StatCard
                            icon={Users} label="Total Users" color={COLORS[0]}
                            value={userData?.overview?.totalUsers}
                            loading={loading}
                        />
                        <StatCard
                            icon={UserPlus} label="New Users" color={COLORS[1]}
                            value={userData?.overview?.newUsers}
                            sub={`last ${period}d`}
                            loading={loading}
                        />
                        <StatCard
                            icon={UserCheck} label="Active Users" color={COLORS[3]}
                            value={userData?.overview?.activeUsers}
                            loading={loading}
                        />
                        <StatCard
                            icon={Zap} label="Activation Rate" color={COLORS[4]}
                            value={userData?.overview?.activationRate}
                            loading={loading}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                        {/* User Roles Pie */}
                        <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
                            <SectionHeader title="Users by Role" description="Role distribution across all users" />
                            {loading ? (
                                <Skeleton h={220} radius={8} />
                            ) : userRoleData.length > 0 ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <ResponsiveContainer width={180} height={180}>
                                        <PieChart>
                                            <Pie
                                                data={userRoleData} cx="50%" cy="50%"
                                                innerRadius={50} outerRadius={75}
                                                dataKey="value" paddingAngle={3}
                                            >
                                                {userRoleData.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<ChartTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                                        {userRoleData.map((r, i) => {
                                            const total = userRoleData.reduce((a, b) => a + b.value, 0);
                                            const pct = total > 0 ? ((r.value / total) * 100).toFixed(1) : 0;
                                            return (
                                                <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                                                    <span style={{ flex: 1, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{r.name}</span>
                                                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{fmt(r.value)}</span>
                                                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--font-semibold)", color: "var(--text-primary)", minWidth: 36, textAlign: "right" }}>{pct}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : <EmptyState label="No role data available" />}
                        </div>

                        {/* User overview metrics */}
                        <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
                            <SectionHeader title="User Metrics" description={`Period: last ${period} days`} />
                            <MetricRow icon={Users} label="Total Users" value={fmt(userData?.overview?.totalUsers)} color={COLORS[0]} loading={loading} />
                            <MetricRow icon={UserPlus} label="New Signups" value={fmt(userData?.overview?.newUsers)} color={COLORS[1]} loading={loading} />
                            <MetricRow icon={UserCheck} label="Active Users" value={fmt(userData?.overview?.activeUsers)} color={COLORS[3]} loading={loading} />
                            <MetricRow icon={Zap} label="Activation Rate" value={fmtPct(userData?.overview?.activationRate)} color={COLORS[4]} loading={loading} />
                        </div>
                    </div>

                    {/* Top Contributors */}
                    <div className="card" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
                        <SectionHeader title="Top Contributors" description="Most active post authors this period" />
                        {loading ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {[...Array(5)].map((_, i) => <Skeleton key={i} h={52} radius={6} />)}
                            </div>
                        ) : topContributors.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {topContributors.map((c, i) => (
                                    <div key={c.authorId} style={{
                                        display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                                        borderBottom: i < topContributors.length - 1 ? "1px solid var(--border-light)" : "none",
                                    }}>
                                        {c.user?.avatarUrl ? (
                                            <img
                                                src={c.user.avatarUrl}
                                                alt={c.user.name}
                                                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                                                background: COLORS[i % COLORS.length] + "22",
                                                color: COLORS[i % COLORS.length],
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "var(--text-sm)", fontWeight: "var(--font-bold)",
                                            }}>
                                                {c.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                                            </div>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", color: "var(--text-primary)" }}>
                                                {c.user?.name ?? "Unknown"}
                                            </p>
                                            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                                                {c._count?.authorId ?? 0} posts this period
                                            </p>
                                        </div>
                                        {i < 3 && (
                                            <Award size={14} style={{ color: i === 0 ? "#f59e0b" : i === 1 ? COLORS[1] : COLORS[2], flexShrink: 0 }} />
                                        )}
                                        <span style={{
                                            fontSize: "var(--text-xs)", fontWeight: "var(--font-semibold)",
                                            color: "var(--text-primary)", background: "var(--bg-tertiary)",
                                            padding: "3px 8px", borderRadius: 99,
                                        }}>
                                            #{i + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : <EmptyState label="No contributors this period" />}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}