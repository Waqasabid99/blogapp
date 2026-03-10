import { ApiError } from "../lib/ApiError";
import { asyncHandler } from "../lib/helpers";
import { prisma } from "../lib/prisma";
import slugify from "slugify";

const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await prisma.category.findMany({
        include: {
            children: true,
        },
    });
    if (!categories) throw new ApiError(404, "Categories not found");
    
    const flatCategories = categories.map((category) => {
        return {
            ...category,
            children: category.children.map((child) => {
                return {
                    ...child,
                    children: [],
                };
            }),
        };
    });

    return apiResponse(res, 200, true, "Categories fetched", flatCategories);
})

const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            children: true,
        },
    });

    if (!category) throw new ApiError(404, "Category not found");

    const flatCategory = {
        ...category,
        children: category.children.map((child) => {
            return {
                ...child,
                children: [],
            };
        }),
    };

    return apiResponse(res, 200, true, "Category fetched", flatCategory);
})

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentId } = req.body;

  if (!name) throw new ApiError(400, "Missing required fields");

  // Validate parentId
  let parent = null;
  if (parentId) {
    parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) throw new ApiError(400, "Parent category not found");
  }

  // Generate unique slug
  let slug = slugify(name, { lower: true });
  let suffix = 1;
  let existingCategory = await prisma.category.findUnique({ where: { slug } });
  while (existingCategory) {
    slug = `${slug}-${suffix}`;
    existingCategory = await prisma.category.findUnique({ where: { slug } });
    suffix++;
  }

  // Create category
  const category = await prisma.category.create({
    data: {
      name,
      description,
      slug,
      parentId: parentId ?? null
    },
  });

  return apiResponse(res, 201, true, "Category created", category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, parentId } = req.body;

  // Find existing category
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new ApiError(404, "Category not found");

  const updateData = {};

  // Update name and slug if name is provided
  if (name) {
    updateData.name = name;

    // Generate unique slug
    let slug = slugify(name, { lower: true });
    let suffix = 1;
    let existingCategory = await prisma.category.findUnique({ where: { slug } });
    while (existingCategory && existingCategory.id !== id) {
      slug = `${slug}-${suffix}`;
      existingCategory = await prisma.category.findUnique({ where: { slug } });
      suffix++;
    }
    updateData.slug = slug;
  }

  // Update description if provided
  if (description !== undefined) {
    updateData.description = description;
  }

  // Update parentId if provided
  if (parentId !== undefined) {
    if (parentId === id) throw new ApiError(400, "Category cannot be its own parent");

    if (parentId !== null) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) throw new ApiError(400, "Parent category not found");
    }
    updateData.parentId = parentId;
  }

  // If nothing to update
  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: updateData,
  });

  return apiResponse(res, 200, true, "Category updated", updatedCategory);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new ApiError(404, "Category not found");

  // Delete category
  await prisma.category.delete({
    where: { id },
  });

  return apiResponse(res, 200, true, "Category deleted", category);
});

export {
    getAllCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
}