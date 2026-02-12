import { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { uploadToCloudinary } from "../services/CloudinaryServices";
import { successResponse } from "../utils/successResponse";
import { CategoryModel } from "../models/category.model";
import { productModel } from "../models/product.model";

type MulterFieldFiles = {
  thumbnail?: Express.Multer.File[];
  images?: Express.Multer.File[];
};

const product_sizes_enum = ["s", "m", "l", "xl", "2xl", "3xl"];

export const createProduct: RequestHandler = async (req, res) => {
  const {
    title,
    slug,
    description,
    category,
    price,
    variants,
    tags,
    isActive,
  } = req.body;
  const files = req.files as MulterFieldFiles | undefined;
  if (!title) throw new ApiError(400, "Product title is required");
  if (!description) throw new ApiError(400, "Product Description is required");
  if (!category) throw new ApiError(400, "Product Category is required");
  if (!price) throw new ApiError(400, "Product Price is required");

  const isSlugExist = await productModel.findOne({ slug: slug.toLowerCase() });
  if (isSlugExist) throw new ApiError(400, "Slug is already exist");

  const isCategoryExist = await CategoryModel.findById(category);
  if (!isCategoryExist) throw new ApiError(400, "Enter a valid Category");

  if (!Array.isArray(variants) || variants.length === 0) {
    throw new ApiError(400, "Minimum 1 variant is required");
  }

  for (const variant of variants) {
    if (!variant.sku) throw new ApiError(400, "Product SKU is required");
    if (!variant.color) throw new ApiError(400, "Color is required");
    if (!variant.sizes) throw new ApiError(400, "Size is required");
    if (!product_sizes_enum.includes(variant.sizes))
      throw new ApiError(400, "Enter a valid size");
    if (!variant.stock || variant.stock < 1)
      throw new ApiError(400, "Product stock required and must be more than 0");
  }

  const skus = variants.map((v) => v.sku);
  if (new Set(skus).size !== skus.length)
    throw new ApiError(400, "sku must be unique");

  const thumbnail = files?.thumbnail?.[0];
  const images = files?.images ?? [];
  if (!thumbnail)
    throw new ApiError(400, "Product Thumbnail image is required");

  if (images.length > 6) throw new ApiError(400, "Product images is required");

  const thumbnailUrl = (await uploadToCloudinary(thumbnail, "products"))
    .secure_url;

  const imageUrls =
    images.length > 0
      ? await Promise.all(
          images.map(async (img) => {
            const r = await uploadToCloudinary(img, "products");
            return r.secure_url;
          }),
        )
      : [];

  const newProduct = new productModel({
    title,
    slug: slug.toLowerCase(),
    description,
    category,
    price,
    variants,
    tags,
    isActive,
    thumbnail: thumbnailUrl,
    images: imageUrls,
  });
  await newProduct.save();

  successResponse(res, "Product Created Successfully", 201, newProduct);
};
