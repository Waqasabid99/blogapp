import { Router } from "express";
import {
  getDashboardAnalytics,
  getPostAnalytics,
  getSiteOverview,
} from "../controllers/analytics.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permissions.middleware.js";

const analyticsRouter = Router();

// All analytics routes require authentication
analyticsRouter.use(verifyUser);

/**
 * GET /api/analytics/dashboard?range=30
 *
 * Returns role-scoped dashboard data.
 * Every authenticated role gets a tailored payload:
 *   - admin       → full site overview, user growth, content pipeline
 *   - editor      → content pipeline, review queue, top posts
 *   - writer      → personal post stats & engagement
 *   - guest_writer → basic personal post stats
 *
 * Query params:
 *   range  7 | 14 | 30 (default) | 90  — time window in days
 */
analyticsRouter.get("/dashboard", getDashboardAnalytics);

/**
 * GET /api/analytics/post/:postId?range=30
 *
 * Deep analytics for a single post.
 * Admin / Editor can view any post.
 * Writer / Guest can only view their own posts.
 */
analyticsRouter.get("/post/:postId", getPostAnalytics);

/**
 * GET /api/analytics/overview
 *
 * Quick site-wide KPI snapshot (Admin only).
 * Suitable for a compact header stat bar.
 */
analyticsRouter.get(
  "/overview",
  requirePermission("admin"),
  getSiteOverview
);

export default analyticsRouter;