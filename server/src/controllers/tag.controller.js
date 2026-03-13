import { ApiError } from "../lib/ApiError.js";
import { apiResponse, asyncHandler } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";
import slugify from "slugify";

// GET ALL TAGS
const getAllTags = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search, 
    sortBy = "postCount", 
    order = "desc",
    includePosts = "false",
    postsLimit = 5
  } = req.query;

  const pageNumber = Math.max(parseInt(page), 1);
  const pageSize = Math.min(parseInt(limit), 100);
  const skip = (pageNumber - 1) * pageSize;

  // Build where clause
  const where = {};

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Allowed sort fields
  const allowedSortFields = ["name", "createdAt", "postCount"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "postCount";
  const sortOrder = order === "asc" ? "asc" : "desc";

  // Build include for posts if requested
  const includePostsData = includePosts === "true" ? {
    posts: {
      take: parseInt(postsLimit),
      orderBy: {
        post: {
          publishedAt: "desc"
        }
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: {
              select: {
                id: true,
                url: true,
              },
            },
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            publishedAt: true,
            readingTime: true,
          },
        },
      },
    },
  } : {};

  const [tags, total] = await prisma.$transaction([
    prisma.tag.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        [sortField]: sortOrder,
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
        ...includePostsData,
      },
    }),
    prisma.tag.count({
      where,
    }),
  ]);

  // Transform tags to flatten the structure
  const transformedTags = tags.map((tag) => ({
    ...tag,
    postCount: tag._count.posts,
    _count: undefined,
    posts: includePosts === "true" 
      ? tag.posts?.map((pt) => pt.post).filter(Boolean) 
      : undefined,
  }));

  const totalPages = Math.ceil(total / pageSize);

  return apiResponse(res, 200, true, "Tags fetched successfully", {
    tags: transformedTags,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
    },
  });
});

// GET SINGLE TAG (by slug)
const getTag = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { 
    includePosts = "true", 
    postsPage = 1, 
    postsLimit = 10,
    postStatus = "PUBLISHED"
  } = req.query;

  // Find tag by slug
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  let postsData = null;

  // Fetch posts if requested
  if (includePosts === "true") {
    const pageNumber = Math.max(parseInt(postsPage), 1);
    const pageSize = Math.min(parseInt(postsLimit), 50);
    const skip = (pageNumber - 1) * pageSize;

    // Build post where clause
    const postWhere = {
      tagId: tag.id,
      post: {
        deletedAt: null,
      },
    };

    // Filter by status if specified
    if (postStatus) {
      postWhere.post.status = postStatus;
    }

    const [postRelations, postsTotal] = await prisma.$transaction([
      prisma.postTag.findMany({
        where: postWhere,
        skip,
        take: pageSize,
        orderBy: {
          post: {
            publishedAt: "desc",
          },
        },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              status: true,
              coverImage: {
                select: {
                  id: true,
                  url: true,
                },
              },
              author: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
              publishedAt: true,
              readingTime: true,
              wordCount: true,
              viewCount: true,
              likeCount: true,
              commentCount: true,
            },
          },
        },
      }),
      prisma.postTag.count({
        where: postWhere,
      }),
    ]);

    const posts = postRelations.map((pr) => pr.post).filter(Boolean);
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
    ...tag,
    postCount: tag._count.posts,
    _count: undefined,
    ...postsData,
  };

  return apiResponse(res, 200, true, "Tag fetched successfully", response);
});

// GET TAG BY ID (Internal/Admin use)
const getTagById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
      posts: {
        select: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        take: 10,
      },
    },
  });

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  return apiResponse(res, 200, true, "Tag fetched successfully", {
    ...tag,
    postCount: tag._count.posts,
    _count: undefined,
    posts: tag.posts?.map((pt) => pt.post).filter(Boolean),
  });
});

// CREATE TAG
const createTag = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Validation
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new ApiError(400, "Tag name is required");
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    throw new ApiError(400, "Tag name must be at least 2 characters");
  }

  if (trimmedName.length > 50) {
    throw new ApiError(400, "Tag name must not exceed 50 characters");
  }

  // Check for duplicate name (case insensitive)
  const existingTag = await prisma.tag.findFirst({
    where: {
      name: {
        equals: trimmedName,
        mode: "insensitive",
      },
    },
  });

  if (existingTag) {
    throw new ApiError(409, "Tag with this name already exists");
  }

  // Generate unique slug
  let slug = slugify(trimmedName, { 
    lower: true, 
    strict: true,
    remove: /[*+~.()\\'"!:@]/g 
  });

  let suffix = 1;
  let existingSlug = await prisma.tag.findUnique({ 
    where: { slug } 
  });

  while (existingSlug) {
    slug = `${slug}-${suffix}`;
    existingSlug = await prisma.tag.findUnique({ 
      where: { slug } 
    });
    suffix++;
  }

  // Create tag
  const tag = await prisma.tag.create({
    data: {
      name: trimmedName,
      slug,
      description: description?.trim() || null,
    },
  });

  return apiResponse(res, 201, true, "Tag created successfully", tag);
});

// BULK CREATE TAGS
const bulkCreateTags = asyncHandler(async (req, res) => {
  const { names } = req.body;

  if (!Array.isArray(names) || names.length === 0) {
    throw new ApiError(400, "Names array is required");
  }

  if (names.length > 100) {
    throw new ApiError(400, "Cannot create more than 100 tags at once");
  }

  // Validate and clean names
  const validNames = [];
  const errors = [];

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.push({ index: i, name, error: "Invalid name" });
      continue;
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length > 50) {
      errors.push({ index: i, name: trimmedName, error: "Name too long (max 50 chars)" });
      continue;
    }

    validNames.push(trimmedName);
  }

  // Check for existing tags
  const existingTags = await prisma.tag.findMany({
    where: {
      name: {
        in: validNames,
        mode: "insensitive",
      },
    },
  });

  const existingNames = existingTags.map((t) => t.name.toLowerCase());
  const newNames = validNames.filter(
    (n) => !existingNames.includes(n.toLowerCase())
  );

  // Create new tags with unique slugs
  const createdTags = [];
  const slugSet = new Set();

  for (const name of newNames) {
    let slug = slugify(name, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()\\'"!:@]/g 
    });

    // Handle slug collisions within this batch
    let uniqueSlug = slug;
    let suffix = 1;
    while (slugSet.has(uniqueSlug)) {
      uniqueSlug = `${slug}-${suffix}`;
      suffix++;
    }
    slugSet.add(uniqueSlug);

    // Check against database
    let existingSlug = await prisma.tag.findUnique({ 
      where: { slug: uniqueSlug } 
    });
    while (existingSlug) {
      uniqueSlug = `${slug}-${suffix}`;
      existingSlug = await prisma.tag.findUnique({ 
        where: { slug: uniqueSlug } 
      });
      suffix++;
    }

    createdTags.push({
      name,
      slug: uniqueSlug,
    });
  }

  // Bulk create
  let result = [];
  if (createdTags.length > 0) {
    result = await prisma.$transaction(
      createdTags.map((tag) =>
        prisma.tag.create({
          data: tag,
        })
      )
    );
  }

  return apiResponse(res, 201, true, "Bulk tag creation completed", {
    created: result,
    existing: existingTags,
    errors,
    summary: {
      requested: names.length,
      created: result.length,
      existing: existingTags.length,
      failed: errors.length,
    },
  });
});

// UPDATE TAG
const updateTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  // Find existing tag
  const existingTag = await prisma.tag.findUnique({
    where: { id },
  });

  if (!existingTag) {
    throw new ApiError(404, "Tag not found");
  }

  const updateData = {};

  // Update name if provided
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new ApiError(400, "Tag name cannot be empty");
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      throw new ApiError(400, "Tag name must be at least 2 characters");
    }

    if (trimmedName.length > 50) {
      throw new ApiError(400, "Tag name must not exceed 50 characters");
    }

    // Check for duplicate name (excluding current tag)
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
        NOT: {
          id,
        },
      },
    });

    if (duplicateTag) {
      throw new ApiError(409, "Tag with this name already exists");
    }

    updateData.name = trimmedName;

    // Regenerate slug if name changed
    if (trimmedName.toLowerCase() !== existingTag.name.toLowerCase()) {
      let slug = slugify(trimmedName, { 
        lower: true, 
        strict: true,
        remove: /[*+~.()\\'"!:@]/g 
      });

      let suffix = 1;
      let existingSlug = await prisma.tag.findFirst({
        where: {
          slug,
          NOT: {
            id,
          },
        },
      });

      while (existingSlug) {
        slug = `${slug}-${suffix}`;
        existingSlug = await prisma.tag.findFirst({
          where: {
            slug,
            NOT: {
              id,
            },
          },
        });
        suffix++;
      }

      updateData.slug = slug;
    }
  }

  // Update description if provided
  if (description !== undefined) {
    updateData.description = description?.trim() || null;
  }

  // Check if there's anything to update
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  // Update tag
  const updatedTag = await prisma.tag.update({
    where: { id },
    data: updateData,
  });

  return apiResponse(res, 200, true, "Tag updated successfully", updatedTag);
});

// MERGE TAGS
const mergeTags = asyncHandler(async (req, res) => {
  const { sourceIds, targetId } = req.body;

  if (!Array.isArray(sourceIds) || sourceIds.length === 0) {
    throw new ApiError(400, "Source tag IDs are required");
  }

  if (!targetId) {
    throw new ApiError(400, "Target tag ID is required");
  }

  if (sourceIds.includes(targetId)) {
    throw new ApiError(400, "Cannot merge a tag into itself");
  }

  // Verify target tag exists
  const targetTag = await prisma.tag.findUnique({
    where: { id: targetId },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  if (!targetTag) {
    throw new ApiError(404, "Target tag not found");
  }

  // Verify all source tags exist
  const sourceTags = await prisma.tag.findMany({
    where: {
      id: {
        in: sourceIds,
      },
    },
    include: {
      posts: {
        select: {
          postId: true,
        },
      },
    },
  });

  if (sourceTags.length !== sourceIds.length) {
    const foundIds = sourceTags.map((t) => t.id);
    const missingIds = sourceIds.filter((id) => !foundIds.includes(id));
    throw new ApiError(404, `Source tags not found: ${missingIds.join(", ")}`);
  }

  // Collect all post relationships from source tags
  const postIdSet = new Set();
  sourceTags.forEach((tag) => {
    tag.posts.forEach((pt) => {
      postIdSet.add(pt.postId);
    });
  });

  // Get existing post relationships of target tag to avoid duplicates
  const existingTargetRelations = await prisma.postTag.findMany({
    where: {
      tagId: targetId,
    },
    select: {
      postId: true,
    },
  });

  const existingTargetPostIds = new Set(
    existingTargetRelations.map((pt) => pt.postId)
  );

  // Filter out posts that already have the target tag
  const newPostIds = Array.from(postIdSet).filter(
    (postId) => !existingTargetPostIds.has(postId)
  );

  // Perform merge in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create new post-tag relationships
    if (newPostIds.length > 0) {
      await tx.postTag.createMany({
        data: newPostIds.map((postId) => ({
          postId,
          tagId: targetId,
        })),
        skipDuplicates: true,
      });
    }

    // Delete post-tag relationships for source tags
    await tx.postTag.deleteMany({
      where: {
        tagId: {
          in: sourceIds,
        },
      },
    });

    // Delete source tags
    await tx.tag.deleteMany({
      where: {
        id: {
          in: sourceIds,
        },
      },
    });

    // Update post count for target tag
    const finalPostCount = await tx.postTag.count({
      where: {
        tagId: targetId,
      },
    });

    const updatedTarget = await tx.tag.update({
      where: { id: targetId },
      data: {
        postCount: finalPostCount,
      },
    });

    return {
      targetTag: updatedTarget,
      mergedPosts: newPostIds.length,
      deletedTags: sourceIds.length,
    };
  });

  return apiResponse(res, 200, true, "Tags merged successfully", {
    ...result,
    sourceTagNames: sourceTags.map((t) => t.name),
    targetTagName: targetTag.name,
  });
});

// DELETE TAG
const deleteTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { force = "false" } = req.query;

  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  const postCount = tag._count.posts;

  // Prevent deletion if tag has posts (unless force=true)
  if (postCount > 0 && force !== "true") {
    throw new ApiError(
      400,
      `Tag has ${postCount} associated posts. Use force=true to delete anyway, or merge tags first.`
    );
  }

  // Delete in transaction
  await prisma.$transaction(async (tx) => {
    // Delete all post-tag relationships first
    if (postCount > 0) {
      await tx.postTag.deleteMany({
        where: {
          tagId: id,
        },
      });
    }

    // Delete the tag
    await tx.tag.delete({
      where: { id },
    });
  });

  return apiResponse(res, 200, true, "Tag deleted successfully", {
    deletedTag: tag,
    wasForced: force === "true" && postCount > 0,
    removedFromPosts: postCount,
  });
});

// GET POPULAR TAGS
const getPopularTags = asyncHandler(async (req, res) => {
  const { limit = 10, minPosts = 1 } = req.query;
  const pageSize = Math.min(parseInt(limit), 50);
  const minimumPosts = parseInt(minPosts);

  const tags = await prisma.tag.findMany({
    where: {
      postCount: {
        gte: minimumPosts,
      },
    },
    orderBy: {
      postCount: "desc",
    },
    take: pageSize,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      postCount: true,
      createdAt: true,
    },
  });

  return apiResponse(res, 200, true, "Popular tags fetched successfully", {
    tags,
    count: tags.length,
  });
});

// GET RELATED TAGS
const getRelatedTags = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { limit = 10 } = req.query;
  const pageSize = Math.min(parseInt(limit), 50);

  // Find the tag
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        select: {
          postId: true,
        },
      },
    },
  });

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  // Get post IDs associated with this tag
  const postIds = tag.posts.map((pt) => pt.postId);

  if (postIds.length === 0) {
    return apiResponse(res, 200, true, "No related tags found", {
      tags: [],
    });
  }

  // Find tags that appear on the same posts
  const relatedTags = await prisma.tag.findMany({
    where: {
      NOT: {
        id: tag.id,
      },
      posts: {
        some: {
          postId: {
            in: postIds,
          },
        },
      },
    },
    take: pageSize,
    orderBy: {
      postCount: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      postCount: true,
    },
  });

  return apiResponse(res, 200, true, "Related tags fetched successfully", {
    tags: relatedTags,
  });
});

// RECALCULATE TAG POST COUNTS
const recalculatePostCounts = asyncHandler(async (req, res) => {
  const { dryRun = "true" } = req.query;
  const isDryRun = dryRun === "true";

  // Get all tags with their actual post counts
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  const updates = [];
  const mismatches = [];

  for (const tag of tags) {
    const actualCount = tag._count.posts;
    
    if (tag.postCount !== actualCount) {
      mismatches.push({
        id: tag.id,
        name: tag.name,
        oldCount: tag.postCount,
        newCount: actualCount,
      });

      if (!isDryRun) {
        updates.push(
          prisma.tag.update({
            where: { id: tag.id },
            data: { postCount: actualCount },
          })
        );
      }
    }
  }

  // Execute updates if not dry run
  if (!isDryRun && updates.length > 0) {
    await prisma.$transaction(updates);
  }

  return apiResponse(res, 200, true, "Post count recalculation completed", {
    mode: isDryRun ? "dry-run" : "applied",
    totalTags: tags.length,
    mismatchesFound: mismatches.length,
    mismatches,
    updated: isDryRun ? 0 : updates.length,
  });
});

// CLEANUP ORPHANED TAGS
const cleanupOrphanedTags = asyncHandler(async (req, res) => {
  const { dryRun = "true" } = req.query;
  const isDryRun = dryRun === "true";

  // Find tags with no posts
  const orphanedTags = await prisma.tag.findMany({
    where: {
      posts: {
        none: {},
      },
    },
  });

  if (orphanedTags.length === 0) {
    return apiResponse(res, 200, true, "No orphaned tags found", {
      deleted: 0,
      tags: [],
    });
  }

  const orphanedIds = orphanedTags.map((t) => t.id);

  if (!isDryRun) {
    await prisma.tag.deleteMany({
      where: {
        id: {
          in: orphanedIds,
        },
      },
    });
  }

  return apiResponse(res, 200, true, "Orphaned tags cleanup completed", {
    mode: isDryRun ? "dry-run" : "deleted",
    count: orphanedTags.length,
    tags: orphanedTags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
    })),
  });
});

export {
  getAllTags,
  getTag,
  getTagById,
  createTag,
  bulkCreateTags,
  updateTag,
  mergeTags,
  deleteTag,
  getPopularTags,
  getRelatedTags,
  recalculatePostCounts,
  cleanupOrphanedTags,
};