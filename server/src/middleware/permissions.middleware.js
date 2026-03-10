export const authorize = (...requiredPermissions) => {

  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    //////////////////////////////////////////////////////
    // ADMIN BYPASS
    //////////////////////////////////////////////////////

    if (req.user.role === "admin") {
      return next();
    }

    //////////////////////////////////////////////////////
    // CHECK PERMISSIONS
    //////////////////////////////////////////////////////

    const userPermissions = req.user.permissions || [];

    const hasPermission = requiredPermissions.every(
      (perm) => userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: "Forbidden - insufficient permissions"
      });
    }

    next();
  };

};