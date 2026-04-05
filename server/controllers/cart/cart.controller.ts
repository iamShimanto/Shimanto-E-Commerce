import { RequestHandler } from "express";
import { ApiError } from "../../utils/ApiError";
import { productModel } from "../../models/product.model";
import { cartModel } from "../../models/cart.model";
import { successResponse } from "../../utils/successResponse";
import { Types } from "mongoose";
// import { delCache, getCache, setCache } from "../../utils/redisCache";
import { UserModel } from "../../models/user.model";

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
  const discountAmount = (productData.price * discountPercentage) / 100;
  const finalPrice = productData.price - discountAmount;
  const subTotal = finalPrice * parsedQuantity;

  const isExistCart = await cartModel.findOne({ user: req.user._id });

  if (isExistCart) {
    const isExistSku = isExistCart.items.some((item) => item.sku == sku);
    if (isExistSku) throw new ApiError(400, "Product already exist in Cart");

    isExistCart.items.push({
      product: productId,
      sku,
      quantity: parsedQuantity,
      subTotal,
    });
    await isExistCart.save()
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
  })
  return successResponse(res, "Product added to cart", 201);
};

export const getCart: RequestHandler = async (req, res) => {
  const cartData = await cartModel
    .findOne({ user: req.user._id })
    .populate("items.product", "title slug price discountPercentage thumbnail")
    .lean();
  if (!cartData) throw new ApiError(404, "Cart not found");
  return successResponse(res, "Cart retrieved successfully", 200, cartData);
};

export const updateCart: RequestHandler = async (req, res) => {
  const { productId, sku, quantity } = req.body;

  if (!productId || sku === undefined || quantity === undefined) {
    throw new ApiError(400, "Required All Fields");
  }

  if (typeof sku !== "string" || !sku.trim()) {
    throw new ApiError(400, "Invalid sku");
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    throw new ApiError(400, "Invalid quantity");
  }

  if (!Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product Id");
  }

  const productData = await productModel.findById(productId);
  if (!productData) {
    throw new ApiError(404, "Product not exist");
  }

  const hasSku = productData.variants?.some((variant) => variant.sku === sku);
  if (!hasSku) {
    throw new ApiError(404, "SKU not exist for this product");
  }

  const discountPercentage = productData.discountPercentage ?? 0;
  const discountAmount = (productData.price * discountPercentage) / 100;
  const finalPrice = productData.price - discountAmount;
  const subTotal = finalPrice * parsedQuantity;

  const cart = await cartModel.findOne({
    user: req.user._id,
    "items.sku": sku,
  });

  if (!cart) {
    throw new ApiError(404, "Cart or Product not found in cart");
  }
  const item = cart.items.find((i) => i.sku === sku);
  if (item) {
    item.quantity = parsedQuantity;
    item.subTotal = subTotal;
  }
  await cart.save();
  return successResponse(res, "Cart updated successfully", 200, cart);
};

export const removeFromCart: RequestHandler = async (req, res) => {
  const { productId, sku } = req.body;

  if (!productId || sku === undefined) {
    throw new ApiError(400, "Required All Fields");
  }

  if (typeof sku !== "string" || !sku.trim()) {
    throw new ApiError(400, "Invalid sku");
  }
  if (!Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid Product Id");
  }
  const cart = await cartModel.findOne({
    user: req.user._id,
    "items.sku": sku,
  });

  if (!cart) {
    throw new ApiError(404, "Cart or Product not found in cart");
  }
  cart.items = cart.items.filter((i) => i.sku !== sku);
  await cart.save();
  return successResponse(res, "Product removed from cart", 200, cart);
};

export const clearCart: RequestHandler = async (req, res) => {
  const cart = await cartModel.findOneAndDelete({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }
  return successResponse(res, "Cart cleared successfully", 200);
};

export const getAllCart: RequestHandler = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = (req.query.search as string) || "";

  const skip = (page - 1) * limit;

  const trimmedSearch = String(search || "").trim();

  let cartFilter: Record<string, unknown> = {};

  if (trimmedSearch) {
    const matchingUsers = await UserModel.find(
      {
        $or: [
          { fullName: { $regex: trimmedSearch, $options: "i" } },
          { email: { $regex: trimmedSearch, $options: "i" } },
        ],
      },
      { _id: 1 },
    ).lean();

    const userIds = matchingUsers.map((u) => u._id);
    cartFilter = userIds.length
      ? { user: { $in: userIds } }
      : { user: { $in: [] } };
  }

  const [carts, total] = await Promise.all([
    cartModel
      .find(cartFilter)
      .populate({
        path: "user",
        select: "fullName email",
      })
      .populate(
        "items.product",
        "title slug price discountPercentage thumbnail",
      )
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    cartModel.countDocuments(cartFilter),
  ]);

  return successResponse(res, "All carts retrieved successfully", 200, {
    data: carts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
};
