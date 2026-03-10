import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/error.middleware.js";
import categoryRouter from "./routes/category.routes.js";
import authRouter from "./routes/auth.routes.js";
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

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    })
);

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
app.use("/api/auth", authRouter);
app.use("/category", categoryRouter);
app.get("/",(req, res) => {
    res.send("Backend is running!");
})
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Global error handler
app.use(errorHandler);

export default app;