import express from "express";
import {
    getAllUsers,
    getUserById,
    getUserPublicProfile,
    createUser,
    updateUser,
    updateUserRole,
    deleteUser,
    getUserStats,
    bulkUpdateUsers,
    getUserActivity,
    searchUsers,
} from "../controllers/user.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permissions.middleware.js";

const userRouter = express.Router();

// Public Routes
userRouter.get("/profile/:id", getUserPublicProfile);

// Protected Routes (Requires authentication)
userRouter.use(verifyUser);

// Admin Only Routes
userRouter.get("/", requirePermission("user.view"), getAllUsers);
userRouter.get("/search", requirePermission("user.view"), searchUsers);
userRouter.post("/", requirePermission("user.create"), createUser);
userRouter.post("/bulk-update", requirePermission("user.update"), bulkUpdateUsers);

// Admin or Self Routes (ownership checked in controller)
userRouter.get("/:id", getUserById);
userRouter.get("/:id/stats", getUserStats);
userRouter.get("/:id/activity", requirePermission("user.view"), getUserActivity);

// User Management Routes
userRouter.patch("/update/:id", updateUser);
userRouter.patch("/update-role/:id", requirePermission("role.update"), updateUserRole);
userRouter.delete("/delete/:id", requirePermission("user.delete"), deleteUser);

export default userRouter;