import rateLimit from "express-rate-limit";

// Generic rate limiter
export const rateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 1000, // limit each IP to 1000 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    message: {
      status: 429,
      success: false,
      message: "Too many requests, please try again later.",
    },
    skipFailedRequests: options.skipFailedRequests || false, // optional
    ...options.extraOptions,
  });
};

export const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // max 1000 login attempts per IP per window
  message: {
    status: 429,
    success: false,
    message:
      "Too many login attempts. Please try again after 15 minutes.",
  },
});

export const forgotPasswordLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // max 3 requests per IP per hour
  message: {
    status: 429,
    success: false,
    message:
      "Too many password reset requests. Please try again later.",
  },
});