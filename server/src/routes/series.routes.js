import express from "express";
import {
    createSeries,
    updateSeries,
    deleteSeries,
    getAllSeries,
    getSeries,
    addPostToSeries,
    removePostFromSeries,
} from "../controllers/series.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permissions.middleware.js";

const seriesRouter = express.Router();

// Public Routes
seriesRouter.get("/", getAllSeries);
seriesRouter.get("/:slug", getSeries);

// Protected Routes (Admin / Editor generally handling series)
seriesRouter.use(verifyUser);

seriesRouter.post("/", requirePermission("series.create"), createSeries);
seriesRouter.put("/:id", requirePermission("series.update"), updateSeries);
seriesRouter.delete("/:id", requirePermission("series.delete"), deleteSeries);

// Managing Posts in Series
seriesRouter.post("/posts/add", requirePermission("series.update", "post.update"), addPostToSeries);
seriesRouter.delete("/posts/:postId/remove", requirePermission("series.update", "post.update"), removePostFromSeries);

export default seriesRouter;
