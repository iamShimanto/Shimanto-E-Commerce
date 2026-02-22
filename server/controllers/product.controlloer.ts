import { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { uploadToCloudinary } from "../services/CloudinaryServices";
import { successResponse } from "../utils/successResponse";
import { CategoryModel } from "../models/category.model";
import { productModel } from "../models/product.model";
import { generateUniqueSlug } from "../utils/generateSlug";
import { getCache, setCache } from "../utils/redisCache";

type MulterFieldFiles = {
  thumbnail?: Express.Multer.File[];
  images?: Express.Multer.File[];
};

const product_sizes_enum = ["s", "m", "l", "xl", "2xl", "3xl"];

export const createProduct: RequestHandler = async (req, res) => {
  const { title, description, category, price, variants, tags, isActive } =
    req.body;
  const files = req.files as MulterFieldFiles | undefined;
  if (!title) throw new ApiError(400, "Product title is required");
  if (!description) throw new ApiError(400, "Product Description is required");
  if (!category) throw new ApiError(400, "Product Category is required");
  if (!price) throw new ApiError(400, "Product Price is required");

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

  const slug = await generateUniqueSlug(productModel, title);

  const newProduct = new productModel({
    title,
    slug,
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

export const getAllProducts: RequestHandler = async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const category = req.query.category as string;
  const search = req.query.search as string;
  const skip = (page - 1) * limit;

  const cacheKey = `products:list:v1:page=${page}:limit=${limit}:cat=${category || "all"}:q=${search || "none"}`;

  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const pipeline: any[] = [
    { $match: { isActive: true } },

    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
  ];

  if (category) {
    pipeline.push({
      $match: { "category.slug": category },
    });
  }

  if (search) {
    pipeline.push({
      $match: {
        title: { $regex: search, $options: "i" },
      },
    });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  );

  const products = await productModel.aggregate(pipeline);

  const countPipeline = pipeline.slice(0, -3);
  countPipeline.push({ $count: "total" });

  const totalResult = await productModel.aggregate(countPipeline);
  const total = totalResult[0]?.total || 0;

  const response = {
    success: true,
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  await setCache(cacheKey, response, 120);

  return res.status(200).json(response);
};

export const getSingleProduct: RequestHandler = async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `product:slug:${slug}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return successResponse(res, "Product Found", 200, cached);
  }

  const product = await productModel.findOne({ slug }).lean();
  if (!product) throw new ApiError(404, "Product Not Found With this Slug");

  await setCache(cacheKey, product, 300);

  return successResponse(res, "Product Found", 200, product);
};
