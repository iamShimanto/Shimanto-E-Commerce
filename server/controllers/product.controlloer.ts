import { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { uploadToCloudinary } from "../services/CloudinaryServices";
import { successResponse } from "../utils/successResponse";

type MulterFieldFiles = {
  thumbnail?: Express.Multer.File[];
  images?: Express.Multer.File[];
};

export const createProduct: RequestHandler = async (req, res) => {
  const { title, description, category, price, variants, tags, isActive } =
    req.body;
  const files = req.files as MulterFieldFiles | undefined;
  if (!title) throw new ApiError(400, "Product title is required");
  if (!description) throw new ApiError(400, "Product Description is required");
  if (!category) throw new ApiError(400, "Product Category is required");
  if (!price) throw new ApiError(400, "Product Price is required");

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

  console.log(imageUrls);
};
