import { RequestHandler } from "express";
import { CategoryModel } from "../models/category.model";
import * as cloudinaryService from "../services/CloudinaryServices";
import { ApiError } from "../utils/ApiError";
import { successResponse } from "../utils/successResponse";

export const create: RequestHandler = async (req, res) => {
  const { name, description } = req.body;

  if (!name) throw new ApiError(400, "Category Name Is Required");
  if (!req.file) throw new ApiError(400, "Thumbnail Image is required");

  const existingCategory = await CategoryModel.findOne({ name });
  if (existingCategory) throw new ApiError(400, "Category Name already exists");

  const imageRes = await cloudinaryService.uploadToCloudinary(
    req.file,
    "category",
  );

  const category = new CategoryModel({
    name,
    description,
    thumbnail: imageRes.secure_url,
  });
  await category.save();

  successResponse(res, "Category Created Successfully", 201);
};

export const getAllCategory: RequestHandler = async (req, res) => {
  const categories = await CategoryModel.find({});
  return successResponse(res, "All Categories", 200, categories);
};
