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

    if (author.role === "ADMIN" || author.role === "EDITOR") {
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
    const post = await prisma.$transaction(async (tx) => {
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
            },
        });

        return createdPost;
    });

    if (!post) throw new ApiError(500, "Failed to create post");
    return apiResponse(res, 201, true, "Post created", post);
});