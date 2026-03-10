import { prisma } from "../lib/prisma";

export const requirePostOwnership = async (req, res, next) => {

  const postId = req.params.postId;

  const post = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!post) {
    return res.status(404).json({
      message: "Post not found"
    });
  }

  if (
    post.authorId !== req.user.id &&
    req.user.role !== "admin" &&
    req.user.role !== "editor"
  ) {
    return res.status(403).json({
      message: "You can only modify your own posts"
    });
  }

  next();
};