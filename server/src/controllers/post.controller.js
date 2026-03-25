import { ApiError } from "../lib/ApiError.js";
import { apiResponse, asyncHandler, generateExcerpt, generateUniqueSlug } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";
import { calculateReadingTime } from "../lib/readingTime.js";

// Create Post
const createPost = asyncHandler(async (req, res) => {
    const author = req?.user;
    const authorId = author?.id;
    const { title, content, coverImageId, categories = [], tags = [], status, excerpt, isFeatured, seriesId, isPinned } = req.body;

    if (!title || !content || !authorId) throw new ApiError(400, "Missing required fields");

    if (!content || !Array.isArray(content.blocks) || content.blocks.length === 0) {
        throw new ApiError(400, "Post content is empty");
    }

    // Generate Excerpt if not provided
    let generatedExcerpt = excerpt;
    if (!generatedExcerpt || generatedExcerpt === "" || generatedExcerpt === null) {
        generatedExcerpt = generateExcerpt(content);
    }

    if (!Array.isArray(categories)) {
        throw new ApiError(400, "Categories must be array");
    }

    // Generate Slug
    const slug = await generateUniqueSlug(title, prisma);
    if (!slug) throw new ApiError(500, "Failed to generate unique slug");

    // Get reading time and word count
    const { readingTime, wordCount } = calculateReadingTime(content);

    // Check if Categories exits
    const existingCategories = await prisma.category.findMany({
        where: {
            id: {
                in: categories,
            },
        },
    });

    if (existingCategories.length !== categories.length) throw new ApiError(400, "One or more categories not found");

    // Check if Tags exits
    const existingTags = await prisma.tag.findMany({
        where: {
            id: {
                in: tags,
            },
        },
    });

    if (existingTags.length !== tags.length) throw new ApiError(400, "One or more tags not found");

    // Check if Series exits
    if (seriesId) {
        const existingSeries = await prisma.series.findUnique({ where: { id: seriesId } });
        if (!existingSeries) throw new ApiError(400, "Series not found");
    }

    const allowedStatuses = ["DRAFT", "PENDING", "APPROVED", "REJECTED", "SCHEDULED", "PUBLISHED"];

    if (status && !allowedStatuses.includes(status)) {
        throw new ApiError(400, "Invalid post status");
    }

    // Generate Status
    let postStatus = "DRAFT";

    if (author.role.toUpperCase() === "WRITER" || author.role.toUpperCase() === "GUEST_WRITER") {
        if (status === "PUBLISHED") {
            throw new ApiError(403, "You don't have permission to publish this post");
        }
    }

    if (author.role.toUpperCase() === "ADMIN" || author.role.toUpperCase() === "EDITOR") {
        postStatus = status ?? "PUBLISHED";
    }

    // Generate Published At
    let publishedAt = null;

    if (postStatus === "PUBLISHED") {
        publishedAt = new Date();
    }

    // Validate Cover Image
    if (coverImageId) {
        const media = await prisma.media.findUnique({
            where: { id: coverImageId },
        });

        if (!media) {
            throw new ApiError(400, "Cover image not found");
        }
    }

    // Create post
    const post = await prisma.$transaction(
        async (tx) => {
            const createdPost = await tx.post.create({
                data: {
                    title,
                    slug,
                    content,
                    excerpt: generatedExcerpt,
                    coverImageId: coverImageId ?? null,
                    authorId,
                    isFeatured: isFeatured ?? false,
                    isPinned: isPinned ?? false,
                    seriesId: seriesId ?? null,
                    readingTime,
                    wordCount,
                    status: postStatus,
                    publishedAt,
                    lockedById: authorId,
                    lockedAt: new Date(),
                    categories: {
                        create: categories.map((categoryId) => ({
                            categoryId,
                        })),
                    },
                    tags: {
                        create: tags.map((tagId) => ({
                            tagId,
                        })),
                    },
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true,
                        },
                    },
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            });

            await tx.postRevision.create({
                data: {
                    postId: createdPost.id,
                    content,
                    editorId: authorId,
                },
            });

            await tx.tag.updateMany({
                where: {
                    id: {
                        in: tags,
                    },
                },
                data: {
                    postCount: {
                        increment: 1,
                    },
                },
            });

            await tx.slugHistory.create({
                data: {
                    postId: createdPost.id,
                    oldSlug: slug,
                },
            });

            await tx.postSEO.create({
                data: {
                    postId: createdPost.id,
                    metaTitle: title,
                    metaDescription: generatedExcerpt,
                    ogImageId: coverImageId ?? null,
                },
            });

            return createdPost;
        },
        { timeout: 10000 }
    );

    if (!post) throw new ApiError(500, "Failed to create post");
    return apiResponse(res, 201, true, "Post created", post);
});

// Update post
const updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { title, content, excerpt, coverImageId, categories = [], tags = [], status, seriesId } = req.body;

    const authorId = req.user.id;

    const existingPost = await prisma.post.findUnique({
        where: { id, deletedAt: null },
        include: {
            tags: true,
            categories: true,
        },
    });

    if (!existingPost) {
        throw new ApiError(404, "Post not found");
    }

    const result = await prisma.$transaction(async (tx) => {
        let slug = existingPost.slug;

        // Generate new slug if title changed
        if (title && title !== existingPost.title) {
            await tx.slugHistory.create({
                data: {
                    postId: id,
                    oldSlug: existingPost.slug,
                },
            });

            slug = await generateUniqueSlug(title, prisma);
        }

        let generatedExcerpt = excerpt;

        if (!generatedExcerpt && content) {
            generatedExcerpt = generateExcerpt(content);
        }

        let readingTime = existingPost.readingTime;
        let wordCount = existingPost.wordCount;

        if (content) {
            const calc = calculateReadingTime(content);
            readingTime = calc.readingTime;
            wordCount = calc.wordCount;
        }

        // CATEGORY UPDATE
        if (categories.length) {
            await tx.postCategory.deleteMany({
                where: { postId: id },
            });

            await tx.postCategory.createMany({
                data: categories.map((categoryId) => ({
                    postId: id,
                    categoryId,
                })),
            });
        }

        // TAG UPDATE
        const oldTagIds = existingPost.tags.map((t) => t.tagId);

        const tagsToAdd = tags.filter((t) => !oldTagIds.includes(t));
        const tagsToRemove = oldTagIds.filter((t) => !tags.includes(t));

        if (tags.length) {
            await tx.postTag.deleteMany({
                where: { postId: id },
            });

            await tx.postTag.createMany({
                data: tags.map((tagId) => ({
                    postId: id,
                    tagId,
                })),
            });

            if (tagsToAdd.length) {
                await tx.tag.updateMany({
                    where: { id: { in: tagsToAdd } },
                    data: { postCount: { increment: 1 } },
                });
            }

            if (tagsToRemove.length) {
                await tx.tag.updateMany({
                    where: { id: { in: tagsToRemove } },
                    data: { postCount: { decrement: 1 } },
                });
            }
        }

        // CREATE REVISION
        if (content) {
            await tx.postRevision.create({
                data: {
                    postId: id,
                    content,
                    editorId: authorId,
                },
            });
        }

        const updatedPost = await tx.post.update({
            where: { id },
            data: {
                title,
                slug,
                content,
                excerpt: generatedExcerpt,
                coverImageId,
                seriesId,
                status,
                readingTime,
                wordCount,
            },
        });

        return updatedPost;
    });

    return apiResponse(res, 200, true, "Post updated", result);
});

// Delete post
const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const post = await prisma.post.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: {
            tags: true,
        },
    });

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const tagIds = post.tags.map((t) => t.tagId);

    const deletedPost = await prisma.$transaction(async (tx) => {
        // decrement tag counters
        if (tagIds.length) {
            await tx.tag.updateMany({
                where: {
                    id: { in: tagIds },
                },
                data: {
                    postCount: {
                        decrement: 1,
                    },
                },
            });
        }

        const updated = await tx.post.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });

        return updated;
    });

    return apiResponse(res, 200, true, "Post deleted", deletedPost);
});

// Get all posts
const getAllPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status, category, tag, author, featured, pinned, sortBy = "createdAt", order = "desc" } = req.query;

    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.min(parseInt(limit), 50);

    const skip = (pageNumber - 1) * pageSize;

    // BUILD FILTERS

    const where = {
        deletedAt: null,
    };

    // Status filter
    if (status) {
        where.status = status;
    }

    // Author filter
    if (author) {
        where.authorId = author;
    }

    // Featured
    if (featured === "true") {
        where.isFeatured = true;
    }

    // Pinned
    if (pinned === "true") {
        where.isPinned = true;
    }

    // Search (title + excerpt)
    if (search) {
        where.OR = [
            {
                title: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                excerpt: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    // Category filter
    if (category) {
        where.categories = {
            some: {
                categoryId: category,
            },
        };
    }

    // Tag filter
    if (tag) {
        where.tags = {
            some: {
                tagId: tag,
            },
        };
    }

    // SORTING

    const allowedSortFields = ["createdAt", "updatedAt", "publishedAt", "readingTime", "wordCount", "title"];

    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const sortOrder = order === "asc" ? "asc" : "desc";

    // QUERY

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: {
                [sortField]: sortOrder,
            },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                status: true,
                readingTime: true,
                wordCount: true,
                isFeatured: true,
                isPinned: true,
                publishedAt: true,
                createdAt: true,

                coverImage: {
                    select: {
                        id: true,
                        url: true,
                        altText: true,
                        width: true,
                        height: true,
                    },
                },

                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
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

                tags: {
                    select: {
                        tag: {
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
            where,
        }),
    ]);

    // PAGINATION META

    const totalPages = Math.ceil(total / pageSize);

    return apiResponse(res, 200, true, "Posts fetched", {
        posts,
        pagination: {
            total,
            page: pageNumber,
            limit: pageSize,
            totalPages,
        },
    });
});

// Get Own posts
const getOwnPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status, category, tag, author, featured, pinned, sortBy = "createdAt", order = "desc" } = req.query;
    const userId = req.user?.id;
    const pageNumber = Math.max(parseInt(page), 1);
    const pageSize = Math.min(parseInt(limit), 50);

    const skip = (pageNumber - 1) * pageSize;

    // BUILD FILTERS

    const where = {
        authorId: userId,
        deletedAt: null,
    };

    // Status filter
    if (status) {
        where.status = status;
    }

    // Author filter
    if (author) {
        where.authorId = author;
    }

    // Featured
    if (featured === "true") {
        where.isFeatured = true;
    }

    // Pinned
    if (pinned === "true") {
        where.isPinned = true;
    }

    // Search (title + excerpt)
    if (search) {
        where.OR = [
            {
                title: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                excerpt: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    // Category filter
    if (category) {
        where.categories = {
            some: {
                categoryId: category,
            },
        };
    }

    // Tag filter
    if (tag) {
        where.tags = {
            some: {
                tagId: tag,
            },
        };
    }

    // SORTING

    const allowedSortFields = ["createdAt", "updatedAt", "publishedAt", "readingTime", "wordCount", "title"];

    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const sortOrder = order === "asc" ? "asc" : "desc";

    // QUERY

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: {
                [sortField]: sortOrder,
            },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                status: true,
                readingTime: true,
                wordCount: true,
                isFeatured: true,
                isPinned: true,
                publishedAt: true,
                createdAt: true,

                coverImage: {
                    select: {
                        id: true,
                        url: true,
                        altText: true,
                        width: true,
                        height: true,
                    },
                },

                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
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

                tags: {
                    select: {
                        tag: {
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
            where,
        }),
    ]);

    // PAGINATION META

    const totalPages = Math.ceil(total / pageSize);

    return apiResponse(res, 200, true, "Posts fetched", {
        posts,
        pagination: {
            total,
            page: pageNumber,
            limit: pageSize,
            totalPages,
        },
    });
});

// Get single post
const getSinglePost = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const user = req.user;
    // FIND POST
    let post = await prisma.post.findFirst({
        where: {
            categories: {
                some: {
                    category: {
                        slug,
                    },
                },
            },
            deletedAt: null,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    bio: true,
                },
            },

            coverImage: {
                select: {
                    id: true,
                    url: true,
                    altText: true,
                    width: true,
                    height: true,
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

            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },

            series: true,
            seo: true,
        },
    });

    // HANDLE OLD SLUG REDIRECT

    if (!post) {
        const slugHistory = await prisma.slugHistory.findFirst({
            where: {
                oldSlug: slug,
            },
        });

        if (slugHistory) {
            const newPost = await prisma.post.findUnique({
                where: {
                    id: slugHistory.postId,
                },
                select: {
                    slug: true,
                },
            });

            return apiResponse(res, 301, true, "Slug updated", {
                redirect: `/posts/${newPost.slug}`,
            });
        }

        throw new ApiError(404, "Post not found");
    }

    // STATUS VISIBILITY RULES
    const isAuthor = user && user.id === post.authorId;
    const isAdmin = user && (user.role.toUpperCase() === "ADMIN" || user.role.toUpperCase() === "EDITOR");

    if (post.status !== "PUBLISHED" && !isAuthor && !isAdmin) {
        throw new ApiError(403, "You are not allowed to view this post");
    }

    // INCREMENT VIEW COUNT

    await prisma.post.update({
        where: { id: post.id },
        data: {
            viewCount: {
                increment: 1,
            },
        },
    });

    // RESPONSE

    return apiResponse(res, 200, true, "Post fetched", post);
});

// Get single post
const getSinglePostById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    // FIND POST
    let post = await prisma.post.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    bio: true,
                },
            },

            coverImage: {
                select: {
                    id: true,
                    url: true,
                    altText: true,
                    width: true,
                    height: true,
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

            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },

            series: true,
            seo: true,
        },
    });

    // HANDLE OLD SLUG REDIRECT

    // if (!post) {
    //     const slugHistory = await prisma.slugHistory.findFirst({
    //         where: {
    //             oldSlug: slug,
    //         },
    //     });

    //     if (slugHistory) {
    //         const newPost = await prisma.post.findUnique({
    //             where: {
    //                 id: slugHistory.postId,
    //             },
    //             select: {
    //                 slug: true,
    //             },
    //         });

    //         return apiResponse(res, 301, true, "Slug updated", {
    //             redirect: `/posts/${newPost.slug}`,
    //         });
    //     }

    //     throw new ApiError(404, "Post not found");
    // }

    // STATUS VISIBILITY RULES

    const isAuthor = user && user.id === post.authorId;
    const isAdmin = user && (user.role.toUpperCase() === "ADMIN" || user.role.toUpperCase() === "EDITOR");

    if (post.status !== "PUBLISHED" && !isAuthor && !isAdmin) {
        throw new ApiError(403, "You are not allowed to view this post");
    }

    // INCREMENT VIEW COUNT

    await prisma.post.update({
        where: { id: post.id },
        data: {
            viewCount: {
                increment: 1,
            },
        },
    });

    // RESPONSE

    return apiResponse(res, 200, true, "Post fetched", post);
});

// Get related posts
const getRelatedPosts = asyncHandler(async (req, res) => {
    const { categoryId, excludeId, limit } = req.body;

    const posts = await prisma.post.findMany({
        where: {
            categories: {
                some: {
                    categoryId,
                },
            },
            id: {
                not: excludeId,
            },
            deletedAt: null,
            status: "PUBLISHED",
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    bio: true,
                },
            },

            coverImage: {
                select: {
                    id: true,
                    url: true,
                    altText: true,
                    width: true,
                    height: true,
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

            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },

            series: true,
            seo: true,
        },
        take: limit,
    });
    if (!posts) {
        throw new ApiError(404, "No related posts found");
    }

    return apiResponse(res, 200, true, "Related posts fetched", posts);
});

// Get published posts
const getPublishedPosts = asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        where: {
            status: "PUBLISHED",
            deletedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    bio: true,
                },
            },

            coverImage: {
                select: {
                    id: true,
                    url: true,
                    altText: true,
                    width: true,
                    height: true,
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

            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },

            series: true,
            seo: true,
        },
    });
    if (!posts) {
        throw new ApiError(404, "No related posts found");
    }

    return apiResponse(res, 200, true, "Published posts fetched", posts);
});

// Get latest posts
const getLatestPosts = asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        where: {
            status: "PUBLISHED",
            deletedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    bio: true,
                },
            },

            coverImage: {
                select: {
                    id: true,
                    url: true,
                    altText: true,
                    width: true,
                    height: true,
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

            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },

            series: true,
            seo: true,
        },
        take: 5,
    });
    if (!posts) {
        throw new ApiError(404, "No related posts found");
    }

    return apiResponse(res, 200, true, "Latest posts fetched", posts);
});

// Get Featured posts
const getFeaturedPosts = asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        where: {
            status: "PUBLISHED",
            isFeatured: true,
            deletedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    bio: true,
                },
            },

            coverImage: {
                select: {
                    id: true,
                    url: true,
                    altText: true,
                    width: true,
                    height: true,
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

            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },

            series: true,
            seo: true,
        },
    });
    if (!posts) {
        throw new ApiError(404, "No related posts found");
    }

    return apiResponse(res, 200, true, "Featured posts fetched", posts);
});

// Get pinned posts
const getPinnedPosts = asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        where: {
            status: "PUBLISHED",
            isPinned: true,
            deletedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    bio: true,
                },
            },

            coverImage: {
                select: {
                    id: true,
                    url: true,
                    altText: true,
                    width: true,
                    height: true,
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

            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },

            series: true,
            seo: true,
        },
    });
    if (!posts) {
        throw new ApiError(404, "No related posts found");
    }

    return apiResponse(res, 200, true, "Pinned posts fetched", posts);
});

// Get trending posts
const getTrendingPosts = asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        where: {
            status: "PUBLISHED",
            deletedAt: null,
        },
        include: {
            _count: {
                select: {
                    views: {
                        where: {
                            createdAt: {
                                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                            },
                        },
                    },
                },
            },
            author: true,
            coverImage: {
                select: {
                    id: true,
                    url: true,
                    altText: true,
                    width: true,
                    height: true,
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

            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },

            series: true,
            seo: true,
        },
        orderBy: {
            views: {
                _count: "desc",
            },
        },
    });
    if (!posts) {
        throw new ApiError(404, "No related posts found");
    }

    return apiResponse(res, 200, true, "Trending posts fetched", {
        posts,
        count: posts.length,
    });
});

// Get popular posts
const getPopularPosts = asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        where: {
            status: "PUBLISHED",
            deletedAt: null,
        },
        orderBy: {
            popularityScore: "desc",
        },
        take: 10,
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    bio: true,
                },
            },
            coverImage: {
                select: {
                    id: true,
                    url: true,
                    altText: true,
                    width: true,
                    height: true,
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

            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },

            series: true,
            seo: true,
        },
    });
    if (!posts) {
        throw new ApiError(404, "No related posts found");
    }

    return apiResponse(res, 200, true, "Popular posts fetched", posts);
});

// Get Post by category
const getPostsByCategory = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;
    if (!slug) {
        throw new ApiError(400, "Slug is required");
    }
    const skip = (page - 1) * limit;
    const posts = await prisma.post.findMany({
        where: {
            categories: {
                some: {
                    category: {
                        slug: slug,
                    },
                },
            },
            status: "PUBLISHED",
            deletedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            author: true,
            coverImage: {
                select: {
                    id: true,
                    url: true,
                    altText: true,
                    width: true,
                    height: true,
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

            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },

            series: true,
            seo: true,
        },
        skip,
        take: limit,
    });

    if (posts.length === 0) return apiResponse(res, 404, false, "No related posts found", []);

    return apiResponse(res, 200, true, "Posts fetched", {
        posts,
        pagination: {
            page,
            limit,
            total: posts.length,
            totalPages: Math.ceil(posts.length / limit),
        },
    });
})

export {
    createPost,
    updatePost,
    deletePost,
    getAllPosts,
    getSinglePost,
    getSinglePostById,
    getRelatedPosts,
    getPublishedPosts,
    getLatestPosts,
    getFeaturedPosts,
    getPinnedPosts,
    getPopularPosts,
    getTrendingPosts,
    getPostsByCategory,
    getOwnPosts
};