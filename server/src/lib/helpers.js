import slugify from "slugify";

// api response formatter
export function apiResponse(res, statusCode, successStatus, message, data = null) {
  res.status(statusCode).json({
    success: successStatus,
    message,
    data,
  });
}

export const setAuthCookies = (res, accessToken, refreshToken, accessOptions, refreshOptions) => {
  if (accessToken) {
    res.cookie("accessToken", accessToken, accessOptions);
  }

  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, refreshOptions);
  }
};

export const clearAuthCookies = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};

// Function to return Safe User
export function getSafeUser(user) {
  if (!user) return null;
  return {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    role: user?.role?.slug,
    avatarUrl: user?.avatarUrl,
    permissions: user?.role?.permissions?.map((p) => p.permission.action),
  };
}

// Global asyncHandler
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Helper function to generate Slugs 
export const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,     // remove special characters
    trim: true
  });
};

export const generateUniqueSlug = async (title, prisma) => {
  const baseSlug = generateSlug(title);

  const existingSlugs = await prisma.post.findMany({
    where: {
      slug: {
        startsWith: baseSlug
      }
    },
    select: { slug: true }
  });

  if (existingSlugs.length === 0) return baseSlug;

  const slugNumbers = existingSlugs
    .map(p => {
      const match = p.slug.match(/-(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    });

  const max = Math.max(...slugNumbers);

  return `${baseSlug}-${max + 1}`;
};

// Helper function to generate post excerpt if not provided
export function generateExcerpt(editorContent, maxLength = 160) {
  try {
    if (!editorContent?.blocks) return "";

    // Extract text from blocks
    const text = editorContent.blocks
      .map(block => {
        if (block?.data?.text) return block.data.text;
        if (block?.data?.caption) return block.data.caption;
        return "";
      })
      .join(" ");

    // Remove HTML tags
    const cleanText = text.replace(/<[^>]*>/g, "");

    // Trim to max length
    return cleanText.substring(0, maxLength).trim() + "...";
  } catch (error) {
    return "";
  }
}

// Helper function to calculate popularity Score
export function calculatePopularityScore(viewCount, likeCount, clapCount, commentCount, bookmarkCount) {
  const score =
  viewCount * 1 +
  likeCount * 3 +
  clapCount * 2 +
  commentCount * 4 +
  bookmarkCount * 5;

  return score;
}