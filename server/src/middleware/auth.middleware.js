import { verifyToken } from "../lib/utils";
import { prisma } from "../lib/prisma";

export const verifyUser = async (req, res, next) => {
  try {

    let token = null;

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(403).json({
        message: "Token invalid or expired"
      });
    }

    //////////////////////////////////////////////////////
    // LOAD USER + PERMISSIONS
    //////////////////////////////////////////////////////

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    //////////////////////////////////////////////////////
    // ATTACH USER TO REQUEST
    //////////////////////////////////////////////////////

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role?.slug || null,
      permissions: user.role?.permissions?.map(
        (p) => p.permission.action
      ) || []
    };

    next();

  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "Unauthorized"
    });
  }
};