import express from "express";
import { changePassword, currentUser, forgetPassword, login, logout, refreshToken, register, updateUser } from "../controllers/auth.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { forgotPasswordLimiter, loginLimiter } from "../middleware/rateLimiter.middleware.js";
import { apiResponse } from "../lib/helpers.js";
const authRouter = express.Router();

authRouter.get('/', verifyUser, currentUser);
authRouter.post("/register", register);
authRouter.post('/login', loginLimiter, login);
authRouter.post('/logout', verifyUser, logout);
authRouter.post('/refresh-token', refreshToken);
authRouter.patch('/update', verifyUser, updateUser);
authRouter.post('/forget-password', forgotPasswordLimiter, forgetPassword);
authRouter.post('/change-password', verifyUser, changePassword);
authRouter.post("/verify", verifyUser, (req, res) => { apiResponse(res, 200, true, "Verified", req.user); });

export default authRouter;