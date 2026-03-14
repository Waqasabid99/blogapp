import express from "express";
import {
    submitForReview,
    approvePost,
    rejectPost,
    schedulePost,
    publishPost,
} from "../controllers/editorial.workflow.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permissions.middleware.js";

const editorialRouter = express.Router();

// All editorial workflows require authentication
editorialRouter.use(verifyUser);

// Author / Editor workflows
editorialRouter.post("/:id/submit", requirePermission("post.create", "post.update"), submitForReview);

// Editor / Admin workflows
editorialRouter.post("/:id/approve", requirePermission("post.publish"), approvePost);
editorialRouter.post("/:id/reject", requirePermission("post.publish"), rejectPost);
editorialRouter.post("/:id/schedule", requirePermission("post.publish"), schedulePost);
editorialRouter.post("/:id/publish", requirePermission("post.publish"), publishPost);

export default editorialRouter;
