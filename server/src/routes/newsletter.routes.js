import express from "express";
import {
    subscribe,
    unsubscribe,
    getAllSubscribers,
    getSubscriber,
    updateSubscriber,
    deleteSubscriber,
    bulkImportSubscribers,
    createCampaign,
    getAllCampaigns,
    getCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    scheduleCampaign,
    cancelScheduledCampaign
} from "../controllers/newsletter.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permissions.middleware.js";

const newsletterRouter = express.Router();

// Public Routes
newsletterRouter.post("/subscribe", subscribe);
newsletterRouter.get("/unsubscribe/:token", unsubscribe);

// Admin Routes (Subscribers)
newsletterRouter.use(verifyUser);

newsletterRouter.get("/subscribers", requirePermission("newsletter.read"), getAllSubscribers);
newsletterRouter.get("/subscribers/:id", requirePermission("newsletter.read"), getSubscriber);
newsletterRouter.put("/subscribers/:id", requirePermission("newsletter.update"), updateSubscriber);
newsletterRouter.delete("/subscribers/:id", requirePermission("newsletter.delete"), deleteSubscriber);
newsletterRouter.post("/subscribers/bulk-import", requirePermission("newsletter.create"), bulkImportSubscribers);

// Admin Routes (Campaigns)
newsletterRouter.post("/campaigns", requirePermission("newsletter.create"), createCampaign);
newsletterRouter.get("/campaigns", requirePermission("newsletter.read"), getAllCampaigns);
newsletterRouter.get("/campaigns/:id", requirePermission("newsletter.read"), getCampaign);
newsletterRouter.put("/campaigns/:id", requirePermission("newsletter.update"), updateCampaign);
newsletterRouter.delete("/campaigns/:id", requirePermission("newsletter.delete"), deleteCampaign);

// Campaign Execution
newsletterRouter.post("/campaigns/:id/send", requirePermission("newsletter.publish"), sendCampaign);
newsletterRouter.post("/campaigns/:id/schedule", requirePermission("newsletter.publish"), scheduleCampaign);
newsletterRouter.post("/campaigns/:id/cancel-schedule", requirePermission("newsletter.publish"), cancelScheduledCampaign);

export default newsletterRouter;
