import { ApiError } from "../lib/ApiError.js";
import { apiResponse, asyncHandler, getSafeUser } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../lib/utils.js";

// GET ALL USERS (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        search,
        role,
        sortBy = "createdAt",
        order = "desc",
        includeStats = "false",
        includePosts = "false",
        postsLimit = 5
    } = req.query;

    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.min(parseInt(limit), 100);
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause
    const where = {};

    // Search by name or email
    if (search) {
        where.OR = [
            {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                email: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    // Filter by role
    if (role) {
        where.role = {
            slug: role,
        };
    }

    // Allowed sort fields
    const allowedSortFields = ["name", "email", "createdAt", "updatedAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    // Build include for stats if requested
    const includeStatsData = includeStats === "true" ? {
        _count: {
            select: {
                posts: true,
                comments: true,
                reactions: true,
                bookmarks: true,
            },
        },
    } : {};

    // Build include for posts if requested
    const includePostsData = includePosts === "true" ? {
        posts: {
            where: {
                deletedAt: null,
                status: "PUBLISHED",
            },
            take: parseInt(postsLimit),
            orderBy: {
                publishedAt: "desc",
            },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                publishedAt: true,
                readingTime: true,
                viewCount: true,
                likeCount: true,
                coverImage: {
                    select: {
                        id: true,
                        url: true,
                    },
                },
            },
        },
    } : {};

    // Run queries in parallel
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: {
                [sortField]: sortOrder,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                bio: true,
                website: true,
                twitter: true,
                github: true,
                createdAt: true,
                updatedAt: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                ...includeStatsData,
                ...includePostsData,
            },
        }),
        prisma.user.count({
            where,
        }),
    ]);

    // Transform users to flatten the structure
    const transformedUsers = users.map((user) => ({
        ...user,
        stats: includeStats === "true" ? {
            posts: user._count?.posts || 0,
            comments: user._count?.comments || 0,
            reactions: user._count?.reactions || 0,
            bookmarks: user._count?.bookmarks || 0,
        } : undefined,
        _count: undefined,
    }));

    const totalPages = Math.ceil(total / pageSize);

    return apiResponse(res, 200, true, "Users fetched successfully", {
        users: transformedUsers,
        pagination: {
            total,
            page: pageNumber,
            limit: pageSize,
            totalPages,
        },
    });
});

// GET SINGLE USER (by ID - Admin or self)
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        includeStats = "true",
        includePosts = "false",
        postsPage = 1,
        postsLimit = 10
    } = req.query;

    const currentUser = req.user;
    const isAdmin = currentUser?.role.toUpperCase() === "ADMIN" || currentUser?.role.toUpperCase() === "EDITOR";
    const isSelf = currentUser?.id === id;

    // Only admin or the user themselves can view full profile
    if (!isAdmin && !isSelf) {
        throw new ApiError(403, "You are not authorized to view this user's profile");
    }

    // Build include for stats
    const includeStatsData = includeStats === "true" ? {
        _count: {
            select: {
                posts: true,
                comments: true,
                reactions: true,
                bookmarks: true,
                medias: true,
            },
        },
    } : {};

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            bio: true,
            website: true,
            twitter: true,
            github: true,
            createdAt: true,
            updatedAt: true,
            role: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    permissions: {
                        select: {
                            permission: {
                                select: {
                                    action: true,
                                    description: true,
                                },
                            },
                        },
                    },
                },
            },
            ...includeStatsData,
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    let postsData = null;

    // Fetch posts if requested
    if (includePosts === "true") {
        const pageNumber = Math.max(parseInt(postsPage), 1);
        const pageSize = Math.min(parseInt(postsLimit), 50);
        const skip = (pageNumber - 1) * pageSize;

        const postWhere = {
            authorId: id,
            deletedAt: null,
        };

        // Non-admins can only see published posts
        if (!isAdmin && !isSelf) {
            postWhere.status = "PUBLISHED";
        }

        const [posts, postsTotal] = await prisma.$transaction([
            prisma.post.findMany({
                where: postWhere,
                skip,
                take: pageSize,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    status: true,
                    publishedAt: true,
                    readingTime: true,
                    wordCount: true,
                    viewCount: true,
                    likeCount: true,
                    commentCount: true,
                    isFeatured: true,
                    isPinned: true,
                    coverImage: {
                        select: {
                            id: true,
                            url: true,
                        },
                    },
                    categories: {
                        select: {
                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.post.count({
                where: postWhere,
            }),
        ]);

        const totalPages = Math.ceil(postsTotal / pageSize);

        postsData = {
            posts,
            pagination: {
                total: postsTotal,
                page: pageNumber,
                limit: pageSize,
                totalPages,
            },
        };
    }

    const response = {
        ...user,
        stats: includeStats === "true" ? {
            posts: user._count?.posts || 0,
            comments: user._count?.comments || 0,
            reactions: user._count?.reactions || 0,
            bookmarks: user._count?.bookmarks || 0,
            medias: user._count?.medias || 0,
        } : undefined,
        _count: undefined,
        ...postsData,
    };

    return apiResponse(res, 200, true, "User fetched successfully", response);
});

// GET USER PUBLIC PROFILE (by ID or slug - Public endpoint)
const getUserPublicProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        includePosts = "true",
        postsPage = 1,
        postsLimit = 10
    } = req.query;

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            website: true,
            twitter: true,
            github: true,
            createdAt: true,
            role: {
                select: {
                    name: true,
                    slug: true,
                },
            },
            _count: {
                select: {
                    posts: {
                        where: {
                            status: "PUBLISHED",
                            deletedAt: null,
                        },
                    },
                    comments: {
                        where: {
                            status: "APPROVED",
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    let postsData = null;

    if (includePosts === "true") {
        const pageNumber = Math.max(parseInt(postsPage), 1);
        const pageSize = Math.min(parseInt(postsLimit), 50);
        const skip = (pageNumber - 1) * pageSize;

        const [posts, postsTotal] = await prisma.$transaction([
            prisma.post.findMany({
                where: {
                    authorId: id,
                    status: "PUBLISHED",
                    deletedAt: null,
                },
                skip,
                take: pageSize,
                orderBy: {
                    publishedAt: "desc",
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    publishedAt: true,
                    readingTime: true,
                    wordCount: true,
                    viewCount: true,
                    likeCount: true,
                    commentCount: true,
                    coverImage: {
                        select: {
                            id: true,
                            url: true,
                        },
                    },
                    categories: {
                        select: {
                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.post.count({
                where: {
                    authorId: id,
                    status: "PUBLISHED",
                    deletedAt: null,
                },
            }),
        ]);

        const totalPages = Math.ceil(postsTotal / pageSize);

        postsData = {
            posts,
            pagination: {
                total: postsTotal,
                page: pageNumber,
                limit: pageSize,
                totalPages,
            },
        };
    }

    return apiResponse(res, 200, true, "User profile fetched successfully", {
        ...user,
        stats: {
            posts: user._count?.posts || 0,
            comments: user._count?.comments || 0,
        },
        _count: undefined,
        ...postsData,
    });
});

// CREATE USER (Admin only)
const createUser = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        roleId,
        bio,
        website,
        twitter,
        github,
        avatarUrl,
    } = req.body;

    // Validation
    if (!name || !email || !password) {
        throw new ApiError(400, "Name, email, and password are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // Validate password strength
    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    // Validate role if provided
    let userRoleId = roleId;
    if (roleId) {
        const role = await prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new ApiError(400, "Invalid role specified");
        }
    } else {
        // Assign default 'user' role
        const defaultRole = await prisma.role.findUnique({
            where: { slug: "user" },
        });
        if (!defaultRole) {
            throw new ApiError(500, "Default role not found");
        }
        userRoleId = defaultRole.id;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            passwordHash: hashedPassword,
            roleId: userRoleId,
            bio: bio?.trim() || null,
            website: website?.trim() || null,
            twitter: twitter?.trim() || null,
            github: github?.trim() || null,
            avatarUrl: avatarUrl?.trim() || null,
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

    const safeUser = getSafeUser(user);

    return apiResponse(res, 201, true, "User created successfully", { user: safeUser });
});

// UPDATE USER (Admin or self)
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        name,
        email,
        bio,
        website,
        twitter,
        github,
        avatarUrl,
        roleId,
    } = req.body;

    const currentUser = req.user;
    const isAdmin = currentUser?.role.toUpperCase() === "ADMIN";
    const isSelf = currentUser?.id === id;

    if (!isAdmin && !isSelf) {
        throw new ApiError(403, "You are not authorized to update this user");
    }

    // Find existing user
    const existingUser = await prisma.user.findUnique({
        where: { id },
    });

    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    const updateData = {};

    // Update name if provided
    if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0) {
            throw new ApiError(400, "Name cannot be empty");
        }
        if (name.trim().length > 100) {
            throw new ApiError(400, "Name must not exceed 100 characters");
        }
        updateData.name = name.trim();
    }

    // Update email if provided (Admin only or self with verification)
    if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ApiError(400, "Invalid email format");
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if email is already taken by another user
        const emailExists = await prisma.user.findFirst({
            where: {
                email: normalizedEmail,
                NOT: {
                    id,
                },
            },
        });

        if (emailExists) {
            throw new ApiError(409, "Email is already in use by another account");
        }

        updateData.email = normalizedEmail;
    }

    // Update profile fields
    if (bio !== undefined) {
        if (bio && bio.length > 500) {
            throw new ApiError(400, "Bio must not exceed 500 characters");
        }
        updateData.bio = bio?.trim() || null;
    }

    if (website !== undefined) {
        if (website) {
            const urlRegex = /^https?:\/\/.+/;
            if (!urlRegex.test(website)) {
                throw new ApiError(400, "Website must be a valid URL starting with http:// or https://");
            }
        }
        updateData.website = website?.trim() || null;
    }

    if (twitter !== undefined) {
        updateData.twitter = twitter?.trim() || null;
    }

    if (github !== undefined) {
        updateData.github = github?.trim() || null;
    }

    if (avatarUrl !== undefined) {
        updateData.avatarUrl = avatarUrl?.trim() || null;
    }

    // Only admins can update role
    if (roleId !== undefined && isAdmin) {
        const role = await prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new ApiError(400, "Invalid role specified");
        }
        updateData.roleId = roleId;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No valid fields provided for update");
    }

    updateData.updatedAt = new Date();

    // Update user
    const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
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

    const safeUser = getSafeUser(updatedUser);

    return apiResponse(res, 200, true, "User updated successfully", { user: safeUser });
});

// UPDATE USER ROLE (Admin only)
const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { roleId } = req.body;

    if (!roleId) {
        throw new ApiError(400, "Role ID is required");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Validate role
    const role = await prisma.role.findUnique({
        where: { id: roleId },
    });

    if (!role) {
        throw new ApiError(400, "Invalid role specified");
    }

    // Prevent changing own role if admin (safety measure)
    const currentUser = req.user;
    if (currentUser.id === id && currentUser.role === "ADMIN") {
        // Optionally add check to prevent admin from removing their own admin status
        // throw new ApiError(400, "Cannot change your own admin role");
    }

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            roleId,
            updatedAt: new Date(),
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

    const safeUser = getSafeUser(updatedUser);

    return apiResponse(res, 200, true, "User role updated successfully", { user: safeUser });
});

// DELETE USER (Admin only or self)
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { force = "false", transferTo } = req.query;

    const currentUser = req.user;
    const isAdmin = currentUser?.role.toUpperCase() === "ADMIN";
    const isSelf = currentUser?.id === id;

    if (!isAdmin && !isSelf) {
        throw new ApiError(403, "You are not authorized to delete this user");
    }

    // Prevent admin from deleting themselves accidentally
    if (isSelf && isAdmin && force !== "true") {
        throw new ApiError(400, "Admin cannot delete their own account without force=true");
    }

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    posts: true,
                    comments: true,
                    medias: true,
                },
            },
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check for associated content
    const hasContent = user._count.posts > 0 || user._count.comments > 0 || user._count.medias > 0;

    if (hasContent && force !== "true" && !transferTo) {
        throw new ApiError(
            400,
            `User has associated content (${user._count.posts} posts, ${user._count.comments} comments, ${user._count.medias} media). Use force=true to delete everything, or provide transferTo=userId to transfer ownership.`
        );
    }

    // Perform deletion in transaction
    await prisma.$transaction(async (tx) => {
        // Transfer ownership if specified
        if (transferTo) {
            const targetUser = await tx.user.findUnique({
                where: { id: transferTo },
            });

            if (!targetUser) {
                throw new ApiError(404, "Target user for transfer not found");
            }

            // Transfer posts
            await tx.post.updateMany({
                where: { authorId: id },
                data: { authorId: transferTo },
            });

            // Transfer comments
            await tx.comment.updateMany({
                where: { authorId: id },
                data: { authorId: transferTo },
            });

            // Transfer media
            await tx.media.updateMany({
                where: { uploadedById: id },
                data: { uploadedById: transferTo },
            });
        } else if (force === "true") {
            // Delete or anonymize user's content
            // Option 1: Delete all posts
            await tx.post.deleteMany({
                where: { authorId: id },
            });

            // Option 2: Anonymize comments (set author to null)
            await tx.comment.updateMany({
                where: { authorId: id },
                data: { authorId: null },
            });

            // Delete media
            await tx.media.deleteMany({
                where: { uploadedById: id },
            });
        }

        // Delete refresh tokens
        await tx.refreshToken.deleteMany({
            where: { userId: id },
        });

        // Delete reactions
        await tx.reaction.deleteMany({
            where: { userId: id },
        });

        // Delete bookmarks
        await tx.bookmark.deleteMany({
            where: { userId: id },
        });

        // Delete newsletter subscriptions
        await tx.newsletterSubscriber.deleteMany({
            where: { userId: id },
        });

        // Delete post revisions
        await tx.postRevision.deleteMany({
            where: { editorId: id },
        });

        // Finally delete the user
        await tx.user.delete({
            where: { id },
        });
    });

    return apiResponse(res, 200, true, "User deleted successfully", {
        deletedUserId: id,
        transferred: !!transferTo,
        transferTarget: transferTo || undefined,
    });
});

// GET USER STATS (Admin or self)
const getUserStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const currentUser = req.user;
    const isAdmin = currentUser?.role.toUpperCase() === "ADMIN" || currentUser?.role.toUpperCase() === "EDITOR";
    const isSelf = currentUser?.id === id;

    if (!isAdmin && !isSelf) {
        throw new ApiError(403, "You are not authorized to view this user's stats");
    }

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    posts: true,
                    comments: true,
                    reactions: true,
                    bookmarks: true,
                    medias: true,
                },
            },
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Get post statistics
    const postStats = await prisma.post.groupBy({
        by: ["status"],
        where: {
            authorId: id,
            deletedAt: null,
        },
        _count: {
            status: true,
        },
    });

    const postStatusCounts = postStats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.status;
        return acc;
    }, {});

    // Get total views across all posts
    const totalViews = await prisma.post.aggregate({
        where: {
            authorId: id,
            deletedAt: null,
        },
        _sum: {
            viewCount: true,
        },
    });

    // Get total likes across all posts
    const totalLikes = await prisma.post.aggregate({
        where: {
            authorId: id,
            deletedAt: null,
        },
        _sum: {
            likeCount: true,
        },
    });

    // Get recent activity
    const recentPosts = await prisma.post.findMany({
        where: {
            authorId: id,
            deletedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
        select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            createdAt: true,
            viewCount: true,
        },
    });

    const recentComments = await prisma.comment.findMany({
        where: {
            authorId: id,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
        select: {
            id: true,
            content: true,
            createdAt: true,
            status: true,
            post: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                },
            },
        },
    });

    return apiResponse(res, 200, true, "User stats fetched successfully", {
        userId: id,
        counts: {
            totalPosts: user._count.posts,
            totalComments: user._count.comments,
            totalReactions: user._count.reactions,
            totalBookmarks: user._count.bookmarks,
            totalMedia: user._count.medias,
        },
        posts: {
            byStatus: postStatusCounts,
            totalViews: totalViews._sum.viewCount || 0,
            totalLikes: totalLikes._sum.likeCount || 0,
        },
        recentActivity: {
            posts: recentPosts,
            comments: recentComments,
        },
    });
});

// BULK UPDATE USERS (Admin only)
const bulkUpdateUsers = asyncHandler(async (req, res) => {
    const { ids, roleId, action } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, "User IDs array is required");
    }

    if (ids.length > 100) {
        throw new ApiError(400, "Cannot process more than 100 users at once");
    }

    const results = {
        success: [],
        failed: [],
    };

    // Validate role if provided
    if (roleId) {
        const role = await prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new ApiError(400, "Invalid role specified");
        }
    }

    for (const userId of ids) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                results.failed.push({ id: userId, reason: "User not found" });
                continue;
            }

            // Prevent changing own admin role in bulk
            const currentUser = req.user;
            if (currentUser.id === userId && currentUser.role === "ADMIN" && roleId) {
                results.failed.push({ id: userId, reason: "Cannot change own admin role in bulk operation" });
                continue;
            }

            const updateData = {};
            if (roleId) updateData.roleId = roleId;
            if (action === "deactivate") {
                // Add deactivate logic if needed
            }

            if (Object.keys(updateData).length > 0) {
                await prisma.user.update({
                    where: { id: userId },
                    data: updateData,
                });
                results.success.push(userId);
            } else {
                results.failed.push({ id: userId, reason: "No valid update data" });
            }
        } catch (error) {
            results.failed.push({ id: userId, reason: error.message });
        }
    }

    return apiResponse(res, 200, true, "Bulk update completed", {
        processed: ids.length,
        success: results.success.length,
        failed: results.failed.length,
        results,
    });
});

// GET USER ACTIVITY LOG (Admin only)
const getUserActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.min(parseInt(limit), 50);
    const skip = (pageNumber - 1) * pageSize;

    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Aggregate recent activity from various sources
    const [recentPosts, recentComments, recentReactions, recentBookmarks] = await Promise.all([
        prisma.post.findMany({
            where: { authorId: id },
            orderBy: { createdAt: "desc" },
            take: pageSize,
            skip,
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                createdAt: true,
                type: true,
            },
        }),
        prisma.comment.findMany({
            where: { authorId: id },
            orderBy: { createdAt: "desc" },
            take: pageSize,
            skip,
            select: {
                id: true,
                content: true,
                createdAt: true,
                status: true,
                post: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
        }),
        prisma.reaction.findMany({
            where: { userId: id },
            orderBy: { createdAt: "desc" },
            take: pageSize,
            skip,
            select: {
                id: true,
                type: true,
                createdAt: true,
                post: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
        }),
        prisma.bookmark.findMany({
            where: { userId: id },
            orderBy: { createdAt: "desc" },
            take: pageSize,
            skip,
            select: {
                id: true,
                createdAt: true,
                post: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
        }),
    ]);

    // Combine and sort all activities
    const activities = [
        ...recentPosts.map((p) => ({ ...p, activityType: "post", target: p.title })),
        ...recentComments.map((c) => ({ ...c, activityType: "comment", target: c.post?.title })),
        ...recentReactions.map((r) => ({ ...r, activityType: "reaction", target: r.post?.title })),
        ...recentBookmarks.map((b) => ({ ...b, activityType: "bookmark", target: b.post?.title })),
    ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, pageSize);

    return apiResponse(res, 200, true, "User activity fetched successfully", {
        activities,
        pagination: {
            page: pageNumber,
            limit: pageSize,
        },
    });
});

// SEARCH USERS (Admin only)
const searchUsers = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
        throw new ApiError(400, "Search query must be at least 2 characters");
    }

    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.min(parseInt(limit), 50);
    const skip = (pageNumber - 1) * pageSize;

    const searchQuery = q.trim();

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: searchQuery,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: searchQuery,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            skip,
            take: pageSize,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
                createdAt: true,
            },
        }),
        prisma.user.count({
            where: {
                OR: [
                    {
                        name: {
                            contains: searchQuery,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: searchQuery,
                            mode: "insensitive",
                        },
                    },
                ],
            },
        }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return apiResponse(res, 200, true, "Search completed", {
        users,
        pagination: {
            total,
            page: pageNumber,
            limit: pageSize,
            totalPages,
        },
    });
});

export {
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
};