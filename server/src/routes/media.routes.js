import { Router } from "express";
import multer from "multer";
import {
    uploadMedia,
    uploadMultipleMedia,
    getAllMedia,
    getMedia,
    getMediaByPublicId,
    updateMedia,
    deleteMedia,
    bulkDeleteMedia,
    getMediaStats,
    cleanupUnusedMedia,
    generateSignedUrl,
    extractImagesFromContent,
} from "../controllers/media.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permissions.middleware.js";

const mediaRouter = Router();

// Multer configuration (memory storage for Cloudinary)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

// Public routes
mediaRouter.get("/stats", getMediaStats);
mediaRouter.get("/public/:publicId", getMediaByPublicId);
mediaRouter.get("/:id", getMedia);
mediaRouter.get("/", getAllMedia);

// Protected routes
mediaRouter.use(verifyUser);

// Upload routes
mediaRouter.post("/upload", requirePermission("media.create"), upload.single("file"), uploadMedia);

mediaRouter.post("/upload/batch", requirePermission("media.create"), upload.array("files", 10), uploadMultipleMedia);

// Content analysis
mediaRouter.post("/extract-images", requirePermission("media.read"), extractImagesFromContent);

// Management routes
mediaRouter.patch("/:id", requirePermission("media.update"), updateMedia);
mediaRouter.delete("/:id", requirePermission("media.delete"), deleteMedia);
mediaRouter.post("/bulk-delete", requirePermission("media.delete"), bulkDeleteMedia);

// Admin routes
mediaRouter.post("/cleanup", requirePermission("admin"), cleanupUnusedMedia);
mediaRouter.post("/signed-url", requirePermission("media.read"), generateSignedUrl);

export default mediaRouter;
