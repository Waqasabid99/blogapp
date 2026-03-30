import winston from "winston";
import fs from "fs";
import path from "path";

// Ensure logs directory exists
const logDir = "logs";
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logger
const logger = winston.createLogger({
    level: "info",
    format: logFormat,
    transports: [
        // Error logs
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
        }),

        // All logs
        new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
        }),
    ],
});

// Console logging (only in dev)
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    );
}

export default logger;