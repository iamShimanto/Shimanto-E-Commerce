import { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import {
  destroyFromCloudinary,
  uploadToCloudinary,
} from "../services/CloudinaryServices";
import { successResponse } from "../utils/successResponse";
import { CategoryModel } from "../models/category.model";
import { productModel, type Size } from "../models/product.model";
import { generateUniqueSlug } from "../utils/generateSlug";
import {
  delCache,
  delCacheByPrefix,
  getCache,
  setCache,
} from "../utils/redisCache";
import { Types } from "mongoose";

type MulterFieldFiles = {
  thumbnail?: Express.Multer.File[];
  images?: Express.Multer.File[];
};

const product_sizes_enum = ["s", "m", "l", "xl", "2xl", "3xl"];

function parseMaybeJson(value: unknown, fieldName: string) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new ApiError(400, `Invalid ${fieldName} format`);
  }
}

export const createProduct: RequestHandler = async (req, res) => {
  const {
    title,
    description,
    category,
    price,
    variants,
    tags,
    isActive,
    discountPercentage,
  } = req.body;
  const files = req.files as MulterFieldFiles | undefined;

  const parsedVariants = parseMaybeJson(variants, "variants");
  const parsedTags = parseMaybeJson(tags, "tags");

  const parsedPrice = typeof price === "number" ? price : Number(price);
  const parsedDiscountPercentage =
    typeof discountPercentage === "number"
      ? discountPercentage
      : discountPercentage == null || String(discountPercentage).trim() === ""
        ? undefined
        : Number(discountPercentage);

  const parsedIsActive =
    typeof isActive === "boolean"
      ? isActive
      : isActive === "true"
        ? true
        : isActive === "false"
          ? false
          : undefined;

  if (!title) throw new ApiError(400, "Product title is required");
  if (!description) throw new ApiError(400, "Product Description is required");
  if (!category) throw new ApiError(400, "Product Category is required");
  if (!price) throw new ApiError(400, "Product Price is required");

  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    throw new ApiError(400, "Product Price must be a positive number");
  }

  if (
    typeof parsedDiscountPercentage !== "undefined" &&
    (!Number.isFinite(parsedDiscountPercentage) ||
      parsedDiscountPercentage < 0 ||
      parsedDiscountPercentage > 100)
  ) {
    throw new ApiError(400, "discountPercentage must be between 0 and 100");
  }

  const isCategoryExist = await CategoryModel.findById(category);
  if (!isCategoryExist) throw new ApiError(400, "Enter a valid Category");

  if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
    throw new ApiError(400, "Minimum 1 variant is required");
  }

  const normalizedVariants = parsedVariants.map((variant) => {
    const sku = String(variant?.sku || "").trim();
    const color = String(variant?.color || "").trim();
    const sizes = variant?.sizes;
    const stock = Number(variant?.stock);

    if (!sku) throw new ApiError(400, "Product SKU is required");
    if (!color) throw new ApiError(400, "Color is required");
    if (!sizes) throw new ApiError(400, "Size is required");
    if (!product_sizes_enum.includes(String(sizes)))
      throw new ApiError(400, "Enter a valid size");
    if (!Number.isFinite(stock) || stock < 1)
      throw new ApiError(400, "Product stock required and must be more than 0");

    return {
      sku,
      color,
      sizes: String(sizes) as Size,
      stock,
    };
  });

  const skus = normalizedVariants.map((v) => v.sku);
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
    price: parsedPrice,
    discountPercentage: parsedDiscountPercentage,
    variants: normalizedVariants,
    tags: Array.isArray(parsedTags) ? parsedTags : undefined,
    isActive: typeof parsedIsActive === "boolean" ? parsedIsActive : undefined,
    thumbnail: thumbnailUrl,
    images: imageUrls,
  });
  await newProduct.save();

  await delCacheByPrefix("products:list:v1:");

  successResponse(res, "Product Created Successfully", 201, newProduct);
};

export const getAllProducts: RequestHandler = async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const category = req.query.category as string;
  const search = req.query.search as string;
  const isActiveQuery = req.query.isActive as string | undefined;
  const skip = (page - 1) * limit;

  let isActiveFilter: boolean | undefined = true;
  if (typeof isActiveQuery !== "undefined") {
    if (isActiveQuery === "true") {
      isActiveFilter = true;
    } else if (isActiveQuery === "false") {
      isActiveFilter = false;
    } else if (isActiveQuery === "all") {
      isActiveFilter = undefined;
    } else {
      throw new ApiError(400, "isActive must be true, false or all");
    }
  }

  const activeKey =
    typeof isActiveFilter === "boolean" ? String(isActiveFilter) : "all";

  const cacheKey = `products:list:v1:page=${page}:limit=${limit}:cat=${category || "all"}:q=${search || "none"}:active=${activeKey}`;

  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const pipeline: any[] = [
    {
      $match:
        typeof isActiveFilter === "boolean" ? { isActive: isActiveFilter } : {},
    },

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

export const updateProduct: RequestHandler = async (req, res) => {
  const { slug } = req.params;

  const existProduct = await productModel.findOne({ slug });
  if (!existProduct) throw new ApiError(404, "Product not exist");

  const {
    title,
    description,
    category,
    price,
    discountPercentage,
    variants,
    tags,
    isActive,
    destroyImages,
  } = req.body;

  const parsedVariants = parseMaybeJson(variants, "variants");
  const parsedTags = parseMaybeJson(tags, "tags");

  // Normalize destroyImages (it may be undefined / JSON string / invalid)
  const parsedDestroyImages = parseMaybeJson(destroyImages, "destroyImages");
  const destroyImagesArr: string[] = Array.isArray(parsedDestroyImages)
    ? parsedDestroyImages.filter((x): x is string => typeof x === "string")
    : [];

  const files = (req.files as MulterFieldFiles) || undefined;
  const thumbnail = files?.thumbnail?.[0];
  const images = files?.images ?? [];

  if (images.length > 6) {
    throw new ApiError(400, "Maximum 6 product images are allowed");
  }

  if (typeof title !== "undefined") {
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new ApiError(400, "Product title must be a non-empty string");
    }
    existProduct.title = title;
  }

  if (typeof description !== "undefined") {
    if (typeof description !== "string" || description.trim().length === 0) {
      throw new ApiError(400, "Product Description must be a non-empty string");
    }
    existProduct.description = description;
  }

  if (typeof category !== "undefined") {
    if (!Types.ObjectId.isValid(category)) {
      throw new ApiError(400, "Enter a valid Category");
    }
    const isCategoryExist = await CategoryModel.findById(category);
    if (!isCategoryExist) throw new ApiError(400, "Enter a valid Category");
    existProduct.category = category;
  }

  if (typeof price !== "undefined") {
    const priceNum = typeof price === "number" ? price : Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      throw new ApiError(400, "Product Price must be a positive number");
    }
    existProduct.price = priceNum;
  }

  if (typeof discountPercentage !== "undefined") {
    const discountNum =
      typeof discountPercentage === "number"
        ? discountPercentage
        : Number(discountPercentage);

    if (!Number.isFinite(discountNum) || discountNum < 0 || discountNum > 100) {
      throw new ApiError(400, "discountPercentage must be between 0 and 100");
    }
    existProduct.discountPercentage = discountNum;
  }

  if (typeof isActive !== "undefined") {
    const parsedIsActive =
      typeof isActive === "boolean"
        ? isActive
        : isActive === "true"
          ? true
          : isActive === "false"
            ? false
            : undefined;

    if (typeof parsedIsActive !== "boolean") {
      throw new ApiError(400, "isActive must be boolean");
    }
    existProduct.isActive = parsedIsActive;
  }

  if (Array.isArray(parsedTags)) {
    existProduct.tags = parsedTags;
  }

  if (typeof parsedVariants !== "undefined") {
    if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
      throw new ApiError(400, "Minimum 1 variant is required");
    }

    const normalizedVariants = parsedVariants.map((variant) => {
      const sku = String(variant?.sku || "").trim();
      const color = String(variant?.color || "").trim();
      const sizes = variant?.sizes;
      const stock = Number(variant?.stock);

      if (!sku) throw new ApiError(400, "Product SKU is required");
      if (!color) throw new ApiError(400, "Color is required");
      if (!sizes) throw new ApiError(400, "Size is required");
      if (!product_sizes_enum.includes(String(sizes)))
        throw new ApiError(400, "Enter a valid size");
      if (!Number.isFinite(stock) || stock < 1)
        throw new ApiError(
          400,
          "Product stock required and must be more than 0",
        );

      return {
        sku,
        color,
        sizes: String(sizes) as Size,
        stock,
      };
    });

    const skus = normalizedVariants.map((v) => v.sku);
    if (new Set(skus).size !== skus.length)
      throw new ApiError(400, "sku must be unique");

    existProduct.variants = normalizedVariants;
  }

  if (thumbnail) {
    const publicId = existProduct?.thumbnail?.split("/").pop()?.split(".")[0];
    if (publicId) {
      await destroyFromCloudinary(`products/${publicId}`);
    }
    const imageRes = await uploadToCloudinary(thumbnail, "products");
    existProduct.thumbnail = imageRes.secure_url;
  }

  // ---------- Product images update ----------
  let imageUrl: string[] = [];

  let totalImage = existProduct.images?.length ?? 0;
  if (destroyImagesArr.length > 0) totalImage -= destroyImagesArr.length;
  if (images.length > 0) totalImage += images.length;

  if (totalImage > 6) throw new ApiError(400, "You can upload upto 6 images");
  if (totalImage < 1) throw new ApiError(400, "Minimum 1 image should be stay");

  imageUrl =
    images.length > 0
      ? await Promise.all(
          images.map(async (img) => {
            const r = await uploadToCloudinary(img, "products");
            return r.secure_url;
          }),
        )
      : [];

  if (destroyImagesArr.length > 0) {
    for (const url of destroyImagesArr) {
      const publicUrl = url.split("/").pop()?.split(".")[0];
      if (publicUrl) {
        await destroyFromCloudinary(`products/${publicUrl}`);
      }
    }
  }

  const filteredImages: string[] =
    existProduct.images?.filter((item) => !destroyImagesArr.includes(item)) ??
    [];

  imageUrl = imageUrl.concat(filteredImages);

  if (imageUrl.length > 0) existProduct.images = imageUrl;

  await existProduct.save();

  const cacheKey = `product:slug:${slug}`;
  await delCache(cacheKey);
  await delCacheByPrefix("products:list:v1:");

  return successResponse(
    res,
    "Product Updated Successfully",
    200,
    existProduct,
  );
};

export const toggleFeatured: RequestHandler = async (req, res) => {
  const { slug } = req.params;

  const existProduct = await productModel.findOne({ slug });
  if (!existProduct) throw new ApiError(404, "Product not exist");
  if (!existProduct.isActive)
    throw new ApiError(400, "Inactive product can't be featured");

  existProduct.isFeatured = !existProduct.isFeatured;
  await existProduct.save();

  const cacheKey = `product:slug:${slug}`;
  await delCache(cacheKey);
  await delCacheByPrefix("products:list:v1:");
  return successResponse(
    res,
    `Product is now ${existProduct.isFeatured ? "featured" : "not featured"}`,
    200,
    existProduct,
  );
};
