import express from "express";
import {
    createPost,
    updatePost,
    deletePost,
    getAllPosts,
    getSinglePost,
} from "../controllers/post.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permissions.middleware.js";
import { requirePostOwnership } from "../middleware/ownership.middleware.js";
import { optionalPermission } from "../middleware/permissions.middleware.js";

const postRouter = express.Router();

// Public / Optional Auth Routes
postRouter.get("/", optionalPermission(), getAllPosts);
postRouter.get("/:slug", optionalPermission(), getSinglePost);

// Protected Routes (Requires auth)
postRouter.use(verifyUser);

postRouter.post("/", requirePermission("post.create"), createPost);

// Protected by Ownership Middleware
postRouter.put("/:id", requirePostOwnership, updatePost);
postRouter.delete("/:id", requirePostOwnership, deletePost);

export default postRouter;
