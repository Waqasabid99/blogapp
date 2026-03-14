import express from "express";
import {
    trackPageView,
    updateEngagement,
    getDashboardOverview,
    getRealtimeAnalytics,
    getTrafficAnalytics,
    getContentAnalytics,
    getPostAnalytics,
    getCategoryAnalytics,
    getTagAnalytics,
    getUserAnalytics,
    getRetentionAnalytics,
    exportAnalytics,
    generateReport,
} from "../controllers/analytics.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermissionWithAdmin } from "../middleware/permissions.middleware.js";

const analyticsRouter = express.Router();

// Public Tracking Routes
analyticsRouter.post("/view", trackPageView);
analyticsRouter.post("/engagement", updateEngagement);

// Protected Analytics Routes
analyticsRouter.use(verifyUser);

// Apply admin or specific permission requirement for analytics access
const requireAnalyticsView = requirePermissionWithAdmin("analytics.view");

analyticsRouter.get("/dashboard", requireAnalyticsView, getDashboardOverview);
analyticsRouter.get("/realtime", requireAnalyticsView, getRealtimeAnalytics);
analyticsRouter.get("/traffic", requireAnalyticsView, getTrafficAnalytics);
analyticsRouter.get("/content", requireAnalyticsView, getContentAnalytics);
analyticsRouter.get("/posts/:id", requireAnalyticsView, getPostAnalytics);
analyticsRouter.get("/categories", requireAnalyticsView, getCategoryAnalytics);
analyticsRouter.get("/tags", requireAnalyticsView, getTagAnalytics);
analyticsRouter.get("/users", requireAnalyticsView, getUserAnalytics);
analyticsRouter.get("/retention", requireAnalyticsView, getRetentionAnalytics);
analyticsRouter.get("/export", requireAnalyticsView, exportAnalytics);
analyticsRouter.post("/report", requireAnalyticsView, generateReport);

export default analyticsRouter;
