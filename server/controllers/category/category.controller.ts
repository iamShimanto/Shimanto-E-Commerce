import { RequestHandler } from "express";
import { CategoryModel } from "../../models/category.model";
import * as cloudinaryService from "../../services/CloudinaryServices";
import { ApiError } from "../../utils/ApiError";
import { successResponse } from "../../utils/successResponse";
import { generateUniqueSlug } from "../../utils/generateSlug";
import { productModel } from "../../models/product.model";
import { delCache, getCache, setCache } from "../../utils/redisCache";

export const create: RequestHandler = async (req, res) => {
  const { name, description } = req.body;

  if (!name) throw new ApiError(400, "Category Name Is Required");
  if (!req.file) throw new ApiError(400, "Thumbnail Image is required");
  const cacheKey = `categories:v1`;
  const existingCategory = await CategoryModel.findOne({ name });
  if (existingCategory) throw new ApiError(400, "Category Name already exists");

  const imageRes = await cloudinaryService.uploadToCloudinary(
    req.file,
    "category",
  );

  const slug = await generateUniqueSlug(CategoryModel, name);

  const category = new CategoryModel({
    name,
    slug,
    description,
    thumbnail: imageRes.secure_url,
  });
  await category.save();
  await delCache(cacheKey);
  successResponse(res, "Category Created Successfully", 201);
};

export const getAllCategory: RequestHandler = async (req, res) => {
  const cacheKey = `categories:v1`;
  const cachedCategories = await getCache(cacheKey);
  if (cachedCategories) {
    return successResponse(res, "All Categories", 200, cachedCategories);
  }
  const categories = await CategoryModel.find({});
  await setCache(cacheKey, categories, 60 * 60 * 24);
  return successResponse(res, "All Categories", 200, categories);
};

export const updateCategory: RequestHandler = async (req, res) => {
  const { slug } = req.params;
  const { name, description, isActive } = req.body;
  const thumbnail = req.file;
  const cacheKey = `categories:v1`; 
  if (!slug) throw new ApiError(400, "Category slug is required");

  const category = await CategoryModel.findOne({ slug });
  if (!category) throw new ApiError(404, "Category not found");

  if (thumbnail) {
    const publicId = category?.thumbnail?.split("/")?.pop()?.split(".")[0];
    if (publicId) {
      await cloudinaryService.destroyFromCloudinary(`category/${publicId}`);
    }

    const imageRes = await cloudinaryService.uploadToCloudinary(
      thumbnail,
      "category",
    );
    category.thumbnail = imageRes.secure_url;
  }

  if (typeof name === "string" && name.trim()) {
    const nextName = name.trim();

    if (nextName !== category.name) {
      const existingCategory = await CategoryModel.findOne({
        name: nextName,
        _id: { $ne: category._id },
      });
      if (existingCategory)
        throw new ApiError(400, "Category Name already exists");

      category.name = nextName;
      category.slug = await generateUniqueSlug(CategoryModel, nextName);
    }
  }

  if (typeof description === "string") {
    category.description = description;
  }

  if (typeof isActive !== "undefined") {
    if (typeof isActive === "boolean") {
      category.isActive = isActive;
    } else if (typeof isActive === "string") {
      category.isActive = isActive.toLowerCase() === "true";
    }
  }

  await category.save();
  await delCache(cacheKey);
  return successResponse(res, "Category Updated Successfully", 200, category);
};

export const getCategoryProducts: RequestHandler = async (req, res) => {
  const { slug } = req.params;

  if (!slug) throw new ApiError(400, "Category slug is required");
  const category = await CategoryModel.findOne({ slug });
  if (!category) throw new ApiError(404, "Category not found");

  const products = await productModel
    .find({ category: category._id })
    .populate("category", "name slug");
  return successResponse(res, "Category Products", 200, products);
};
