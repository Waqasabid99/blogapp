import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import tagRouter from "./routes/tag.routes.js";
import postRouter from "./routes/post.routes.js";
import seriesRouter from "./routes/series.routes.js";
import commentRouter from "./routes/comment.routes.js";
import newsletterRouter from "./routes/newsletter.routes.js";
import editorialRouter from "./routes/editorial.workflow.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import userRouter from "./routes/user.routes.js";
import rolePermissionRouter from "./routes/rolePermission.routes.js";
import mediaRouter from "./routes/media.routes.js";
const app = express();

// Middleware
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "https:", "'unsafe-inline'"],
                styleSrc: ["'self'", "https:", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https:"],
                fontSrc: ["'self'", "https:", "data:"],
                objectSrc: ["'none'"],
                frameAncestors: ["'none'"],
                upgradeInsecureRequests: [],
            },
        },

        crossOriginEmbedderPolicy: false,

        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },

        frameguard: {
            action: "deny",
        },

        referrerPolicy: {
            policy: "no-referrer",
        },
    })
);

// app.use(
//     rateLimit({
//         windowMs: 15 * 60 * 1000,
//         max: 200,
//     })
// );

app.use(
    cors({
        origin:
            process.env.NODE_ENV === "production"
                ? process.env.ORIGIN
                : "http://localhost:3000",
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/auth", authRouter);
app.use("/category", categoryRouter);
app.use("/tag", tagRouter);
app.use("/post", postRouter);
app.use("/series", seriesRouter);
app.use("/comment", commentRouter);
app.use("/newsletter", newsletterRouter);
app.use("/editorial", editorialRouter);
app.use("/analytics", analyticsRouter);
app.use("/users", userRouter);
app.use("/role-permission", rolePermissionRouter);
app.use("/media", mediaRouter);

app.get("/", (req, res) => {
    res.send("Backend is running!");
})
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Backend is running!" });
});

// Global error handler
app.use(errorHandler);

export default app;