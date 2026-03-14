import express from "express";
import {
    createComment,
    getPostComments,
    updateComment,
    deleteComment,
    moderateComment,
    getPendingComments,
} from "../controllers/comment.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permissions.middleware.js";
import { optionalPermission } from "../middleware/permissions.middleware.js";

const commentRouter = express.Router();

// Public / Optional Auth Routes
commentRouter.get("/post/:postId", optionalPermission(), getPostComments); // Nested replies included

// Protected Routes (Authenticated users)
commentRouter.use(verifyUser);
commentRouter.post("/", createComment);
commentRouter.put("/:id", updateComment);
commentRouter.delete("/:id", deleteComment);

// Admin / Editor Only Routes
commentRouter.get("/admin/pending", requirePermission("comment.moderate"), getPendingComments);
commentRouter.patch("/:id/moderate", requirePermission("comment.moderate"), moderateComment);

export default commentRouter;
