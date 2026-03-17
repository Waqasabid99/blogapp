import { ApiError } from "../lib/ApiError.js";
import { apiResponse, asyncHandler } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";

const getAllRoles = asyncHandler(async (req, res) => {
    const roles = await prisma.role.findMany({
        orderBy: {
            createdAt: "asc"
        }
    })

    if (!roles) {
        throw new ApiError(404, "Roles not found")
    }

    return apiResponse(res, 200, true, "Roles fetched successfully", roles)
})

const getAllPermissions = asyncHandler(async (req, res) => {
    const permissions = await prisma.permission.findMany({
        orderBy: {
            createdAt: "asc"
        }
    })

    if (!permissions) {
        throw new ApiError(404, "Permissions not found")
    }

    return apiResponse(res, 200, true, "Permissions fetched successfully", permissions)
})

export { getAllRoles, getAllPermissions }