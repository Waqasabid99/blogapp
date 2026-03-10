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
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.slug,
        permissions: user.role.permissions.map((p) => p.permission.action),
    };
}

// Global asyncHandler
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
