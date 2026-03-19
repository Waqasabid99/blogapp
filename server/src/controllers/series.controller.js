import { ApiError } from "../lib/ApiError.js";
import { apiResponse, asyncHandler } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";
import slugify from "slugify";

// CREATE SERIES
const createSeries = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  // Generate unique slug
  let slug = slugify(title, { lower: true, strict: true });

  let suffix = 1;
  let existing = await prisma.series.findUnique({ where: { slug } });

  while (existing) {
    slug = `${slug}-${suffix}`;
    existing = await prisma.series.findUnique({ where: { slug } });
    suffix++;
  }

  const series = await prisma.series.create({
    data: {
      title,
      slug,
      description: description ?? null,
    },
  });

  return apiResponse(res, 201, true, "Series created", series);
});

// UPDATE SERIES
const updateSeries = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const series = await prisma.series.findUnique({
    where: { id },
  });

  if (!series) {
    throw new ApiError(404, "Series not found");
  }

  const updateData = {};

  if (title) {
    updateData.title = title;

    let slug = slugify(title, { lower: true, strict: true });

    let suffix = 1;
    let existing = await prisma.series.findUnique({ where: { slug } });

    while (existing && existing.id !== id) {
      slug = `${slug}-${suffix}`;
      existing = await prisma.series.findUnique({ where: { slug } });
      suffix++;
    }

    updateData.slug = slug;
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No valid fields to update");
  }

  const updated = await prisma.series.update({
    where: { id },
    data: updateData,
  });

  return apiResponse(res, 200, true, "Series updated", updated);
});

// DELETE SERIES
const deleteSeries = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const series = await prisma.series.findUnique({
    where: { id },
    include: {
      posts: {
        select: { id: true },
      },
    },
  });

  if (!series) {
    throw new ApiError(404, "Series not found");
  }

  if (series.posts.length > 0) {
    throw new ApiError(
      400,
      "Cannot delete series with posts. Remove posts first."
    );
  }

  await prisma.series.delete({
    where: { id },
  });

  return apiResponse(res, 200, true, "Series deleted");
});

// GET ALL SERIES
const getAllSeries = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const pageNumber = Math.max(parseInt(page), 1);
  const pageSize = Math.min(parseInt(limit), 50);

  const skip = (pageNumber - 1) * pageSize;

  const where = {};

  if (search) {
    where.OR = [
      {
        title: {
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

  const allowedSort = ["createdAt", "title"];

  const sortField = allowedSort.includes(sortBy)
    ? sortBy
    : "createdAt";

  const sortOrder = order === "asc" ? "asc" : "desc";

  const [series, total] = await Promise.all([
    prisma.series.findMany({
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
        description: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    }),

    prisma.series.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return apiResponse(res, 200, true, "Series fetched", {
    series,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
    },
  });
});

// GET SINGLE SERIES WITH POSTS
const getSeries = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const series = await prisma.series.findUnique({
    where: { slug },

    include: {
      posts: {
        where: {
          status: "PUBLISHED",
          deletedAt: null,
        },

        orderBy: {
          publishedAt: "asc",
        },

        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          readingTime: true,

          coverImage: {
            select: {
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
        },
      },
    },
  });

  if (!series) {
    throw new ApiError(404, "Series not found");
  }

  return apiResponse(res, 200, true, "Series fetched", series);
});

// ADD POST TO SERIES
const addPostToSeries = asyncHandler(async (req, res) => {
  const { seriesId, postId } = req.body;

  if (!seriesId || !postId) {
    throw new ApiError(400, "SeriesId and PostId required");
  }

  const [series, post] = await Promise.all([
    prisma.series.findUnique({ where: { id: seriesId } }),
    prisma.post.findUnique({ where: { id: postId } }),
  ]);

  if (!series) throw new ApiError(404, "Series not found");
  if (!post) throw new ApiError(404, "Post not found");

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      seriesId,
    },
  });

  return apiResponse(res, 200, true, "Post added to series", updated);
});

// REMOVE POST FROM SERIES
const removePostFromSeries = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) throw new ApiError(404, "Post not found");

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      seriesId: null,
    },
  });

  return apiResponse(res, 200, true, "Post removed from series", updated);
});

export {
  createSeries,
  updateSeries,
  deleteSeries,
  getAllSeries,
  getSeries,
  addPostToSeries,
  removePostFromSeries,
};