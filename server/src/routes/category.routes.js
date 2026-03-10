import express from "express";
import { createCategory, deleteCategory, getAllCategories, getCategory, updateCategory } from "../controllers/category.controller";
import { verifyUser } from "../middleware/auth.middleware";
const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:id", getCategory);
categoryRouter.post("/create", verifyUser, createCategory);
categoryRouter.patch("/update/:id", verifyUser, updateCategory);
categoryRouter.delete("/delete", verifyUser, deleteCategory);

export default categoryRouter;