import express from "express";
import { getAllRoles, getAllPermissions } from "../controllers/rolePermission.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/permissions.middleware.js";

const rolePermissionRouter = express.Router();

rolePermissionRouter.use(verifyUser);

rolePermissionRouter.get("/roles", requirePermission("role.view"), getAllRoles);
rolePermissionRouter.get("/permissions", requirePermission("permission.view"), getAllPermissions);

export default rolePermissionRouter;