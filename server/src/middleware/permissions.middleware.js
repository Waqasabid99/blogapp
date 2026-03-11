//////////////////////////////////////////////////////
// HELPER FUNCTIONS
//////////////////////////////////////////////////////

function hasPermission(userPermissions, permission) {
  return userPermissions.includes(permission);
}

function hasAnyPermission(userPermissions, requiredPermissions) {
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
}

function hasAllPermissions(userPermissions, requiredPermissions) {
  return requiredPermissions.every((perm) => userPermissions.includes(perm));
}

//////////////////////////////////////////////////////
// REQUIRE ANY PERMISSION
//////////////////////////////////////////////////////

export const requirePermission = (...permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      const userPermissions = req.user.permissions || [];

      if (!hasAnyPermission(userPermissions, permissions)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
          requiredPermissions: permissions
        });
      }

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);

      return res.status(500).json({
        success: false,
        message: "Authorization error"
      });
    }
  };
};

//////////////////////////////////////////////////////
// REQUIRE ALL PERMISSIONS
//////////////////////////////////////////////////////

export const requireAllPermissions = (...permissions) => {
  return (req, res, next) => {
    try {

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      const userPermissions = req.user.permissions || [];

      if (!hasAllPermissions(userPermissions, permissions)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          requiredPermissions: permissions
        });
      }

      next();

    } catch (error) {

      console.error("Permission middleware error:", error);

      return res.status(500).json({
        success: false,
        message: "Authorization error"
      });

    }
  };
};

//////////////////////////////////////////////////////
// OPTIONAL PERMISSION (SOFT CHECK)
//////////////////////////////////////////////////////

export const optionalPermission = (...permissions) => {
  return (req, res, next) => {

    if (!req.user) {
      req.hasPermission = false;
      return next();
    }

    const userPermissions = req.user.permissions || [];

    req.hasPermission = hasAnyPermission(userPermissions, permissions);

    next();
  };
};

//////////////////////////////////////////////////////
// ADMIN BYPASS (OPTIONAL)
//////////////////////////////////////////////////////

export const requirePermissionWithAdmin = (...permissions) => {

  return (req, res, next) => {

    try {

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      // ADMIN BYPASS
      if (req.user.role === "admin") {
        return next();
      }

      const userPermissions = req.user.permissions || [];

      if (!hasAnyPermission(userPermissions, permissions)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action"
        });
      }

      next();

    } catch (error) {

      console.error("Permission middleware error:", error);

      return res.status(500).json({
        success: false,
        message: "Authorization error"
      });

    }
  };

};