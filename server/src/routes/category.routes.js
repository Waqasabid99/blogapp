import express from "express";
import { createCategory, deleteCategory, getAllCategories, getCategory, getFlatCategories, updateCategory } from "../controllers/category.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permissions.middleware.js";
const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategories);
categoryRouter.get("/flat", getFlatCategories);
categoryRouter.get("/:id", getCategory);
categoryRouter.post("/create", verifyUser, requirePermission("category.create"), createCategory);
categoryRouter.patch("/update/:id", verifyUser, requirePermission("category.update"), updateCategory);
categoryRouter.delete("/delete", verifyUser, requirePermission("category.delete"), deleteCategory);

export default categoryRouter;