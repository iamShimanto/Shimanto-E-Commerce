import { RequestHandler } from "express";
import { Size } from "../../models/product/size.model";
import { ApiError } from "../../utils/ApiError";
import { successResponse } from "../../utils/successResponse";
import {
  delCache,
  getCache,
  setCache,
} from "../../utils/redisCache";
import { productModel } from "../../models/product.model";
import { Types } from "mongoose";

const SIZES_CACHE_KEY = "sizes:v1";

export const createSize: RequestHandler = async (req, res) => {
  const { size } = req.body;

  if (!size || typeof size !== "string" || size.trim().length === 0) {
    throw new ApiError(400, "Size name is required");
  }

  const trimmed = size.trim().toUpperCase();

  const existing = await Size.findOne({ size: trimmed });
  if (existing) {
    throw new ApiError(409, "Size already exists");
  }

  const newSize = await Size.create({ size: trimmed });

  await delCache(SIZES_CACHE_KEY);

  return successResponse(res, "Size created successfully", 201, newSize);
};

export const getAllSizes: RequestHandler = async (_req, res) => {
  const cached = await getCache(SIZES_CACHE_KEY);
  if (cached) {
    return successResponse(res, "All Sizes", 200, cached);
  }

  const sizes = await Size.find({}).sort({ createdAt: 1 }).lean();

  await setCache(SIZES_CACHE_KEY, sizes, 60 * 60 * 24);

  return successResponse(res, "All Sizes", 200, sizes);
};

export const getSizeById: RequestHandler = async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id as string)) {
    throw new ApiError(400, "Invalid size ID");
  }

  const size = await Size.findById(id as string).lean();
  if (!size) {
    throw new ApiError(404, "Size not found");
  }

  return successResponse(res, "Size found", 200, size);
};

export const updateSize: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { size } = req.body;

  if (!Types.ObjectId.isValid(id as string)) {
    throw new ApiError(400, "Invalid size ID");
  }

  if (!size || typeof size !== "string" || size.trim().length === 0) {
    throw new ApiError(400, "Size name is required");
  }

  const trimmed = size.trim().toUpperCase();

  const existing = await Size.findOne({
    size: trimmed,
    _id: { $ne: id as string },
  });
  if (existing) {
    throw new ApiError(409, "Size already exists");
  }

  const updated = await Size.findByIdAndUpdate(
    id as string,
    { size: trimmed },
    { new: true, runValidators: true },
  );

  if (!updated) {
    throw new ApiError(404, "Size not found");
  }

  await delCache(SIZES_CACHE_KEY);

  return successResponse(res, "Size updated successfully", 200, updated);
};

export const deleteSize: RequestHandler = async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id as string)) {
    throw new ApiError(400, "Invalid size ID");
  }

  const sizeDoc = await Size.findById(id as string);
  if (!sizeDoc) {
    throw new ApiError(404, "Size not found");
  }

  const inUse = await productModel.findOne({
    "variants.sizes": id as string,
  });

  if (inUse) {
    throw new ApiError(
      400,
      "Cannot delete size — it is used by one or more products",
    );
  }

  await Size.findByIdAndDelete(id as string);
  await delCache(SIZES_CACHE_KEY);

  return successResponse(res, "Size deleted successfully", 200);
};