import { ApiError } from "../lib/ApiError.js";
import { apiResponse, asyncHandler, clearAuthCookies, getSafeUser, setAuthCookies } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";
import {
    cookieOptions,
    generateRefreshTokenString,
    generateToken,
    hashPassword,
    refreshTokenCookieOptions,
    verifyPassword,
} from "../lib/utils.js";

const JWT_EXPIRATION = process.env.NODE_ENV === "production" ? parseInt(process.env.JWT_EXPIRATION || "7") : 7;

// Register
const register = asyncHandler(async (req, res) => {
    const { name, email, password, roleId } = req.body;
    // Verify required fields
    if (!email || !password) throw new ApiError(400, "Missing required fields");

    // Check if user already exists
    const isExists = await prisma.user.findUnique({ where: { email } });
    if (isExists) throw new ApiError(400, "User already exists");

    // Hash Password
    const hashedPassword = await hashPassword(password);

    // Get default user role from DB
    const defaultRole = await prisma.role.findUnique({
        where: { slug: "user" },
    });

    if (!defaultRole) throw new ApiError(500, "Default user role not found");

    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash: hashedPassword,
            roleId: roleId ?? defaultRole.id,
        },
        include: {
            role: {
                include: {
                    permissions: {
                        select: {
                            permission: true,
                        },
                    },
                },
            },
        },
    });
    if (!user) throw new ApiError(500, "Failed to create user");
    console.log(user);
    // Get SafeUser
    const safeUser = getSafeUser(user);

    // Generate tokens
    const token = generateToken(safeUser);
    const refreshToken = generateRefreshTokenString();
    const tokenHash = await hashPassword(refreshToken);

    await prisma.refreshToken.create({
        data: {
            tokenHash,
            userId: user.id,
            ipHash: req.ip,
            userAgent: req.headers["user-agent"],
            expiresAt: new Date(Date.now() + JWT_EXPIRATION * 24 * 60 * 60 * 1000), // 7 days
        },
    });

    setAuthCookies(res, token, refreshToken, cookieOptions, refreshTokenCookieOptions);
    return apiResponse(res, 201, true, "User created successfully", { user: safeUser });
});

// Login
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Verify required fields
    if (!email || !password) throw new ApiError(400, "Missing required fields");

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            role: {
                include: {
                    permissions: {
                        select: {
                            permission: true,
                        },
                    },
                },
            },
        },
    });

    if (!user) throw new ApiError(401, "User not found");   
    console.log(user)
    // Check if password is correct
    const isPasswordCorrect = await verifyPassword(password, user.passwordHash);

    if (!isPasswordCorrect) throw new ApiError(401, "Invalid credentials, please try again");

    // Get SafeUser
    const safeUser = getSafeUser(user);

    // Generate token
    const token = generateToken(safeUser);

    const refreshToken = generateRefreshTokenString();

    const tokenHash = await hashPassword(refreshToken);

    // Store refreshToken in database
    await prisma.refreshToken.create({
        data: {
            tokenHash,
            userId: user?.id,
            ipHash: req.ip,
            userAgent: req.headers["user-agent"],
            expiresAt: new Date(Date.now() + JWT_EXPIRATION * 24 * 60 * 60 * 1000), // 7 days
        },
    });

    setAuthCookies(res, token, refreshToken, cookieOptions, refreshTokenCookieOptions);
    return apiResponse(res, 200, true, "Login successful", { user: safeUser });
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) throw new ApiError(401, "Refresh token not found");

    const tokens = await prisma.refreshToken.findMany({
        where: {
            expiresAt: { gt: new Date() },
        },
    });

    let matchedToken = null;

    for (const token of tokens) {
        const isMatch = await verifyPassword(refreshToken, token.tokenHash);
        if (isMatch) {
            matchedToken = token;
            break;
        }
    }

    if (!matchedToken) throw new ApiError(403, "Invalid refresh token");

    const user = await prisma.user.findUnique({
        where: { id: matchedToken.userId },
        include: {
            role: {
                include: {
                    permissions: {
                        select: {
                            permission: true,
                        }
                    }
                }
            }
        }
    });

    const safeUser = getSafeUser(user);

    const newAccessToken = generateToken(safeUser);
    const newRefreshToken = generateRefreshTokenString();

    const newHash = await hashPassword(newRefreshToken);

    // delete old refresh token (rotation)
    await prisma.refreshToken.delete({
        where: { id: matchedToken.id },
    });

    // create new refresh token
    await prisma.refreshToken.create({
        data: {
            tokenHash: newHash,
            userId: user.id,
            ipHash: req.ip,
            userAgent: req.headers["user-agent"],
            expiresAt: new Date(Date.now() + JWT_EXPIRATION * 24 * 60 * 60 * 1000),
        },
    });

    setAuthCookies(res, newAccessToken, newRefreshToken, cookieOptions, refreshTokenCookieOptions);

    return apiResponse(res, 200, true, "Token refreshed");
});

// Logout
const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new ApiError(401, "Token not found");
    if (refreshToken) {
        const tokens = await prisma.refreshToken.findMany({
            where: { expiresAt: { gt: new Date() } },
        });

        for (const token of tokens) {
            const isMatch = await verifyPassword(refreshToken, token.tokenHash);

            if (isMatch) {
                await prisma.refreshToken.delete({
                    where: { id: token.id },
                });
                break;
            }
        }
    }

    clearAuthCookies(res);

    return apiResponse(res, 200, true, "Logout successful");
});

// Current user
const currentUser = asyncHandler(async (req, res) => {
    return apiResponse(res, 200, true, "Success", { user: req.user });
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const body = req.body;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) throw new ApiError(404, "User not found");

    // Whitelist allowed fields
    const allowedFields = ["name", "bio", "website", "twitter", "github", "avatarUrl"];

    const updateData = {};

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updateData[field] = body[field];
        }
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No valid fields provided for update");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
            role: {
                include: {
                    permissions: {
                        select: {
                            permission: true,
                        }
                    }
                }
            }
        }
    });

    if (!updatedUser) throw new ApiError(500, "Failed to update user");

    // Get safeUser
    const safeUser = getSafeUser(updatedUser);

    return apiResponse(res, 200, true, "User updated successfully", { user: safeUser });
});

// forget password
const forgetPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new ApiError(404, "User not found");

    // Hash Password
    const hashedPassword = await hashPassword(password);

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash: hashedPassword,
        },
        include: {
            role: {
                include: {
                    permissions: {
                        select: {
                            permission: true,
                        }
                    }
                }
            }
        }
    });
    // Get safeUser
    const safeUser = getSafeUser(updatedUser);
    return apiResponse(res, 200, true, "Password updated", { user: safeUser });
});

// Chnage password
const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Missing required fields");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    const isMatch = await verifyPassword(oldPassword, user.passwordHash);

    if (!isMatch) throw new ApiError(401, "Invalid old password");

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
    });

    await prisma.refreshToken.deleteMany({
        where: { userId },
    });

    return apiResponse(res, 200, true, "Password updated");
});

export { register, login, refreshToken, logout, currentUser, updateUser, forgetPassword, changePassword };
