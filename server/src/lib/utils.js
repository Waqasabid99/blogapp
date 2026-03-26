import "dotenv/config";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

const JWT_SECRET = process.env.NODE_ENV === "production" ? process.env.JWT_SECRET : "dev_secret_key";
const JWT_EXPIRATION = process.env.NODE_ENV === "production" ? process.env.JWT_EXPIRATION : "7d";
const SALT_ROUNDS = process.env.NODE_ENV === "production" ? parseInt(process.env.SALT_ROUNDS || "10") : 10;

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined in production");
}
// Function to Hash Password 
export async function hashPassword(plainPassword) {
    const hashedPassword = await bcryptjs.hash(plainPassword, SALT_ROUNDS);
    return hashedPassword;
}

// Function to Verify Password
export async function verifyPassword(password, hashedPassword) {
    const isMatch = await bcryptjs.compare(password, hashedPassword);
    return isMatch;
}

// Function to Generate Token 
export function generateToken(payload) {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    return token;
}

// Function to Generate RefreshToken
export function generateRefreshTokenString() {
    const refreshToken = crypto.randomBytes(40).toString("hex");
    return refreshToken;
}

// Function to Verify Token
export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

// Cookie Options for access token
export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "none",
    path: "/",
    maxAge: 15 * 60 * 1000 // 15 minutes
}

// Cookie Options for refresh token
export const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}