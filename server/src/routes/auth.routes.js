import express from "express";
import { changePassword, currentUser, forgetPassword, login, logout, refreshToken, register, updateUser } from "../controllers/auth.controller";
import { verifyUser } from "../middleware/auth.middleware";
import { forgotPasswordLimiter, loginLimiter } from "../middleware/rateLimiter.middleware";
const authRouter = express.Router();

authRouter.get('/', verifyUser, currentUser);
authRouter.post("/register", register);
authRouter.post('/login', loginLimiter, login);
authRouter.post('/logout', logout);
authRouter.post('/refresh-token', refreshToken);
authRouter.patch('/update', verifyUser, updateUser);
authRouter.post('/forget-password', forgotPasswordLimiter, forgetPassword);
authRouter.post('/change-password', verifyUser, changePassword);

export default authRouter;