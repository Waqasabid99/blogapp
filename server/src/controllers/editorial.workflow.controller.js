import { ApiError } from "../lib/ApiError.js";
import { asyncHandler } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";

// Submit for review
const submitForReview = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const user = req.user;

  // FIND POST

  const post = await prisma.post.findFirst({
    where: {
      id,
      deletedAt: null
    },
    include: {
      categories: true,
      tags: true
    }
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // PERMISSION CHECK

  const isAuthor = user.id === post.authorId;
  const isAdmin = user.role === "ADMIN";
  const isEditor = user.role === "EDITOR";

  if (!isAuthor && !isAdmin && !isEditor) {
    throw new ApiError(403, "You are not allowed to submit this post for review");
  }

  // WORKFLOW VALIDATION

  if (post.status !== "DRAFT" && post.status !== "REJECTED") {
    throw new ApiError(
      400,
      "Only draft or rejected posts can be submitted for review"
    );
  }

  // BASIC CONTENT VALIDATION

  if (!post.title) {
    throw new ApiError(400, "Post title is required before submitting");
  }

  if (!post.content || !Array.isArray(post.content.blocks) || post.content.blocks.length === 0) {
    throw new ApiError(400, "Post content is empty");
  }

  if (!post.categories.length) {
    throw new ApiError(400, "Post must have at least one category");
  }

  // LOCK CHECK

  if (post.lockedById && post.lockedById !== user.id) {
    throw new ApiError(423, "Post is currently being edited by another user");
  }

  // SUBMIT TRANSACTION

  const submittedPost = await prisma.$transaction(async (tx) => {

    const updatedPost = await tx.post.update({
      where: { id },
      data: {
        status: "PENDING",

        // unlock when submitted
        lockedById: null,
        lockedAt: null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return updatedPost;
  });

  // RESPONSE

  return apiResponse(
    res,
    200,
    true,
    "Post submitted for review successfully",
    submittedPost
  );

});

// Approve Post
const approvePost = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const user = req.user;

  // PERMISSION CHECK

  const isAdmin = user.role === "ADMIN";
  const isEditor = user.role === "EDITOR";

  if (!isAdmin && !isEditor) {
    throw new ApiError(403, "Only editors or admins can approve posts");
  }

  // FIND POST

  const post = await prisma.post.findFirst({
    where: {
      id,
      deletedAt: null
    },
    include: {
      categories: true,
      tags: true,
      author: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // WORKFLOW VALIDATION

  if (post.status !== "PENDING") {
    throw new ApiError(400, "Only pending posts can be approved");
  }

  // CONTENT VALIDATION

  if (!post.title) {
    throw new ApiError(400, "Post title is missing");
  }

  if (!post.content || !Array.isArray(post.content.blocks) || post.content.blocks.length === 0) {
    throw new ApiError(400, "Post content is empty");
  }

  // CATEGORY VALIDATION

  if (!post.categories.length) {
    throw new ApiError(400, "Post must have at least one category");
  }

  // LOCK CHECK

  if (post.lockedById && post.lockedById !== user.id) {
    throw new ApiError(423, "Post is currently locked by another editor");
  }

  // APPROVAL TRANSACTION

  const approvedPost = await prisma.$transaction(async (tx) => {

    const updatedPost = await tx.post.update({
      where: { id },
      data: {
        status: "APPROVED",

        // unlock the post after approval
        lockedById: null,
        lockedAt: null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },

        categories: {
          include: {
            category: true
          }
        },

        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return updatedPost;
  });

  // RESPONSE

  return apiResponse(res, 200, true, "Post approved successfully", approvedPost);

});

// Reject Post 
const rejectPost = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { reason } = req.body;
  const user = req.user;

  // PERMISSION CHECK

  const isAdmin = user.role === "ADMIN";
  const isEditor = user.role === "EDITOR";

  if (!isAdmin && !isEditor) {
    throw new ApiError(403, "Only editors or admins can reject posts");
  }

  // FIND POST

  const post = await prisma.post.findFirst({
    where: {
      id,
      deletedAt: null
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // WORKFLOW VALIDATION

  if (post.status !== "PENDING") {
    throw new ApiError(400, "Only pending posts can be rejected");
  }

  // LOCK CHECK

  if (post.lockedById && post.lockedById !== user.id) {
    throw new ApiError(423, "Post is currently locked by another editor");
  }

  // REJECT TRANSACTION

  const rejectedPost = await prisma.$transaction(async (tx) => {

    const updatedPost = await tx.post.update({
      where: { id },
      data: {
        status: "REJECTED",

        // optional feedback
        rejectionReason: reason ?? null,

        // unlock the post
        lockedById: null,
        lockedAt: null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },

        categories: {
          include: {
            category: true
          }
        },

        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return updatedPost;
  });

  // RESPONSE

  return apiResponse(res, 200, true, "Post rejected successfully", rejectedPost);

});

const schedulePost = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { publishAt } = req.body;
  const user = req.user;

  // VALIDATE DATE

  if (!publishAt) {
    throw new ApiError(400, "Publish date is required");
  }

  const publishDate = new Date(publishAt);

  if (isNaN(publishDate.getTime())) {
    throw new ApiError(400, "Invalid publish date");
  }

  if (publishDate <= new Date()) {
    throw new ApiError(400, "Publish date must be in the future");
  }

  // PERMISSION CHECK

  const isAdmin = user.role === "ADMIN";
  const isEditor = user.role === "EDITOR";

  if (!isAdmin && !isEditor) {
    throw new ApiError(403, "Only editors or admins can schedule posts");
  }

  // FIND POST

  const post = await prisma.post.findFirst({
    where: {
      id,
      deletedAt: null
    },
    include: {
      categories: true,
      tags: true
    }
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // WORKFLOW VALIDATION

  if (post.status !== "APPROVED") {
    throw new ApiError(400, "Only approved posts can be scheduled");
  }

  // LOCK CHECK

  if (post.lockedById && post.lockedById !== user.id) {
    throw new ApiError(423, "Post is currently locked by another editor");
  }

  // SCHEDULE TRANSACTION

  const scheduledPost = await prisma.$transaction(async (tx) => {

    const updatedPost = await tx.post.update({
      where: { id },
      data: {
        status: "SCHEDULED",
        publishedAt: publishDate,

        // clear editing lock
        lockedById: null,
        lockedAt: null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return updatedPost;
  });

  // RESPONSE

  return apiResponse(
    res,
    200,
    true,
    "Post scheduled successfully",
    scheduledPost
  );

});

// Publish post
const publishPost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = req.user;

      // FIND POST
  
    const post = await prisma.post.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: {
            categories: true,
            tags: true,
        },
    });

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

      // PERMISSION CHECK
  
    const isAdmin = user.role === "ADMIN";
    const isEditor = user.role === "EDITOR";
    const isAuthor = user.id === post.authorId;

    if (!isAdmin && !isEditor && !isAuthor) {
        throw new ApiError(403, "You are not allowed to publish this post");
    }

      // VALIDATE POST CONTENT
  
    if (!post.title) {
        throw new ApiError(400, "Post title is missing");
    }

    if (!post.content || !Array.isArray(post.content.blocks) || post.content.blocks.length === 0) {
        throw new ApiError(400, "Post content is empty");
    }

      // VALIDATE CATEGORIES
  
    if (!post.categories.length) {
        throw new ApiError(400, "Post must have at least one category");
    }

      // VALIDATE COVER IMAGE
  
    if (!post.coverImageId) {
        throw new ApiError(400, "Cover image is required before publishing");
    }

      // PREVENT DOUBLE PUBLISH
  
    if (post.status === "PUBLISHED") {
        throw new ApiError(400, "Post is already published");
    }

      // LOCK CHECK
  
    if (post.lockedById && post.lockedById !== user.id) {
        throw new ApiError(423, "Post is currently being edited by another user");
    }

      // PUBLISH TRANSACTION
  
    const publishedPost = await prisma.$transaction(async (tx) => {
        const updatedPost = await tx.post.update({
            where: { id },
            data: {
                status: "PUBLISHED",
                publishedAt: new Date(),

                lockedById: null,
                lockedAt: null,
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

        return updatedPost;
    });

      // RESPONSE
  
    return apiResponse(res, 200, true, "Post published successfully", publishedPost);
});

export {
    submitForReview,
    approvePost,
    rejectPost,
    schedulePost,
    publishPost
}