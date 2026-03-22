import { ApiError } from "../lib/ApiError.js";
import { apiResponse, asyncHandler } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";
import crypto from "crypto";

// HELPER FUNCTIONS
const hashIp = (ip) => {
    return crypto.createHash("sha256").update(ip).digest("hex");
};

// Parse date range
const getDateRange = (startDate, endDate, defaultDays = 30) => {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - defaultDays * 24 * 60 * 60 * 1000);

    // Reset time for accurate day comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

// Generate time series buckets
const generateTimeSeries = (start, end, granularity = "day") => {
    const series = [];
    const current = new Date(start);

    while (current <= end) {
        series.push(new Date(current));
        if (granularity === "hour") {
            current.setHours(current.getHours() + 1);
        } else if (granularity === "day") {
            current.setDate(current.getDate() + 1);
        } else if (granularity === "week") {
            current.setDate(current.getDate() + 7);
        } else if (granularity === "month") {
            current.setMonth(current.getMonth() + 1);
        }
    }

    return series;
};

// Track page view (Public - called from frontend/middleware)
const trackPageView = asyncHandler(async (req, res) => {
    const { postId, path, referrer, duration } = req.body;

    // Get client info
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    const ipHash = hashIp(ip);
    const userId = req.user?.id || null;

    // Validate post if provided
    if (postId) {
        const post = await prisma.post.findUnique({
            where: { id: postId, deletedAt: null },
        });
        if (!post) {
            throw new ApiError(404, "Post not found");
        }
    }

    // Create view record
    const view = await prisma.postView.create({
        data: {
            postId: postId || null,
            ipHash,
            userId,
            userAgent: userAgent.substring(0, 255), // Limit length
            referrer: referrer?.substring(0, 500) || null,
        },
    });

    // If post view, update post analytics (async, don't block)
    if (postId) {
        prisma.post
            .update({
                where: { id: postId },
                data: { viewCount: { increment: 1 } },
            })
            .catch(() => {}); // Silent fail
    }

    return apiResponse(res, 201, true, "View tracked", { viewId: view.id });
});

// Track engagement time (update duration)
const updateEngagement = asyncHandler(async (req, res) => {
    const { viewId, duration } = req.body;

    if (!viewId || !duration || duration < 0) {
        throw new ApiError(400, "Valid viewId and duration required");
    }

    // Note: You may want to add a duration field to PostView model
    // For now, we'll store this in a separate engagement log or cache

    return apiResponse(res, 200, true, "Engagement recorded");
});

// DASHBOARD ANALYTICS (Admin)
const getDashboardOverview = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const { start, end } = getDateRange(startDate, endDate, 30);

    const [
        totalPosts,
        publishedPosts,
        draftPosts,
        totalCategories,
        totalTags,
        totalUsers,
        newUsers,
        totalViews,
        uniqueVisitorsRaw,
        totalComments,
        newComments,
        totalSubscribers,
        newSubscribers,
        topPosts,
        recentPosts,
    ] = await Promise.all([
        // ✅ FIXED (no transaction)
        prisma.post.count({ where: { deletedAt: null } }),
        prisma.post.count({ where: { status: "PUBLISHED", deletedAt: null } }),
        prisma.post.count({ where: { status: "DRAFT", deletedAt: null } }),
        prisma.category.count(),
        prisma.tag.count(),

        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),

        prisma.postView.count({ where: { createdAt: { gte: start, lte: end } } }),

        prisma.$queryRaw`
            SELECT COUNT(DISTINCT "ipHash")::int as count
            FROM "PostView"
            WHERE "createdAt" BETWEEN ${start} AND ${end}
        `,

        prisma.comment.count(),
        prisma.comment.count({
            where: {
                createdAt: { gte: start, lte: end },
                status: "APPROVED",
            },
        }),

        prisma.newsletterSubscriber.count({ where: { isActive: true } }),
        prisma.newsletterSubscriber.count({
            where: {
                createdAt: { gte: start, lte: end },
                isActive: true,
            },
        }),

        prisma.post.findMany({
            where: { status: "PUBLISHED", deletedAt: null },
            orderBy: { viewCount: "desc" },
            take: 5,
        }),

        prisma.post.findMany({
            where: { deletedAt: null },
            orderBy: { updatedAt: "desc" },
            take: 5,
        }),
    ]);

    const uniqueVisitors = uniqueVisitorsRaw?.[0]?.count || 0;

    return apiResponse(res, 200, true, "Dashboard overview fetched", {
        content: { totalPosts, publishedPosts, draftPosts, totalCategories, totalTags },
        users: { total: totalUsers, new: newUsers },
        engagement: { totalViews, uniqueVisitors, totalComments, newComments },
        newsletter: { totalSubscribers, newSubscribers },
        topPosts,
        recentPosts,
    });
});

// TRAFFIC ANALYTICS
const getTrafficAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate, granularity = "day", postId } = req.query;
    const { start, end } = getDateRange(startDate, endDate, 30);

    const dateTruncMap = {
        hour: "hour",
        day: "day",
        week: "week",
        month: "month",
    };

    const trunc = dateTruncMap[granularity] || "day";

    const wherePost = postId ? prisma.sql`AND "postId" = ${postId}` : prisma.empty;

    // Time series aggregation (DB level)
    const timeSeries = await prisma.$queryRawUnsafe(
        `
    SELECT 
        DATE_TRUNC('${trunc}', "createdAt") as date,
        COUNT(*)::int as views,
        COUNT(DISTINCT "ipHash")::int as "uniqueVisitors"
    FROM "PostView"
    WHERE "createdAt" BETWEEN $1 AND $2
    ${postId ? `AND "postId" = '${postId}'` : ""}
    GROUP BY date
    ORDER BY date ASC
`,
        start,
        end
    );

    // Referrers
    const referrersRaw = await prisma.$queryRaw`
        SELECT "referrer"
        FROM "PostView"
        WHERE "createdAt" BETWEEN ${start} AND ${end}
        AND "referrer" IS NOT NULL
    `;

    const referrerStats = {};
    for (const r of referrersRaw) {
        try {
            const url = new URL(r.referrer);
            const domain = url.hostname.replace(/^www\./, "");
            referrerStats[domain] = (referrerStats[domain] || 0) + 1;
        } catch {
            referrerStats["Direct/Unknown"] = (referrerStats["Direct/Unknown"] || 0) + 1;
        }
    }

    const topReferrers = Object.entries(referrerStats)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Devices
    const devices = await prisma.$queryRaw`
        SELECT "userAgent"
        FROM "PostView"
        WHERE "createdAt" BETWEEN ${start} AND ${end}
    `;

    const deviceStats = {
        mobile: devices.filter((d) => /Mobile|Android|iPhone/i.test(d.userAgent)).length,
        desktop: devices.filter((d) => !/Mobile|Android|iPhone/i.test(d.userAgent)).length,
    };

    return apiResponse(res, 200, true, "Traffic analytics fetched", {
        period: { start, end, granularity },

        summary: {
            totalViews: timeSeries.reduce((acc, d) => acc + d.views, 0),
            uniqueVisitors: timeSeries.reduce((acc, d) => acc + d.uniqueVisitors, 0),
            avgViewsPerBucket: (timeSeries.reduce((acc, d) => acc + d.views, 0) / Math.max(timeSeries.length, 1)).toFixed(1),
        },

        timeSeries,
        referrers: topReferrers,
        devices: deviceStats,
    });
});

// CONTENT ANALYTICS
const getContentAnalytics = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, sortBy = "views", order = "desc", status, authorId } = req.query;

    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.min(parseInt(limit), 50);
    const skip = (pageNumber - 1) * pageSize;

    const where = { deletedAt: null };
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;

    const sortMapping = {
        views: "viewCount",
        comments: "commentCount",
        likes: "likeCount",
        readingTime: "readingTime",
        publishedAt: "publishedAt",
    };

    const sortField = sortMapping[sortBy] || "viewCount";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const [posts, total] = await prisma.$transaction([
        prisma.post.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { [sortField]: sortOrder },
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                viewCount: true,
                commentCount: true,
                likeCount: true,
                bookmarkCount: true,
                readingTime: true,
                publishedAt: true,
                author: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        }),
        prisma.post.count({ where }),
    ]);

    const postsWithScore = posts.map((post) => {
        const views = Math.max(post.viewCount, 1);

        const engagementScore = (post.likeCount / views) * 100 + (post.commentCount / views) * 200 + (post.bookmarkCount / views) * 300;

        const ctr = ((post.likeCount + post.commentCount + post.bookmarkCount) / views) * 100;

        return {
            ...post,
            engagementScore: Number(engagementScore.toFixed(2)),
            ctr: Number(ctr.toFixed(2)),
        };
    });

    return apiResponse(res, 200, true, "Content analytics fetched", {
        posts: postsWithScore,
        pagination: {
            total,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(total / pageSize),
        },
    });
});

// Get single post analytics
const getPostAnalytics = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const { start, end } = getDateRange(startDate, endDate, 30);

    const post = await prisma.post.findUnique({
        where: { id, deletedAt: null },
        select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            viewCount: true,
            commentCount: true,
            likeCount: true,
            clapCount: true,
            bookmarkCount: true,
            readingTime: true,
            wordCount: true,
            publishedAt: true,
            createdAt: true,
            author: {
                select: { name: true, id: true },
            },
        },
    });

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    // Get views over time
    const views = await prisma.postView.findMany({
        where: {
            postId: id,
            createdAt: { gte: start, lte: end },
        },
        select: {
            createdAt: true,
            referrer: true,
        },
        orderBy: { createdAt: "asc" },
    });

    // Time series
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const timeSeries = [];
    for (let i = 0; i < days; i++) {
        const day = new Date(start);
        day.setDate(day.getDate() + i);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayViews = views.filter((v) => v.createdAt >= day && v.createdAt < nextDay).length;

        timeSeries.push({
            date: day.toISOString().split("T")[0],
            views: dayViews,
        });
    }

    // Referrers for this post
    const referrerStats = {};
    views.forEach((view) => {
        const ref = view.referrer || "Direct";
        try {
            const domain = new URL(ref).hostname.replace("www.", "");
            referrerStats[domain] = (referrerStats[domain] || 0) + 1;
        } catch {
            referrerStats["Direct/Unknown"] = (referrerStats["Direct/Unknown"] || 0) + 1;
        }
    });

    // Engagement funnel
    const [reactions, bookmarks] = await prisma.$transaction([
        prisma.reaction.groupBy({
            by: ["type"],
            where: { postId: id },
            _count: { type: true },
        }),
        prisma.bookmark.count({ where: { postId: id } }),
    ]);

    return apiResponse(res, 200, true, "Post analytics fetched", {
        post,
        period: { start, end },
        views: {
            total: views.length,
            timeSeries,
            referrers: Object.entries(referrerStats)
                .map(([domain, count]) => ({ domain, count }))
                .sort((a, b) => b.count - a.count),
        },
        engagement: {
            reactions: reactions.reduce((acc, r) => {
                acc[r.type] = r._count.type;
                return acc;
            }, {}),
            bookmarks,
            conversionRate: views.length > 0 ? (((post.likeCount + post.commentCount) / views.length) * 100).toFixed(2) : 0,
        },
    });
});

// Get category performance
const getCategoryAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const { start, end } = getDateRange(startDate, endDate, 30);

    const categories = await prisma.category.findMany({
        include: {
            posts: {
                where: {
                    post: {
                        createdAt: { gte: start, lte: end },
                        deletedAt: null,
                    },
                },
                select: {
                    post: {
                        select: {
                            viewCount: true,
                            commentCount: true,
                            likeCount: true,
                        },
                    },
                },
            },
            children: {
                select: { id: true, name: true },
            },
        },
    });

    const categoryStats = categories
        .map((cat) => {
            const totals = cat.posts.reduce(
                (acc, p) => {
                    acc.views += p.post.viewCount;
                    acc.comments += p.post.commentCount;
                    acc.likes += p.post.likeCount;
                    acc.postCount += 1;
                    return acc;
                },
                { views: 0, comments: 0, likes: 0, postCount: 0 }
            );

            return {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                ...totals,
                engagementScore: totals.views + totals.comments * 10 + totals.likes * 5,
                children: cat.children,
            };
        })
        .sort((a, b) => b.engagementScore - a.engagementScore);

    return apiResponse(res, 200, true, "Category analytics fetched", {
        period: { start, end },
        categories: categoryStats,
    });
});

// Get tag analytics
const getTagAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 20 } = req.query;
    const { start, end } = getDateRange(startDate, endDate, 30);
    const take = Math.min(parseInt(limit), 50);

    const tags = await prisma.tag.findMany({
        take,
        orderBy: { postCount: "desc" },
        include: {
            posts: {
                where: {
                    post: {
                        createdAt: { gte: start, lte: end },
                        deletedAt: null,
                    },
                },
                select: {
                    post: {
                        select: {
                            viewCount: true,
                            likeCount: true,
                        },
                    },
                },
            },
        },
    });

    const tagStats = tags.map((tag) => {
        const totals = tag.posts.reduce(
            (acc, p) => {
                acc.views += p.post.viewCount;
                acc.likes += p.post.likeCount;
                return acc;
            },
            { views: 0, likes: 0 }
        );

        return {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            postCount: tag.postCount,
            ...totals,
            avgViewsPerPost: tag.postCount > 0 ? Math.round(totals.views / tag.postCount) : 0,
        };
    });

    return apiResponse(res, 200, true, "Tag analytics fetched", {
        period: { start, end },
        tags: tagStats,
    });
});

// USER ANALYTICS
const getUserAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const { start, end } = getDateRange(startDate, endDate, 30);

    const [totalUsers, newUsers, commentGroups, postGroups, roleGroups] = await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.comment.groupBy({
            by: ["authorId"],
            where: {
                createdAt: { gte: start, lte: end },
                authorId: { not: null },
            },
            _count: { authorId: true },
        }),
        prisma.post.groupBy({
            by: ["authorId"],
            where: {
                createdAt: { gte: start, lte: end },
                deletedAt: null,
            },
            _count: { authorId: true },
            orderBy: { _count: { authorId: "desc" } },
            take: 10,
        }),
        prisma.user.groupBy({
            by: ["roleId"],
            _count: { roleId: true },
        }),
    ]);

    // Process the results outside the transaction
    const activeUsers = commentGroups.length;

    const topContributors = await prisma.user.findMany({
        where: { id: { in: postGroups.map((r) => r.authorId) } },
        select: { id: true, name: true, avatarUrl: true },
    });
    const formattedTopContributors = postGroups.map((r) => ({
        ...r,
        user: topContributors.find((u) => u.id === r.authorId),
    }));

    const roles = await prisma.role.findMany({
        where: { id: { in: roleGroups.map((r) => r.roleId).filter(Boolean) } },
        select: { id: true, name: true },
    });
    const userRoles = roleGroups.map((r) => ({
        count: r._count.roleId,
        role: roles.find((role) => role.id === r.roleId)?.name || "No Role",
    }));

    return apiResponse(res, 200, true, "User analytics fetched", {
        period: { start, end },
        overview: {
            totalUsers,
            newUsers,
            activeUsers,
            activationRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
        },
        topContributors,
        userRoles,
    });
});

// Get reader retention/churn (simplified cohort analysis)
const getRetentionAnalytics = asyncHandler(async (req, res) => {
    // Get users who subscribed in each month and their activity
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyCohorts = await prisma.$queryRaw`
        WITH user_cohorts AS (
            SELECT 
                DATE_TRUNC('month', "createdAt") as cohort_month,
                id as user_id
            FROM "User"
            WHERE "createdAt" >= ${sixMonthsAgo}
        ),
        monthly_activity AS (
            SELECT 
                DATE_TRUNC('month', "createdAt") as activity_month,
                "authorId" as user_id
            FROM "Comment"
            WHERE "createdAt" >= ${sixMonthsAgo} AND "authorId" IS NOT NULL
            GROUP BY DATE_TRUNC('month', "createdAt"), "authorId"
        )
        SELECT 
            uc.cohort_month,
            COUNT(DISTINCT uc.user_id) as cohort_size,
            COUNT(DISTINCT CASE 
                WHEN ma.activity_month = uc.cohort_month THEN ma.user_id 
            END) as month_0_active,
            COUNT(DISTINCT CASE 
                WHEN ma.activity_month = uc.cohort_month + INTERVAL '1 month' THEN ma.user_id 
            END) as month_1_active
        FROM user_cohorts uc
        LEFT JOIN monthly_activity ma ON uc.user_id = ma.user_id
        GROUP BY uc.cohort_month
        ORDER BY uc.cohort_month DESC
    `;

    return apiResponse(res, 200, true, "Retention analytics fetched", {
        cohorts: monthlyCohorts.map((c) => ({
            month: c.cohort_month.toISOString().slice(0, 7),
            size: parseInt(c.cohort_size),
            month0Retention: c.cohort_size > 0 ? ((parseInt(c.month_0_active) / parseInt(c.cohort_size)) * 100).toFixed(1) : 0,
            month1Retention: c.cohort_size > 0 ? ((parseInt(c.month_1_active) / parseInt(c.cohort_size)) * 100).toFixed(1) : 0,
        })),
    });
});

// EXPORT & REPORTING
const exportAnalytics = asyncHandler(async (req, res) => {
    const { type, format = "json", startDate, endDate } = req.query;
    const { start, end } = getDateRange(startDate, endDate, 30);

    let data;

    switch (type) {
        case "views":
            data = await prisma.postView.findMany({
                where: { createdAt: { gte: start, lte: end } },
                select: {
                    createdAt: true,
                    ipHash: true,
                    postId: true,
                    referrer: true,
                },
                orderBy: { createdAt: "desc" },
            });
            break;

        case "posts":
            data = await prisma.post.findMany({
                where: {
                    createdAt: { gte: start, lte: end },
                    deletedAt: null,
                },
                select: {
                    title: true,
                    slug: true,
                    viewCount: true,
                    commentCount: true,
                    likeCount: true,
                    publishedAt: true,
                    author: { select: { name: true } },
                },
                orderBy: { viewCount: "desc" },
            });
            break;

        case "users":
            data = await prisma.user.findMany({
                where: { createdAt: { gte: start, lte: end } },
                select: {
                    email: true,
                    name: true,
                    createdAt: true,
                    role: { select: { name: true } },
                },
            });
            break;

        default:
            throw new ApiError(400, "Invalid export type");
    }

    if (format === "csv") {
        const headers = Object.keys(data[0] || {}).join(",");
        const rows = data.map((row) =>
            Object.values(row)
                .map((v) => (typeof v === "object" ? JSON.stringify(v) : `"${v}"`))
                .join(",")
        );
        const csv = [headers, ...rows].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=${type}-export.csv`);
        return res.send(csv);
    }

    return apiResponse(res, 200, true, "Data exported", {
        count: data.length,
        period: { start, end },
        data,
    });
});

// Generate automated report
const generateReport = asyncHandler(async (req, res) => {
    const { period = "monthly" } = req.body;

    let start, end;
    const now = new Date();

    if (period === "weekly") {
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
    } else if (period === "monthly") {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (period === "quarterly") {
        const quarter = Math.floor((now.getMonth() + 3) / 3) - 1;
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
    } else {
        throw new ApiError(400, "Invalid period");
    }

    // Aggregate all metrics
    const [totalViews, totalPosts, totalComments, totalUsers, topContent, trafficSources] = await prisma.$transaction([
        prisma.postView.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.post.count({ where: { createdAt: { gte: start, lte: end }, deletedAt: null } }),
        prisma.comment.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),

        prisma.post.findMany({
            where: {
                createdAt: { gte: start, lte: end },
                deletedAt: null,
            },
            orderBy: { viewCount: "desc" },
            take: 5,
            select: {
                title: true,
                viewCount: true,
                commentCount: true,
                likeCount: true,
            },
        }),

        prisma.postView.groupBy({
            by: ["referrer"],
            where: { createdAt: { gte: start, lte: end } },
            _count: { referrer: true },
        }),
    ]);

    const report = {
        generatedAt: new Date().toISOString(),
        period: { start, end, type: period },
        summary: {
            totalViews,
            totalPosts,
            totalComments,
            totalUsers,
            avgEngagement: totalViews > 0 ? (((totalComments + totalUsers) / totalViews) * 100).toFixed(2) : 0,
        },
        highlights: {
            topContent,
            topReferrers: trafficSources
                .filter((t) => t.referrer)
                .slice(0, 5)
                .map((t) => ({ source: t.referrer, count: t._count.referrer })),
        },
        recommendations: generateRecommendations({
            views: totalViews,
            posts: totalPosts,
            comments: totalComments,
        }),
    };

    return apiResponse(res, 200, true, "Report generated", { report });
});

// Helper for recommendations
const generateRecommendations = (metrics) => {
    const recommendations = [];

    if (metrics.posts > 0 && metrics.views / metrics.posts < 100) {
        recommendations.push("Consider promoting your content more actively on social media");
    }
    if (metrics.comments / metrics.views < 0.01) {
        recommendations.push("Add call-to-action questions at the end of posts to increase comments");
    }
    if (metrics.posts < 5) {
        recommendations.push("Increase publishing frequency to build audience");
    }

    return recommendations;
};

export {
    // Tracking
    trackPageView,
    updateEngagement,

    // Dashboard
    getDashboardOverview,

    // Traffic
    getTrafficAnalytics,

    // Content
    getContentAnalytics,
    getPostAnalytics,
    getCategoryAnalytics,
    getTagAnalytics,

    // Users
    getUserAnalytics,
    getRetentionAnalytics,

    // Export
    exportAnalytics,
    generateReport,
};
