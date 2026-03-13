import { ApiError } from "../lib/ApiError.js";
import { apiResponse, asyncHandler } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// CLOUDINARY CONFIGURATION
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// UPLOAD MEDIA
const uploadMedia = asyncHandler(async (req, res) => {
  const user = req.user;
  const file = req.file;
  const { altText, type: requestedType } = req.body;

  if (!file) {
    throw new ApiError(400, "No file provided");
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new ApiError(400, "File size exceeds 10MB limit");
  }

  // Determine media type
  let mediaType = requestedType;
  if (!mediaType) {
    if (file.mimetype.startsWith("image/")) {
      mediaType = "IMAGE";
    } else if (file.mimetype.startsWith("video/")) {
      mediaType = "VIDEO";
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      mediaType = "DOCUMENT";
    } else {
      throw new ApiError(400, "Unsupported file type");
    }
  }

  // Validate media type enum
  const validTypes = ["IMAGE", "VIDEO", "DOCUMENT"];
  if (!validTypes.includes(mediaType)) {
    throw new ApiError(400, "Invalid media type");
  }

  // Upload to Cloudinary using stream
  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `blog/${mediaType.toLowerCase()}s`,
        resource_type: mediaType === "VIDEO" ? "video" : "auto",
        transformation: mediaType === "IMAGE" ? [
          { quality: "auto:good" },
          { fetch_format: "auto" }
        ] : undefined,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });

  // Create media record in database
  const media = await prisma.media.create({
    data: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      type: mediaType,
      width: uploadResult.width || null,
      height: uploadResult.height || null,
      size: uploadResult.bytes || file.size,
      altText: altText?.trim() || null,
      uploadedById: user?.id || null,
    },
  });

  return apiResponse(res, 201, true, "Media uploaded successfully", {
    media,
    cloudinaryData: {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    },
  });
});

// UPLOAD MULTIPLE MEDIA (Batch)
const uploadMultipleMedia = asyncHandler(async (req, res) => {
  const user = req.user;
  const files = req.files;
  const { altTexts } = req.body;

  if (!files || files.length === 0) {
    throw new ApiError(400, "No files provided");
  }

  if (files.length > 10) {
    throw new ApiError(400, "Maximum 10 files allowed per batch");
  }

  const parsedAltTexts = altTexts ? JSON.parse(altTexts) : [];
  const results = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const altText = parsedAltTexts[i] || null;

    try {
      let mediaType = "IMAGE";
      if (file.mimetype.startsWith("video/")) {
        mediaType = "VIDEO";
      } else if (file.mimetype === "application/pdf") {
        mediaType = "DOCUMENT";
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `blog/${mediaType.toLowerCase()}s`,
            resource_type: mediaType === "VIDEO" ? "video" : "auto",
            transformation: mediaType === "IMAGE" ? [
              { quality: "auto:good" },
              { fetch_format: "auto" }
            ] : undefined,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      const media = await prisma.media.create({
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          type: mediaType,
          width: uploadResult.width || null,
          height: uploadResult.height || null,
          size: uploadResult.bytes || file.size,
          altText: altText?.trim() || null,
          uploadedById: user?.id || null,
        },
      });

      results.push(media);
    } catch (error) {
      errors.push({
        index: i,
        filename: file.originalname,
        error: error.message,
      });
    }
  }

  return apiResponse(res, 201, true, "Batch upload completed", {
    successful: results.length,
    failed: errors.length,
    media: results,
    errors,
  });
});

// GET ALL MEDIA
const getAllMedia = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    search,
    uploadedBy,
    sortBy = "createdAt",
    order = "desc",
    unusedOnly = "false",
  } = req.query;

  const pageNumber = Math.max(parseInt(page), 1);
  const pageSize = Math.min(parseInt(limit), 50);
  const skip = (pageNumber - 1) * pageSize;

  const where = {};

  if (type) where.type = type;
  if (uploadedBy) where.uploadedById = uploadedBy;

  if (search) {
    where.OR = [
      { altText: { contains: search, mode: "insensitive" } },
      { publicId: { contains: search, mode: "insensitive" } },
    ];
  }

  if (unusedOnly === "true") {
    where.posts = { none: {} };
    where.postSEOs = { none: {} };
  }

  const allowedSortFields = ["createdAt", "updatedAt", "size", "type"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = order === "asc" ? "asc" : "desc";

  const [media, total] = await prisma.$transaction([
    prisma.media.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortField]: sortOrder },
      include: {
        uploadedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
        _count: {
          select: { posts: true, postSEOs: true },
        },
      },
    }),
    prisma.media.count({ where }),
  ]);

  const transformedMedia = media.map((item) => ({
    ...item,
    usageCount: item._count.posts + item._count.postSEOs,
    _count: undefined,
  }));

  const totalPages = Math.ceil(total / pageSize);

  return apiResponse(res, 200, true, "Media fetched successfully", {
    media: transformedMedia,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
    },
  });
});

// GET SINGLE MEDIA
const getMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      uploadedBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      posts: {
        select: { id: true, title: true, slug: true, status: true },
      },
      postSEOs: {
        select: { id: true, postId: true },
      },
      _count: {
        select: { posts: true, postSEOs: true },
      },
    },
  });

  if (!media) {
    throw new ApiError(404, "Media not found");
  }

  return apiResponse(res, 200, true, "Media fetched successfully", {
    ...media,
    usageCount: media._count.posts + media._count.postSEOs,
    _count: undefined,
  });
});

// GET MEDIA BY PUBLIC ID
const getMediaByPublicId = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  const media = await prisma.media.findUnique({
    where: { publicId },
    include: {
      uploadedBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: {
        select: { posts: true, postSEOs: true },
      },
    },
  });

  if (!media) {
    throw new ApiError(404, "Media not found");
  }

  return apiResponse(res, 200, true, "Media fetched successfully", {
    ...media,
    usageCount: media._count.posts + media._count.postSEOs,
    _count: undefined,
  });
});

// UPDATE MEDIA
const updateMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { altText } = req.body;

  const media = await prisma.media.findUnique({
    where: { id },
  });

  if (!media) {
    throw new ApiError(404, "Media not found");
  }

  // Check ownership or admin
  const isOwner = media.uploadedById === req.user?.id;
  const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "EDITOR";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You do not have permission to update this media");
  }

  const updateData = {};

  if (altText !== undefined) {
    updateData.altText = altText?.trim() || null;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const updatedMedia = await prisma.media.update({
    where: { id },
    data: updateData,
    include: {
      uploadedBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  return apiResponse(res, 200, true, "Media updated successfully", updatedMedia);
});

// DELETE MEDIA
const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { force = "false" } = req.query;

  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      _count: {
        select: { posts: true, postSEOs: true },
      },
    },
  });

  if (!media) {
    throw new ApiError(404, "Media not found");
  }

  // Check ownership or admin
  const isOwner = media.uploadedById === req.user?.id;
  const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "EDITOR";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You do not have permission to delete this media");
  }

  const usageCount = media._count.posts + media._count.postSEOs;

  // Prevent deletion if media is in use
  if (usageCount > 0 && force !== "true") {
    throw new ApiError(
      400,
      `Media is currently used in ${usageCount} post(s). Use force=true to delete anyway.`
    );
  }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.type === "VIDEO" ? "video" : "image",
    });
  } catch (cloudinaryError) {
    console.error("Cloudinary deletion error:", cloudinaryError);
  }

  // Delete from database
  await prisma.media.delete({
    where: { id },
  });

  return apiResponse(res, 200, true, "Media deleted successfully", {
    deletedMedia: media,
    wasForced: force === "true" && usageCount > 0,
    removedFromPosts: media._count.posts,
    removedFromSEOs: media._count.postSEOs,
  });
});

// BULK DELETE MEDIA
const bulkDeleteMedia = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  const { force = "false" } = req.query;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "Media IDs array is required");
  }

  if (ids.length > 50) {
    throw new ApiError(400, "Maximum 50 media items allowed per bulk delete");
  }

  const mediaItems = await prisma.media.findMany({
    where: { id: { in: ids } },
    include: {
      _count: {
        select: { posts: true, postSEOs: true },
      },
    },
  });

  if (mediaItems.length !== ids.length) {
    const foundIds = mediaItems.map((m) => m.id);
    const missingIds = ids.filter((id) => !foundIds.includes(id));
    throw new ApiError(404, `Media not found: ${missingIds.join(", ")}`);
  }

  // Check permissions
  const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "EDITOR";
  
  if (!isAdmin) {
    const unauthorizedItems = mediaItems.filter(
      (m) => m.uploadedById !== req.user?.id
    );
    if (unauthorizedItems.length > 0) {
      throw new ApiError(403, "You do not have permission to delete some media items");
    }
  }

  const itemsInUse = mediaItems.filter(
    (m) => m._count.posts > 0 || m._count.postSEOs > 0
  );

  if (itemsInUse.length > 0 && force !== "true") {
    throw new ApiError(
      400,
      `${itemsInUse.length} media item(s) are in use. Use force=true to delete anyway.`
    );
  }

  // Delete from Cloudinary
  const cloudinaryErrors = [];
  for (const media of mediaItems) {
    try {
      await cloudinary.uploader.destroy(media.publicId, {
        resource_type: media.type === "VIDEO" ? "video" : "image",
      });
    } catch (error) {
      cloudinaryErrors.push({
        id: media.id,
        publicId: media.publicId,
        error: error.message,
      });
    }
  }

  // Delete from database
  await prisma.media.deleteMany({
    where: { id: { in: ids } },
  });

  return apiResponse(res, 200, true, "Bulk delete completed", {
    deleted: mediaItems.length,
    cloudinaryErrors,
    itemsInUse: itemsInUse.length,
  });
});

// GET MEDIA USAGE STATS
const getMediaStats = asyncHandler(async (req, res) => {
  const stats = await prisma.$transaction([
    prisma.media.groupBy({
      by: ["type"],
      _count: { id: true },
      _sum: { size: true },
    }),
    prisma.media.count(),
    prisma.media.aggregate({
      _sum: { size: true },
    }),
    prisma.media.count({
      where: {
        posts: { none: {} },
        postSEOs: { none: {} },
      },
    }),
    prisma.media.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const [typeStats, totalCount, totalSize, unusedCount, recentCount] = stats;

  return apiResponse(res, 200, true, "Media stats fetched successfully", {
    total: {
      count: totalCount,
      size: totalSize._sum.size || 0,
      sizeFormatted: formatBytes(totalSize._sum.size || 0),
    },
    byType: typeStats.map((stat) => ({
      type: stat.type,
      count: stat._count.id,
      size: stat._sum.size || 0,
      sizeFormatted: formatBytes(stat._sum.size || 0),
    })),
    unused: {
      count: unusedCount,
      percentage: totalCount > 0 ? ((unusedCount / totalCount) * 100).toFixed(2) : 0,
    },
    recentUploads: recentCount,
  });
});

// CLEANUP UNUSED MEDIA
const cleanupUnusedMedia = asyncHandler(async (req, res) => {
  const { dryRun = "true", olderThanDays = 30 } = req.query;
  const isDryRun = dryRun === "true";
  const cutoffDate = new Date(Date.now() - parseInt(olderThanDays) * 24 * 60 * 60 * 1000);

  const unusedMedia = await prisma.media.findMany({
    where: {
      posts: { none: {} },
      postSEOs: { none: {} },
      createdAt: { lte: cutoffDate },
    },
  });

  if (unusedMedia.length === 0) {
    return apiResponse(res, 200, true, "No unused media found", {
      mode: isDryRun ? "dry-run" : "deleted",
      count: 0,
      media: [],
    });
  }

  if (!isDryRun) {
    const cloudinaryErrors = [];
    for (const media of unusedMedia) {
      try {
        await cloudinary.uploader.destroy(media.publicId, {
          resource_type: media.type === "VIDEO" ? "video" : "image",
        });
      } catch (error) {
        cloudinaryErrors.push({ id: media.id, error: error.message });
      }
    }

    await prisma.media.deleteMany({
      where: { id: { in: unusedMedia.map((m) => m.id) } },
    });

    return apiResponse(res, 200, true, "Cleanup completed", {
      mode: "deleted",
      count: unusedMedia.length,
      cloudinaryErrors,
      deletedMedia: unusedMedia.map((m) => ({
        id: m.id,
        publicId: m.publicId,
        type: m.type,
        url: m.url,
      })),
    });
  }

  return apiResponse(res, 200, true, "Dry run completed", {
    mode: "dry-run",
    count: unusedMedia.length,
    wouldDelete: unusedMedia.map((m) => ({
      id: m.id,
      publicId: m.publicId,
      type: m.type,
      url: m.url,
      createdAt: m.createdAt,
    })),
  });
});

// GENERATE SIGNED URL
const generateSignedUrl = asyncHandler(async (req, res) => {
  const { publicId, transformation } = req.body;

  if (!publicId) {
    throw new ApiError(400, "Public ID is required");
  }

  const signedUrl = cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    transformation: transformation || [],
  });

  return apiResponse(res, 200, true, "Signed URL generated", {
    signedUrl,
    publicId,
    expiresAt: new Date(Date.now() + 3600 * 1000),
  });
});

// EXTRACT IMAGES FROM EDITOR.JS CONTENT
const extractImagesFromContent = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || !Array.isArray(content.blocks)) {
    throw new ApiError(400, "Invalid Editor.js content");
  }

  const imageBlocks = content.blocks.filter(
    (block) => block.type === "image" || block.type === "simpleImage"
  );

  const extractedImages = imageBlocks.map((block) => ({
    type: block.type,
    url: block.data?.file?.url || block.data?.url,
    caption: block.data?.caption,
    alt: block.data?.alt,
  }));

  const urls = extractedImages.map((img) => img.url).filter(Boolean);
  
  const existingMedia = await prisma.media.findMany({
    where: { url: { in: urls } },
    select: { id: true, url: true, publicId: true, altText: true },
  });

  const urlToMediaMap = new Map(existingMedia.map((m) => [m.url, m]));

  const enrichedImages = extractedImages.map((img) => ({
    ...img,
    isManaged: urlToMediaMap.has(img.url),
    mediaId: urlToMediaMap.get(img.url)?.id || null,
    publicId: urlToMediaMap.get(img.url)?.publicId || null,
    dbAltText: urlToMediaMap.get(img.url)?.altText || null,
  }));

  return apiResponse(res, 200, true, "Images extracted successfully", {
    totalImages: extractedImages.length,
    managedImages: enrichedImages.filter((img) => img.isManaged).length,
    externalImages: enrichedImages.filter((img) => !img.isManaged).length,
    images: enrichedImages,
  });
});

// HELPER FUNCTIONS
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export {
  uploadMedia,
  uploadMultipleMedia,
  getAllMedia,
  getMedia,
  getMediaByPublicId,
  updateMedia,
  deleteMedia,
  bulkDeleteMedia,
  getMediaStats,
  cleanupUnusedMedia,
  generateSignedUrl,
  extractImagesFromContent,
};