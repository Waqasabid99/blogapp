"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Eye,
  FileText,
  Users,
  TrendingUp,
  Clock,
  Star,
  MessageSquare,
  Bookmark,
  ThumbsUp,
  HandMetal,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  CalendarDays,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from "lucide-react";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const BRAND = "#ff6a00";
const BRAND_LIGHT = "rgba(255,106,0,0.12)";
const CHART_COLORS = ["#ff6a00", "#ff9e4f", "#ffcca0", "#e64e00", "#994000", "#cc7a33", "#ff5500", "#ffa366"];

const STATUS_COLORS = {
  PUBLISHED: "#22c55e",
  DRAFT: "#94a3b8",
  PENDING: "#f59e0b",
  REJECTED: "#ef4444",
  SCHEDULED: "#3b82f6",
  APPROVED: "#8b5cf6",
  ARCHIVED: "#6b7280",
};

const STATUS_LABELS = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  PENDING: "Pending",
  REJECTED: "Rejected",
  SCHEDULED: "Scheduled",
  APPROVED: "Approved",
  ARCHIVED: "Archived",
};

const RANGES = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

// ─────────────────────────────────────────────
// TINY SHARED COMPONENTS
// ─────────────────────────────────────────────

const StatusBadge = ({ status }) => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide"
    style={{
      background: `${STATUS_COLORS[status] ?? "#6b7280"}22`,
      color: STATUS_COLORS[status] ?? "#6b7280",
    }}
  >
    {STATUS_LABELS[status] ?? status}
  </span>
);

const SectionHeading = ({ children, sub }) => (
  <div className="mb-5">
    <h2
      className="text-lg font-semibold"
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </h2>
    {sub && (
      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
        {sub}
      </p>
    )}
  </div>
);

/** Recharts custom tooltip — matches site card style */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded border text-xs shadow-lg"
      style={{
        background: "var(--bg-primary)",
        borderColor: "var(--border-light)",
        color: "var(--text-primary)",
      }}
    >
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? BRAND }}>
          {p.name}: <span className="font-bold">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

/** XAxis tick date formatter — shortens "2025-01-15" → "Jan 15" */
const fmtAxisDate = (d) => {
  if (!d) return "";
  const [, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m) - 1]} ${parseInt(day)}`;
};

// ─────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, accent = false, href }) => {
  const inner = (
    <div
      className="card rounded-lg p-5 flex flex-col gap-3 transition-all group"
      style={accent ? { borderColor: BRAND, background: `${BRAND}08` } : {}}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
          style={{
            background: accent ? BRAND_LIGHT : "var(--bg-secondary)",
            color: accent ? BRAND : "var(--text-muted)",
          }}
        >
          <Icon size={18} />
        </div>
        {href && (
          <ArrowUpRight
            size={14}
            className="opacity-0 group-hover:opacity-60 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          />
        )}
      </div>
      <div>
        <p
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {typeof value === "number" ? value.toLocaleString() : value ?? "—"}
        </p>
        <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
      </div>
      {sub && (
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {sub}
        </p>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
};

// ─────────────────────────────────────────────
// CHART WRAPPER
// ─────────────────────────────────────────────

const ChartCard = ({ title, sub, children, className = "" }) => (
  <div
    className={`card rounded-lg p-5 ${className}`}
    style={{ background: "var(--bg-primary)", borderColor: "var(--border-light)" }}
  >
    {(title || sub) && (
      <div className="mb-4">
        {title && (
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </p>
        )}
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {sub}
          </p>
        )}
      </div>
    )}
    {children}
  </div>
);

// ─────────────────────────────────────────────
// RANGE PICKER
// ─────────────────────────────────────────────

const RangePicker = ({ current, onChange }) => (
  <div
    className="flex items-center gap-1 p-1 rounded-lg border"
    style={{ borderColor: "var(--border-light)", background: "var(--bg-secondary)" }}
  >
    {RANGES.map((r) => (
      <button
        key={r.value}
        onClick={() => onChange(r.value)}
        className="px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer"
        style={
          current === r.value
            ? { background: BRAND, color: "#fff" }
            : { color: "var(--text-secondary)" }
        }
      >
        {r.label}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────
// RECENT POSTS TABLE (shared)
// ─────────────────────────────────────────────

const PostsTable = ({ posts = [], showAuthor = true, showRejection = false, emptyText = "No posts yet" }) => {
  if (!posts.length)
    return (
      <p className="text-sm py-6 text-center" style={{ color: "var(--text-muted)" }}>
        {emptyText}
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
            <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Title
            </th>
            {showAuthor && (
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: "var(--text-muted)" }}>
                Author
              </th>
            )}
            <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Status
            </th>
            <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>
              Views
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr
              key={p.id}
              className="group border-b transition-colors"
              style={{ borderColor: "var(--border-light)" }}
            >
              <td className="py-3 pr-4">
                <Link
                  href={`/blog/${p.slug}`}
                  className="font-medium line-clamp-1 hover:underline transition-colors"
                  style={{ color: "var(--text-primary)" }}
                >
                  {p.title}
                </Link>
                {showRejection && p.rejectionReason && (
                  <p className="text-xs mt-0.5 text-red-400 line-clamp-1">
                    ↳ {p.rejectionReason}
                  </p>
                )}
              </td>
              {showAuthor && (
                <td className="py-3 pr-4 hidden md:table-cell">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {p.author?.name ?? "—"}
                  </span>
                </td>
              )}
              <td className="py-3 pr-4">
                <StatusBadge status={p.status} />
              </td>
              <td className="py-3 text-right hidden sm:table-cell">
                <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-secondary)" }}>
                  {p.viewCount?.toLocaleString() ?? "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────
// TOP POSTS TABLE (with full engagement cols)
// ─────────────────────────────────────────────

const TopPostsTable = ({ posts = [] }) => {
  if (!posts.length)
    return (
      <p className="text-sm py-6 text-center" style={{ color: "var(--text-muted)" }}>
        No published posts yet
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
            {["Title", "Views", "Likes", "Comments", "Bookmarks"].map((h) => (
              <th
                key={h}
                className={`py-2 text-xs font-semibold uppercase tracking-wider ${h === "Title" ? "text-left pr-4" : "text-right pl-4 hidden sm:table-cell"}`}
                style={{ color: "var(--text-muted)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((p, i) => (
            <tr
              key={p.id}
              className="border-b"
              style={{ borderColor: "var(--border-light)" }}
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold w-5 shrink-0 tabular-nums"
                    style={{ color: i === 0 ? BRAND : "var(--text-muted)" }}
                  >
                    {i + 1}
                  </span>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="font-medium line-clamp-1 hover:underline"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {p.title}
                  </Link>
                </div>
              </td>
              <td className="py-3 pl-4 text-right hidden sm:table-cell tabular-nums text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                {p.viewCount?.toLocaleString() ?? 0}
              </td>
              <td className="py-3 pl-4 text-right hidden sm:table-cell tabular-nums text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                {p.likeCount?.toLocaleString() ?? 0}
              </td>
              <td className="py-3 pl-4 text-right hidden sm:table-cell tabular-nums text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                {p.commentCount?.toLocaleString() ?? 0}
              </td>
              <td className="py-3 pl-4 text-right hidden sm:table-cell tabular-nums text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                {p.bookmarkCount?.toLocaleString() ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────
// REVIEW QUEUE (Editor only)
// ─────────────────────────────────────────────

const ReviewQueue = ({ posts = [] }) => {
  if (!posts.length)
    return (
      <div
        className="flex flex-col items-center justify-center py-10 gap-2"
        style={{ color: "var(--text-muted)" }}
      >
        <CheckCircle size={28} />
        <p className="text-sm font-medium">All clear — no posts pending review</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      {posts.map((p) => (
        <div
          key={p.id}
          className="flex items-start gap-3 p-3 rounded-lg border transition-colors"
          style={{
            borderColor: "var(--border-light)",
            background: "var(--bg-secondary)",
          }}
        >
          <div
            className="w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "#f59e0b22", color: "#f59e0b" }}
          >
            <Clock size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/dashboard/review/${p.id}`}
              className="text-sm font-semibold line-clamp-1 hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              {p.title}
            </Link>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                by {p.author?.name}
              </span>
              {p.readingTime && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  · {p.readingTime} min read
                </span>
              )}
              {p.categories?.slice(0, 2).map(({ category }) => (
                <span
                  key={category.id}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--brand-primary-light)",
                    color: "var(--brand-primary)",
                  }}
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
          <Link
            href={`/dashboard/review/${p.id}`}
            className="btn btn-outline text-xs px-2 py-1 shrink-0"
          >
            Review
          </Link>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// PIE CHART — post statuses
// ─────────────────────────────────────────────

const StatusPieChart = ({ data = [] }) => {
  const colored = data.map((d) => ({
    ...d,
    fill: STATUS_COLORS[d.status] ?? "#6b7280",
    name: STATUS_LABELS[d.status] ?? d.status,
  }));

  const total = colored.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={colored}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="count"
          >
            {colored.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2 shrink-0">
        {colored.map((d) => (
          <div key={d.status} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: d.fill }}
            />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {d.name}
            </span>
            <span
              className="text-xs font-bold tabular-nums ml-auto pl-3"
              style={{ color: "var(--text-primary)" }}
            >
              {d.count}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              ({total ? Math.round((d.count / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// AREA CHART wrapper
// ─────────────────────────────────────────────

const SimpleAreaChart = ({ data = [], dataKey = "count", color = BRAND, label = "Count", height = 200 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.25} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
      <XAxis
        dataKey="date"
        tickFormatter={fmtAxisDate}
        tick={{ fontSize: 10, fill: "var(--text-muted)" }}
        axisLine={false}
        tickLine={false}
        interval="preserveStartEnd"
      />
      <YAxis
        tick={{ fontSize: 10, fill: "var(--text-muted)" }}
        axisLine={false}
        tickLine={false}
        allowDecimals={false}
      />
      <Tooltip content={<ChartTooltip />} />
      <Area
        type="monotone"
        dataKey={dataKey}
        name={label}
        stroke={color}
        strokeWidth={2}
        fill={`url(#grad-${dataKey})`}
        dot={false}
        activeDot={{ r: 4, fill: color }}
      />
    </AreaChart>
  </ResponsiveContainer>
);

// ─────────────────────────────────────────────
// BAR CHART wrapper
// ─────────────────────────────────────────────

const SimpleBarchart = ({ data = [], dataKey = "postCount", nameKey = "name", color = BRAND, label = "Posts", height = 220 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={18}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
      <XAxis
        dataKey={nameKey}
        tick={{ fontSize: 10, fill: "var(--text-muted)" }}
        axisLine={false}
        tickLine={false}
        interval={0}
        angle={-25}
        textAnchor="end"
        height={40}
      />
      <YAxis
        tick={{ fontSize: 10, fill: "var(--text-muted)" }}
        axisLine={false}
        tickLine={false}
        allowDecimals={false}
      />
      <Tooltip content={<ChartTooltip />} />
      <Bar dataKey={dataKey} name={label} fill={color} radius={[3, 3, 0, 0]}>
        {data.map((_, i) => (
          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

// ─────────────────────────────────────────────
// MULTI-LINE CHART (views + posts together)
// ─────────────────────────────────────────────

const MultiLineChart = ({ views = [], posts = [], height = 220 }) => {
  // Merge both arrays on date key
  const merged = views.map((v) => {
    const match = posts.find((p) => p.date === v.date);
    return { date: v.date, views: v.count, posts: match?.count ?? 0 };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={merged} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={fmtAxisDate}
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "11px", color: "var(--text-muted)", paddingTop: "8px" }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="views"
          name="Views"
          stroke={BRAND}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="posts"
          name="Published"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          strokeDasharray="4 4"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// ─────────────────────────────────────────────
// PENDING COMMENTS LIST
// ─────────────────────────────────────────────

const PendingCommentsList = ({ comments = [] }) => {
  if (!comments.length)
    return (
      <p className="text-sm py-6 text-center" style={{ color: "var(--text-muted)" }}>
        No pending comments
      </p>
    );

  return (
    <div className="flex flex-col gap-3">
      {comments.map((c) => (
        <div
          key={c.id}
          className="p-3 rounded-lg border text-sm"
          style={{
            borderColor: "var(--border-light)",
            background: "var(--bg-secondary)",
          }}
        >
          <p className="line-clamp-2" style={{ color: "var(--text-primary)" }}>
            {c.content}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {c.author?.name ?? "Anonymous"}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              on
            </span>
            <Link
              href={`/blog/${c.post?.slug}`}
              className="text-xs underline underline-offset-2 truncate max-w-40"
              style={{ color: "var(--brand-primary)" }}
            >
              {c.post?.title}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// ROLE-SPECIFIC DASHBOARD VIEWS
// ─────────────────────────────────────────────

// ── ADMIN DASHBOARD ──────────────────────────
const AdminDashboard = ({ analytics, range }) => {
  const { kpis, charts, tables } = analytics;

  return (
    <div className="flex flex-col gap-8">

      {/* KPI Row 1 — Posts + Users */}
      <div>
        <SectionHeading sub={`Site-wide stats for the last ${range} days`}>Overview</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard icon={FileText} label="Total Posts" value={kpis.posts.total} />
          <KpiCard icon={CheckCircle} label="Published" value={kpis.posts.published} accent />
          <KpiCard icon={Clock} label="Pending Review" value={kpis.posts.pending}
            sub={kpis.posts.pending > 0 ? "Awaiting editorial approval" : undefined}
          />
          <KpiCard icon={Users} label="Total Users" value={kpis.users.total}
            sub={`+${kpis.users.newInRange} in last ${range}d`}
          />
          <KpiCard icon={Eye} label="Total Views" value={kpis.views.allTime}
            sub={`${kpis.views.inRange?.toLocaleString()} in last ${range}d`}
          />
        </div>
      </div>

      {/* KPI Row 2 — Engagement */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={MessageSquare} label="Approved Comments" value={kpis.comments.approved} />
        <KpiCard
          icon={AlertCircle}
          label="Pending Comments"
          value={kpis.comments.pending}
          accent={kpis.comments.pending > 0}
        />
        <KpiCard icon={Mail} label="Active Subscribers" value={kpis.newsletter.active}
          sub={`+${kpis.newsletter.newInRange} new`}
        />
        <KpiCard icon={FileText} label="Drafts" value={kpis.posts.drafts} />
      </div>

      {/* Views + Published Posts — big area chart */}
      <ChartCard title="Views & Publishing Activity" sub="Daily page views vs. posts published">
        <MultiLineChart
          views={charts.viewsOverTime}
          posts={charts.postsOverTime}
          height={240}
        />
      </ChartCard>

      {/* User growth + Newsletter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="New Users" sub="Daily registrations">
          <SimpleAreaChart
            data={charts.usersOverTime}
            color="#3b82f6"
            label="Users"
            height={180}
          />
        </ChartCard>
        <ChartCard title="Newsletter Sign-ups" sub="Daily new subscribers">
          <SimpleAreaChart
            data={charts.subscribersOverTime}
            color="#8b5cf6"
            label="Subscribers"
            height={180}
          />
        </ChartCard>
      </div>

      {/* Post Status Breakdown + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Content by Status" sub="Distribution of all posts">
          <StatusPieChart data={charts.postsByStatus} />
        </ChartCard>
        <ChartCard title="Top Categories" sub="By number of posts">
          <SimpleBarchart
            data={charts.topCategories}
            dataKey="postCount"
            nameKey="name"
            label="Posts"
          />
        </ChartCard>
      </div>

      {/* Top Tags */}
      <ChartCard title="Top Tags" sub="Most-used tags across all posts">
        <SimpleBarchart
          data={charts.topTags}
          dataKey="postCount"
          nameKey="name"
          label="Posts"
          height={200}
        />
      </ChartCard>

      {/* Top Posts Table */}
      <ChartCard title="Top Performing Posts" sub="Ranked by all-time views">
        <TopPostsTable posts={tables.topPosts} />
      </ChartCard>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Recent Posts" sub="Latest created">
          <PostsTable posts={tables.recentPosts} showAuthor />
        </ChartCard>
        <ChartCard title="Pending Comments" sub="Awaiting moderation">
          <PendingCommentsList comments={tables.pendingComments} />
        </ChartCard>
      </div>
    </div>
  );
};

// ── EDITOR DASHBOARD ─────────────────────────
const EditorDashboard = ({ analytics, range }) => {
  const { kpis, charts, tables } = analytics;

  return (
    <div className="flex flex-col gap-8">

      {/* KPIs */}
      <div>
        <SectionHeading sub="Content pipeline at a glance">Content Overview</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard icon={CheckCircle} label="Published" value={kpis.published} accent />
          <KpiCard
            icon={Clock}
            label="Pending Review"
            value={kpis.pendingReview}
            accent={kpis.pendingReview > 0}
            sub={kpis.pendingReview > 0 ? "Needs attention" : "All clear"}
          />
          <KpiCard icon={XCircle} label="Rejected" value={kpis.rejected} />
          <KpiCard icon={CalendarDays} label="Scheduled" value={kpis.scheduled} />
          <KpiCard icon={MessageSquare} label="Pending Comments" value={kpis.pendingComments} />
          <KpiCard icon={MessageSquare} label="Approved Comments" value={kpis.totalComments} />
        </div>
      </div>

      {/* Views over time */}
      <ChartCard title="Site Views" sub={`Daily views over last ${range} days`}>
        <SimpleAreaChart data={charts.viewsOverTime} height={220} label="Views" />
      </ChartCard>

      {/* Status pie + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Content Pipeline" sub="Posts by status">
          <StatusPieChart data={charts.postsByStatus} />
        </ChartCard>
        <ChartCard title="Top Categories" sub="By post count">
          <SimpleBarchart
            data={charts.topCategories}
            dataKey="postCount"
            nameKey="name"
            label="Posts"
          />
        </ChartCard>
      </div>

      {/* Review Queue — priority card */}
      <div
        className="card rounded-lg p-5"
        style={{ borderColor: kpis.pendingReview > 0 ? "#f59e0b66" : "var(--border-light)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Review Queue
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {kpis.pendingReview} post{kpis.pendingReview !== 1 ? "s" : ""} awaiting your approval
            </p>
          </div>
          {kpis.pendingReview > 0 && (
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ background: "#f59e0b22", color: "#f59e0b" }}
            >
              {kpis.pendingReview} pending
            </span>
          )}
        </div>
        <ReviewQueue posts={tables.pendingReviewQueue} />
      </div>

      {/* Top posts + recently published */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Top Performing Posts" sub="By views">
          <TopPostsTable posts={tables.topPosts} />
        </ChartCard>
        <ChartCard title="Recently Published" sub={`Last ${range} days`}>
          <PostsTable posts={tables.recentlyPublished} showAuthor />
        </ChartCard>
      </div>
    </div>
  );
};

// ── WRITER DASHBOARD ─────────────────────────
const WriterDashboard = ({ analytics, range }) => {
  const { kpis, charts, tables } = analytics;
  const eng = kpis.engagement;

  return (
    <div className="flex flex-col gap-8">

      {/* Post status KPIs */}
      <div>
        <SectionHeading sub="Your content at a glance">My Posts</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard icon={FileText} label="Total" value={kpis.posts.total} />
          <KpiCard icon={CheckCircle} label="Published" value={kpis.posts.published} accent />
          <KpiCard icon={FileText} label="Drafts" value={kpis.posts.drafts} />
          <KpiCard icon={Clock} label="Pending" value={kpis.posts.pending} />
          <KpiCard icon={XCircle} label="Rejected" value={kpis.posts.rejected}
            accent={kpis.posts.rejected > 0}
          />
        </div>
      </div>

      {/* Engagement KPIs */}
      <div>
        <SectionHeading sub="Across all your published posts">Engagement</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard icon={Eye} label="Total Views" value={eng.totalViews} accent
            sub={`${eng.viewsInRange?.toLocaleString()} in last ${range}d`}
          />
          <KpiCard icon={TrendingUp} label="Views (Period)" value={eng.viewsInRange} />
          <KpiCard icon={ThumbsUp} label="Likes" value={eng.totalLikes} />
          <KpiCard icon={HandMetal} label="Claps" value={eng.totalClaps} />
          <KpiCard icon={MessageSquare} label="Comments" value={eng.totalComments} />
          <KpiCard icon={Bookmark} label="Bookmarks" value={eng.totalBookmarks} />
        </div>
      </div>

      {/* Views over time */}
      <ChartCard title="Views on Your Posts" sub={`Daily traffic over last ${range} days`}>
        <SimpleAreaChart data={charts.viewsOverTime} height={220} label="Views" />
      </ChartCard>

      {/* Posts published + status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Your Publishing Frequency" sub="Posts published per day">
          <SimpleAreaChart
            data={charts.postsOverTime}
            color="#3b82f6"
            label="Posts"
            height={180}
          />
        </ChartCard>
        <ChartCard title="Your Content Status" sub="Breakdown of all posts">
          <StatusPieChart data={charts.postStatusBreakdown} />
        </ChartCard>
      </div>

      {/* Top posts */}
      <ChartCard title="Your Top Posts" sub="Best performing published posts">
        <TopPostsTable posts={tables.topPosts} />
      </ChartCard>

      {/* Recent posts — with rejection reasons */}
      <ChartCard title="Recent Activity" sub="Your latest posts">
        <PostsTable posts={tables.recentPosts} showAuthor={false} showRejection />
      </ChartCard>
    </div>
  );
};

// ── GUEST WRITER DASHBOARD ───────────────────
const GuestWriterDashboard = ({ analytics, range }) => {
  const { kpis, charts, tables } = analytics;

  return (
    <div className="flex flex-col gap-8">

      {/* KPIs */}
      <div>
        <SectionHeading sub="Your submission stats">My Submissions</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard icon={FileText} label="Total" value={kpis.total} />
          <KpiCard icon={CheckCircle} label="Published" value={kpis.published} accent />
          <KpiCard icon={FileText} label="Drafts" value={kpis.drafts} />
          <KpiCard icon={Clock} label="Pending Review" value={kpis.pendingReview} />
          <KpiCard icon={Eye} label="Total Views" value={kpis.totalViews} accent />
          <KpiCard icon={TrendingUp} label={`Views (${range}d)`} value={kpis.viewsInRange} />
        </div>
      </div>

      {/* Views chart */}
      <ChartCard title="Views on Your Posts" sub={`Last ${range} days`}>
        <SimpleAreaChart data={charts.viewsOverTime} height={200} label="Views" />
      </ChartCard>

      {/* All posts with status tracking */}
      <ChartCard title="My Posts" sub="Track your submission status">
        <PostsTable posts={tables.myPosts} showAuthor={false} showRejection />
      </ChartCard>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN DASHBOARD CLIENT
// ─────────────────────────────────────────────

const ROLE_LABELS = {
  admin: "Admin",
  editor: "Editor",
  writer: "Writer",
  guest_writer: "Guest Writer",
};

const DashboardClient = ({ analytics, range }) => {
  const router = useRouter();
  const role = analytics?.role;

  const handleRangeChange = (newRange) => {
    router.push(`?range=${newRange}`);
  };

  const renderDashboard = () => {
    switch (role) {
      case "admin":
        return <AdminDashboard analytics={analytics} range={range} />;
      case "editor":
        return <EditorDashboard analytics={analytics} range={range} />;
      case "writer":
        return <WriterDashboard analytics={analytics} range={range} />;
      case "guest_writer":
        return <GuestWriterDashboard analytics={analytics} range={range} />;
      default:
        return (
          <div
            className="flex flex-col items-center justify-center py-24 gap-3"
            style={{ color: "var(--text-muted)" }}
          >
            <BarChart2 size={36} />
            <p className="text-sm">No dashboard available for your role.</p>
          </div>
        );
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-light)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-widest"
                style={{
                  background: "var(--brand-primary-light)",
                  color: "var(--brand-primary)",
                }}
              >
                {ROLE_LABELS[role] ?? role}
              </span>
            </div>
            <h1
              className="heading-2 font-serif"
              style={{ color: "var(--text-primary)" }}
            >
              Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {role === "admin" || role === "editor"
                ? "Site-wide analytics and content management"
                : "Your personal writing analytics"}
            </p>
          </div>
          <RangePicker current={range} onChange={handleRangeChange} />
        </div>

        {/* Dashboard content */}
        {renderDashboard()}
      </div>
    </div>
  );
};

export default DashboardClient;