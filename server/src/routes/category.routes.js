import express from "express";
import { createCategory, deleteCategory, getAllCategories, getCategory, getFlatCategories, updateCategory } from "../controllers/category.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategories);
categoryRouter.get("/flat", getFlatCategories);
categoryRouter.get("/:id", getCategory);
categoryRouter.post("/create", verifyUser, createCategory);
categoryRouter.patch("/update/:id", verifyUser, updateCategory);
categoryRouter.delete("/delete", verifyUser, deleteCategory);

export default categoryRouter;