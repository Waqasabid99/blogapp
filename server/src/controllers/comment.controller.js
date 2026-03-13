import { ApiError } from "../lib/ApiError.js";
import { apiResponse, asyncHandler } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";

// CREATE COMMENT / REPLY
const createComment = asyncHandler(async (req, res) => {
  const user = req.user;
  const authorId = user?.id;

  const { postId, content, parentId } = req.body;

  if (!postId || !content) {
    throw new ApiError(400, "PostId and content are required");
  }

  if (content.length > 2000) {
    throw new ApiError(400, "Comment too long");
  }

  // Check post
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      deletedAt: null,
      status: "PUBLISHED",
    },
  });

  if (!post) {
    throw new ApiError(404, "Post not found or not published");
  }

  let parentComment = null;

  // Handle replies
  if (parentId) {
    parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
    });

    if (!parentComment) {
      throw new ApiError(404, "Parent comment not found");
    }

    if (parentComment.postId !== postId) {
      throw new ApiError(400, "Invalid reply target");
    }
  }

  const comment = await prisma.$transaction(async (tx) => {
    const newComment = await tx.comment.create({
      data: {
        content,
        postId,
        parentId: parentId ?? null,
        authorId: authorId ?? null,
        status: authorId ? "APPROVED" : "PENDING",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (newComment.status === "APPROVED") {
      await tx.post.update({
        where: { id: postId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });
    }

    return newComment;
  });

  return apiResponse(res, 201, true, "Comment created", comment);
});

// GET POST COMMENTS (NESTED)
const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const { page = 1, limit = 20 } = req.query;

  const pageNumber = Math.max(parseInt(page), 1);
  const pageSize = Math.min(parseInt(limit), 50);

  const skip = (pageNumber - 1) * pageSize;

  const [comments, total] = await prisma.$transaction([
    prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
        status: "APPROVED",
      },

      skip,
      take: pageSize,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },

        replies: {
          where: {
            status: "APPROVED",
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    }),

    prisma.comment.count({
      where: {
        postId,
        parentId: null,
        status: "APPROVED",
      },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return apiResponse(res, 200, true, "Comments fetched", {
    comments,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
    },
  });
});

// UPDATE COMMENT
const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const userId = req.user.id;

  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content required");
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.authorId !== userId) {
    throw new ApiError(403, "You cannot edit this comment");
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: {
      content,
    },
  });

  return apiResponse(res, 200, true, "Comment updated", updated);
});

// DELETE COMMENT
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const isOwner = comment.authorId === user.id;
  const isAdmin = user.role === "ADMIN" || user.role === "EDITOR";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You cannot delete this comment");
  }

  await prisma.$transaction(async (tx) => {
    await tx.comment.delete({
      where: { id },
    });

    if (comment.status === "APPROVED") {
      await tx.post.update({
        where: { id: comment.postId },
        data: {
          commentCount: {
            decrement: 1,
          },
        },
      });
    }
  });

  return apiResponse(res, 200, true, "Comment deleted");
});

// MODERATE COMMENT (ADMIN / EDITOR)
const moderateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["APPROVED", "REJECTED", "SPAM"];

  if (!allowed.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.comment.update({
      where: { id },
      data: {
        status,
      },
    });

    if (status === "APPROVED" && comment.status !== "APPROVED") {
      await tx.post.update({
        where: { id: comment.postId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });
    }

    if (status !== "APPROVED" && comment.status === "APPROVED") {
      await tx.post.update({
        where: { id: comment.postId },
        data: {
          commentCount: {
            decrement: 1,
          },
        },
      });
    }

    return updated;
  });

  return apiResponse(res, 200, true, "Comment moderated", result);
});

// GET PENDING COMMENTS (ADMIN)
const getPendingComments = asyncHandler(async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: {
      status: "PENDING",
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
        },
      },

      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return apiResponse(res, 200, true, "Pending comments fetched", comments);
});

export {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  moderateComment,
  getPendingComments,
};