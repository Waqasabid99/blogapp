import { prisma } from "../lib/prisma.js";

export const requirePostOwnership = async (req, res, next) => {
  try {

    //////////////////////////////////////////////////////
    // AUTH CHECK
    //////////////////////////////////////////////////////

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    //////////////////////////////////////////////////////
    // ADMIN / GLOBAL PERMISSION BYPASS
    //////////////////////////////////////////////////////

    if (
      req.user.role.toUpperCase() === "ADMIN" ||
      req.user.permissions.includes("post.update") ||
      req.user.permissions.includes("post.delete")
    ) {
      return next();
    }

    //////////////////////////////////////////////////////
    // FETCH POST
    //////////////////////////////////////////////////////

    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    //////////////////////////////////////////////////////
    // OWNERSHIP CHECK
    //////////////////////////////////////////////////////

    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You do not own this post"
      });
    }

    next();

  } catch (error) {

    console.error("Ownership middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Ownership verification failed"
    });

  }
};