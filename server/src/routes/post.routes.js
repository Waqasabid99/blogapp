import express from "express";
import {
    createPost,
    updatePost,
    deletePost,
    getAllPosts,
    getSinglePost,
    getSinglePostById,
    getRelatedPosts,
    getLatestPosts,
    getFeaturedPosts,
    getPinnedPosts,
    getPublishedPosts,
    getPopularPosts,
    getTrendingPosts,
    getPostsByCategory,
    getOwnPosts,
} from "../controllers/post.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permissions.middleware.js";
import { requirePostOwnership } from "../middleware/ownership.middleware.js";
import { optionalPermission } from "../middleware/permissions.middleware.js";

const postRouter = express.Router();

// Public / Optional Auth Routes
postRouter.get("/", optionalPermission(), getAllPosts);
postRouter.get("/published", getPublishedPosts);
postRouter.get("/latest", getLatestPosts);
postRouter.get("/featured", getFeaturedPosts);
postRouter.get("/pinned", getPinnedPosts);
postRouter.get("/popular", getPopularPosts);
postRouter.get("/trending", getTrendingPosts);
postRouter.get("/:slug", optionalPermission(), getSinglePost);
postRouter.get("/postId/:id", verifyUser, optionalPermission(), getSinglePostById);
postRouter.get("/category/:slug", getPostsByCategory);
postRouter.post("/relatedposts", getRelatedPosts);

// Protected Routes (Requires auth)
postRouter.use(verifyUser);

postRouter.post("/", requirePermission("post.create"), createPost);

// Protected by Ownership Middleware
postRouter.get("/all/my-posts", getOwnPosts);
postRouter.put("/:id", requirePostOwnership, updatePost);
postRouter.delete("/:id", requirePostOwnership, deletePost);

export default postRouter;
