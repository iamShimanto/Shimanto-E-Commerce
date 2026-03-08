import { RequestHandler } from "express";
import { ApiError } from "../../utils/ApiError";
import { productModel } from "../../models/product.model";
import { cartModel } from "../../models/cart.model";
import { successResponse } from "../../utils/successResponse";
import { Types } from "mongoose";
import { delCache } from "../../utils/redisCache";

export const addToCart: RequestHandler = async (req, res) => {
  const { productId, sku, quantity } = req.body;

  if (!productId || sku === undefined || quantity === undefined)
    throw new ApiError(400, "Required All Fields");

  if (typeof sku !== "string" || !sku.trim())
    throw new ApiError(400, "Invalid sku");

  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1)
    throw new ApiError(400, "Invalid quantity");

  if (!Types.ObjectId.isValid(productId))
    throw new ApiError(400, "Invalid Product Id");

  const productData = await productModel.findById(productId);
  if (!productData) throw new ApiError(404, "Product not exist");

  const hasSku = productData.variants?.some((variant) => variant.sku === sku);
  if (!hasSku) throw new ApiError(404, "SKU not exist for this product");

  const discountPercentage = productData.discountPercentage ?? 0;
  const discountAmout = (productData.price * discountPercentage) / 100;
  const subTotal = discountAmout * parsedQuantity;

  const isExistCart = await cartModel.findOne({ user: req.user._id });

  const cacheKey = `cart:${req.user._id}`;

  if (isExistCart) {
    const isExistSku = isExistCart.items.some((item) => item.sku == sku);
    if (isExistSku) throw new ApiError(400, "Product already exist in Cart");

    isExistCart.items.push({
      product: productId,
      sku,
      quantity: parsedQuantity,
      subTotal,
    });
    await isExistCart.save();
    await delCache(cacheKey);
    return successResponse(res, "Product added to cart");
  }

  await cartModel.create({
    user: req.user._id,
    items: [
      {
        product: productId,
        sku,
        quantity: parsedQuantity,
        subTotal,
      },
    ],
  });
  await delCache(cacheKey);
  return successResponse(res, "Product added to cart", 201);
};

export const getCart: RequestHandler = async (req, res) => {};
