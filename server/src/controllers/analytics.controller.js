import { ApiError } from "../lib/ApiError.js";
import { apiResponse, asyncHandler } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Returns a Date object for N days ago (midnight UTC)
 */
const daysAgo = (n) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
};

/**
 * Fills missing days in a time-series array so charts always have
 * a continuous x-axis even when there is no data for a given day.
 *
 * @param {Array<{date: string, count: number}>} data - raw grouped data
 * @param {number} days - total window (e.g. 30)
 */
const fillTimeSeries = (data, days) => {
  const map = Object.fromEntries(data.map((d) => [d.date, d.count]));
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
    result.push({ date: key, count: map[key] ?? 0 });
  }
  return result;
};

/**
 * Formats a raw Prisma groupBy result (where _count is the value)
 * into { date, count } pairs.
 */
const formatGroupBy = (rows, dateField = "createdAt") =>
  rows.map((r) => ({
    date: r[dateField].toISOString().slice(0, 10),
    count: r._count,
  }));

// ─────────────────────────────────────────────
// ROLE HELPERS
// ─────────────────────────────────────────────

const ROLE_ADMIN = "admin";
const ROLE_EDITOR = "editor";
const ROLE_WRITER = "writer";
const ROLE_GUEST_WRITER = "guest_writer";

const isAdmin = (user) => user?.role?.slug === ROLE_ADMIN;
const isEditor = (user) => user?.role?.slug === ROLE_EDITOR;
const isAdminOrEditor = (user) => isAdmin(user) || isEditor(user);
const isWriter = (user) => user?.role?.slug === ROLE_WRITER;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD HANDLER
// GET /api/analytics/dashboard?range=30
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Single endpoint that returns a tailored analytics payload depending on
 * the authenticated user's role.
 *
 * Role payloads:
 *  - Admin   → full-site overview + user growth + content pipeline
 *  - Editor  → content pipeline + pending review queue + top posts
 *  - Writer  → personal post stats only
 *  - Guest   → personal post stats only (narrower)
 */
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized");

  // ?range=7|14|30|90  (default 30)
  const rawRange = parseInt(req.query.range) || 30;
  const range = [7, 14, 30, 90].includes(rawRange) ? rawRange : 30;
  const since = daysAgo(range);

  const roleSlug = user?.role ?? "";
  // ── Route to the correct builder ──────────────────────────────────────────
  if (roleSlug === ROLE_ADMIN) {
    const data = await buildAdminDashboard(user, since, range);
    return apiResponse(res, 200, true, "Admin analytics", data);
  }

  if (roleSlug === ROLE_EDITOR) {
    const data = await buildEditorDashboard(user, since, range);
    return apiResponse(res, 200, true, "Editor analytics", data);
  }

  if (roleSlug === ROLE_WRITER) {
    const data = await buildWriterDashboard(user, since, range);
    return apiResponse(res, 200, true, "Writer analytics", data);
  }

  if (roleSlug === ROLE_GUEST_WRITER) {
    const data = await buildGuestWriterDashboard(user, since, range);
    return apiResponse(res, 200, true, "Guest writer analytics", data);
  }

  throw new ApiError(403, "No analytics available for your role");
});

// ─────────────────────────────────────────────────────────────────────────────
// ADDITIONAL ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/analytics/post/:postId
 * Deep analytics for a single post.
 * - Admin / Editor: any post
 * - Writer / Guest: only their own post
 */
const getPostAnalytics = asyncHandler(async (req, res) => {
  const user = req.user;
  const { postId } = req.params;
  const rawRange = parseInt(req.query.range) || 30;
  const range = [7, 14, 30, 90].includes(rawRange) ? rawRange : 30;
  const since = daysAgo(range);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      authorId: true,
      viewCount: true,
      likeCount: true,
      clapCount: true,
      commentCount: true,
      bookmarkCount: true,
      publishedAt: true,
      readingTime: true,
    },
  });

  if (!post) throw new ApiError(404, "Post not found");

  // Ownership check for non-admin/editor
  if (!isAdminOrEditor(user) && post.authorId !== user.id) {
    throw new ApiError(403, "You do not have access to this post's analytics");
  }

  // Views over time
  const rawViews = await prisma.postView.groupBy({
    by: ["createdAt"],
    where: { postId, createdAt: { gte: since } },
    _count: true,
    orderBy: { createdAt: "asc" },
  });

  // Referrer breakdown
  const referrers = await prisma.postView.groupBy({
    by: ["referrer"],
    where: { postId, createdAt: { gte: since }, referrer: { not: null } },
    _count: { referrer: true },
    orderBy: { _count: { referrer: "desc" } },
    take: 10,
  });

  // Reactions breakdown
  const reactions = await prisma.reaction.groupBy({
    by: ["type"],
    where: { postId },
    _count: { type: true },
  });

  return apiResponse(res, 200, true, "Post analytics", {
    post,
    range,
    viewsOverTime: fillTimeSeries(formatGroupBy(rawViews), range),
    referrers: referrers.map((r) => ({
      referrer: r.referrer ?? "Direct",
      count: r._count.referrer,
    })),
    reactions: reactions.map((r) => ({
      type: r.type,
      count: r._count.type,
    })),
  });
});

/**
 * GET /api/analytics/overview  (Admin only — quick numbers for header cards)
 */
const getSiteOverview = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!isAdmin(user)) throw new ApiError(403, "Admin only");

  const [
    totalPosts,
    publishedPosts,
    totalUsers,
    totalViews,
    totalComments,
    totalSubscribers,
  ] = await Promise.all([
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.post.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.user.count(),
    prisma.postView.count(),
    prisma.comment.count({ where: { status: "APPROVED" } }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
  ]);

  return apiResponse(res, 200, true, "Site overview", {
    totalPosts,
    publishedPosts,
    totalUsers,
    totalViews,
    totalComments,
    totalSubscribers,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

// ── ADMIN ─────────────────────────────────────────────────────────────────────
async function buildAdminDashboard(user, since, range) {
  const [
    // KPI counters
    totalPosts,
    publishedPosts,
    pendingPosts,
    draftPosts,
    totalUsers,
    newUsersInRange,
    totalViews,
    viewsInRange,
    totalComments,
    pendingComments,
    activeSubscribers,
    newSubscribersInRange,

    // Time-series for charts
    rawPostsOverTime,
    rawViewsOverTime,
    rawUsersOverTime,
    rawSubscribersOverTime,

    // Content breakdown
    postsByStatus,
    topPosts,
    topCategories,
    topTags,

    // Recent activity
    recentPosts,
    recentComments,
  ] = await Promise.all([
    // ── KPIs ──────────────────────────────────────────────────────────────
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.post.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.post.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.post.count({ where: { status: "DRAFT", deletedAt: null } }),

    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since } } }),

    prisma.postView.count(),
    prisma.postView.count({ where: { createdAt: { gte: since } } }),

    prisma.comment.count({ where: { status: "APPROVED" } }),
    prisma.comment.count({ where: { status: "PENDING" } }),

    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.newsletterSubscriber.count({
      where: { isActive: true, createdAt: { gte: since } },
    }),

    // ── Time-series ────────────────────────────────────────────────────────
    prisma.post.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: since }, deletedAt: null },
      _count: true,
      orderBy: { createdAt: "asc" },
    }),

    prisma.postView.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: since } },
      _count: true,
      orderBy: { createdAt: "asc" },
    }),

    prisma.user.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: since } },
      _count: true,
      orderBy: { createdAt: "asc" },
    }),

    prisma.newsletterSubscriber.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: since }, isActive: true },
      _count: true,
      orderBy: { createdAt: "asc" },
    }),

    // ── Content breakdown ──────────────────────────────────────────────────
    prisma.post.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { status: true },
    }),

    // Top posts by views in range
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: { viewCount: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        bookmarkCount: true,
        publishedAt: true,
        author: { select: { id: true, name: true } },
      },
    }),

    // Top categories by post count
    prisma.postCategory.groupBy({
      by: ["categoryId"],
      _count: { postId: true },
      orderBy: { _count: { postId: "desc" } },
      take: 8,
    }),

    // Top tags by postCount field
    prisma.tag.findMany({
      orderBy: { postCount: "desc" },
      take: 10,
      select: { id: true, name: true, slug: true, postCount: true },
    }),

    // ── Recent activity ────────────────────────────────────────────────────
    prisma.post.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    }),

    prisma.comment.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
        post: { select: { id: true, title: true, slug: true } },
      },
    }),
  ]);

  // ── Enrich top categories with names ──────────────────────────────────────
  const categoryIds = topCategories.map((c) => c.categoryId);
  const categoryDetails = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, slug: true },
  });
  const categoryMap = Object.fromEntries(categoryDetails.map((c) => [c.id, c]));

  const enrichedTopCategories = topCategories.map((c) => ({
    ...categoryMap[c.categoryId],
    postCount: c._count.postId,
  }));

  return {
    role: "admin",
    range,

    // ── KPI cards ────────────────────────────────────────────────────────
    kpis: {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        pending: pendingPosts,
        drafts: draftPosts,
      },
      users: {
        total: totalUsers,
        newInRange: newUsersInRange,
      },
      views: {
        allTime: totalViews,
        inRange: viewsInRange,
      },
      comments: {
        approved: totalComments,
        pending: pendingComments,
      },
      newsletter: {
        active: activeSubscribers,
        newInRange: newSubscribersInRange,
      },
    },

    // ── Charts (Recharts-ready arrays) ───────────────────────────────────
    charts: {
      /** Line / Area chart — daily posts created */
      postsOverTime: fillTimeSeries(formatGroupBy(rawPostsOverTime), range),

      /** Line / Area chart — daily page views */
      viewsOverTime: fillTimeSeries(formatGroupBy(rawViewsOverTime), range),

      /** Line chart — daily new users */
      usersOverTime: fillTimeSeries(formatGroupBy(rawUsersOverTime), range),

      /** Line chart — daily newsletter sign-ups */
      subscribersOverTime: fillTimeSeries(
        formatGroupBy(rawSubscribersOverTime),
        range
      ),

      /** Pie / Donut chart — posts by status */
      postsByStatus: postsByStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),

      /** Bar chart — top categories */
      topCategories: enrichedTopCategories,

      /** Bar / Horizontal-bar chart — top tags */
      topTags,
    },

    // ── Tables ────────────────────────────────────────────────────────────
    tables: {
      topPosts,
      recentPosts,
      pendingComments: recentComments,
    },
  };
}

// ── EDITOR ────────────────────────────────────────────────────────────────────
async function buildEditorDashboard(user, since, range) {
  const [
    totalPublished,
    pendingReview,
    rejected,
    scheduled,

    rawViewsOverTime,
    rawPostsOverTime,

    postsByStatus,
    topPosts,
    pendingPosts,

    topCategories,
    recentlyPublished,

    pendingComments,
    totalComments,
  ] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.post.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.post.count({ where: { status: "REJECTED", deletedAt: null } }),
    prisma.post.count({ where: { status: "SCHEDULED", deletedAt: null } }),

    prisma.postView.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: since } },
      _count: true,
      orderBy: { createdAt: "asc" },
    }),

    prisma.post.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: since },
        status: "PUBLISHED",
        deletedAt: null,
      },
      _count: true,
      orderBy: { createdAt: "asc" },
    }),

    prisma.post.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { status: true },
    }),

    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: { viewCount: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        commentCount: true,
        likeCount: true,
        publishedAt: true,
        author: { select: { id: true, name: true } },
      },
    }),

    // Posts awaiting editorial review — full detail for the review queue
    prisma.post.findMany({
      where: { status: "PENDING", deletedAt: null },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        createdAt: true,
        readingTime: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
        categories: {
          select: { category: { select: { id: true, name: true } } },
        },
      },
    }),

    prisma.postCategory.groupBy({
      by: ["categoryId"],
      _count: { postId: true },
      orderBy: { _count: { postId: "desc" } },
      take: 8,
    }),

    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: since },
        deletedAt: null,
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        viewCount: true,
        author: { select: { id: true, name: true } },
      },
    }),

    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.comment.count({ where: { status: "APPROVED" } }),
  ]);

  // Enrich category names
  const catIds = topCategories.map((c) => c.categoryId);
  const catDetails = await prisma.category.findMany({
    where: { id: { in: catIds } },
    select: { id: true, name: true, slug: true },
  });
  const catMap = Object.fromEntries(catDetails.map((c) => [c.id, c]));

  return {
    role: "editor",
    range,

    kpis: {
      published: totalPublished,
      pendingReview,
      rejected,
      scheduled,
      pendingComments,
      totalComments,
    },

    charts: {
      viewsOverTime: fillTimeSeries(formatGroupBy(rawViewsOverTime), range),
      publishedPostsOverTime: fillTimeSeries(
        formatGroupBy(rawPostsOverTime),
        range
      ),
      postsByStatus: postsByStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      topCategories: topCategories.map((c) => ({
        ...catMap[c.categoryId],
        postCount: c._count.postId,
      })),
    },

    tables: {
      topPosts,
      pendingReviewQueue: pendingPosts,
      recentlyPublished,
    },
  };
}

// ── WRITER ────────────────────────────────────────────────────────────────────
async function buildWriterDashboard(user, since, range) {
  const authorId = user.id;

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    pendingPosts,
    rejectedPosts,

    totalViews,
    viewsInRange,
    totalLikes,
    totalClaps,
    totalComments,
    totalBookmarks,

    rawViewsOverTime,
    rawPostsOverTime,

    myTopPosts,
    recentPosts,

    postStatusBreakdown,
  ] = await Promise.all([
    prisma.post.count({ where: { authorId, deletedAt: null } }),
    prisma.post.count({ where: { authorId, status: "PUBLISHED", deletedAt: null } }),
    prisma.post.count({ where: { authorId, status: "DRAFT", deletedAt: null } }),
    prisma.post.count({ where: { authorId, status: "PENDING", deletedAt: null } }),
    prisma.post.count({ where: { authorId, status: "REJECTED", deletedAt: null } }),

    // All-time views across own posts
    prisma.postView.count({
      where: { post: { authorId } },
    }),
    prisma.postView.count({
      where: { post: { authorId }, createdAt: { gte: since } },
    }),

    // Aggregate engagement from denormalized counts
    prisma.post.aggregate({
      where: { authorId, status: "PUBLISHED", deletedAt: null },
      _sum: { likeCount: true },
    }),
    prisma.post.aggregate({
      where: { authorId, status: "PUBLISHED", deletedAt: null },
      _sum: { clapCount: true },
    }),
    prisma.post.aggregate({
      where: { authorId, status: "PUBLISHED", deletedAt: null },
      _sum: { commentCount: true },
    }),
    prisma.post.aggregate({
      where: { authorId, status: "PUBLISHED", deletedAt: null },
      _sum: { bookmarkCount: true },
    }),

    // Views over time for own posts
    prisma.postView.groupBy({
      by: ["createdAt"],
      where: { post: { authorId }, createdAt: { gte: since } },
      _count: true,
      orderBy: { createdAt: "asc" },
    }),

    // Own posts published over time
    prisma.post.groupBy({
      by: ["createdAt"],
      where: { authorId, status: "PUBLISHED", createdAt: { gte: since }, deletedAt: null },
      _count: true,
      orderBy: { createdAt: "asc" },
    }),

    // Top performing personal posts
    prisma.post.findMany({
      where: { authorId, status: "PUBLISHED", deletedAt: null },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        likeCount: true,
        clapCount: true,
        commentCount: true,
        bookmarkCount: true,
        publishedAt: true,
        readingTime: true,
      },
    }),

    prisma.post.findMany({
      where: { authorId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        viewCount: true,
        rejectionReason: true,
      },
    }),

    prisma.post.groupBy({
      by: ["status"],
      where: { authorId, deletedAt: null },
      _count: { status: true },
    }),
  ]);

  return {
    role: "writer",
    range,

    kpis: {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        drafts: draftPosts,
        pending: pendingPosts,
        rejected: rejectedPosts,
      },
      engagement: {
        totalViews,
        viewsInRange,
        totalLikes: totalLikes._sum.likeCount ?? 0,
        totalClaps: totalClaps._sum.clapCount ?? 0,
        totalComments: totalComments._sum.commentCount ?? 0,
        totalBookmarks: totalBookmarks._sum.bookmarkCount ?? 0,
      },
    },

    charts: {
      /** Area chart — daily views on your posts */
      viewsOverTime: fillTimeSeries(formatGroupBy(rawViewsOverTime), range),

      /** Bar chart — posts you published per day */
      postsOverTime: fillTimeSeries(formatGroupBy(rawPostsOverTime), range),

      /** Pie chart — your post statuses */
      postStatusBreakdown: postStatusBreakdown.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
    },

    tables: {
      topPosts: myTopPosts,
      recentPosts,
    },
  };
}

// ── GUEST WRITER ──────────────────────────────────────────────────────────────
async function buildGuestWriterDashboard(user, since, range) {
  const authorId = user.id;

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    pendingPosts,

    totalViews,
    viewsInRange,

    rawViewsOverTime,

    myPosts,
  ] = await Promise.all([
    prisma.post.count({ where: { authorId, deletedAt: null } }),
    prisma.post.count({ where: { authorId, status: "PUBLISHED", deletedAt: null } }),
    prisma.post.count({ where: { authorId, status: "DRAFT", deletedAt: null } }),
    prisma.post.count({ where: { authorId, status: "PENDING", deletedAt: null } }),

    prisma.postView.count({ where: { post: { authorId } } }),
    prisma.postView.count({
      where: { post: { authorId }, createdAt: { gte: since } },
    }),

    prisma.postView.groupBy({
      by: ["createdAt"],
      where: { post: { authorId }, createdAt: { gte: since } },
      _count: true,
      orderBy: { createdAt: "asc" },
    }),

    // All own posts with status so they can track approval
    prisma.post.findMany({
      where: { authorId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        viewCount: true,
        rejectionReason: true,
        publishedAt: true,
      },
    }),
  ]);

  return {
    role: "guest_writer",
    range,

    kpis: {
      total: totalPosts,
      published: publishedPosts,
      drafts: draftPosts,
      pendingReview: pendingPosts,
      totalViews,
      viewsInRange,
    },

    charts: {
      viewsOverTime: fillTimeSeries(formatGroupBy(rawViewsOverTime), range),
    },

    tables: {
      myPosts,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export { getDashboardAnalytics, getPostAnalytics, getSiteOverview };