// routes/tag.routes.js
import { Router } from "express";
import {
    getAllTags,
    getTag,
    getTagById,
    createTag,
    bulkCreateTags,
    updateTag,
    mergeTags,
    deleteTag,
    getPopularTags,
    getRelatedTags,
    recalculatePostCounts,
    cleanupOrphanedTags,
} from "../controllers/tag.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permissions.middleware.js";

const tagRouter = Router();

// Public routes
tagRouter.get("/", getAllTags);
tagRouter.get("/popular", getPopularTags);
tagRouter.get("/related/:slug", getRelatedTags);
tagRouter.get("/slug/:slug", getTag);

// Protected routes
tagRouter.use(verifyUser);

// Admin/Editor routes
tagRouter.post("/", requirePermission("tag.create"), createTag);
tagRouter.post("/bulk", requirePermission("tag.create"), bulkCreateTags);
tagRouter.post("/merge", requirePermission("tag.update"), mergeTags);
tagRouter.get("/id/:id", requirePermission("tag.read"), getTagById);
tagRouter.patch("/:id", requirePermission("tag.update"), updateTag);
tagRouter.delete("/:id", requirePermission("tag.delete"), deleteTag);

// Maintenance routes
tagRouter.post("/recalculate", requirePermission("admin"), recalculatePostCounts);
tagRouter.post("/cleanup", requirePermission("admin"), cleanupOrphanedTags);

export default tagRouter;
