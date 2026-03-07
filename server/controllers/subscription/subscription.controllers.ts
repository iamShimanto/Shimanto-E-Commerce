import { RequestHandler } from "express";
import { SubscriptionModel } from "../../models/subscription/subscription.model";
import { ApiError } from "../../utils/ApiError";
import { successResponse } from "../../utils/successResponse";
import { isValidEmail } from "../../utils/validation";

export const createSubscription: RequestHandler = async (req, res) => {
  const emailRaw = req.body?.email;
  const email =
    typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";

  if (!email) throw new ApiError(400, "Email is required");
  if (!isValidEmail(email)) throw new ApiError(400, "Invalid email address");

  const exists = await SubscriptionModel.findOne({ email }).lean();
  if (exists) {
    return successResponse(res, "Already subscribed", 200, {
      email,
      subscribed: true,
    });
  }

  const created = await SubscriptionModel.create({ email });

  return successResponse(res, "Subscribed successfully", 201, {
    id: created._id,
    email: created.email,
    createdAt: created.createdAt,
  });
};

export const getSubscription: RequestHandler = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const searchRaw =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const skip = (page - 1) * limit;

  const filter = searchRaw
    ? {
        email: {
          $regex: searchRaw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          $options: "i",
        },
      }
    : {};

  const [items, total] = await Promise.all([
    SubscriptionModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SubscriptionModel.countDocuments(filter),
  ]);

  return successResponse(res, "Subscriptions fetched", 200, {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
};

export const deleteSubscription: RequestHandler = async (req, res) => {
  const emailFromBody =
    typeof req.body?.email === "string" ? req.body.email : undefined;
  const emailFromQuery =
    typeof req.query?.email === "string" ? req.query.email : undefined;

  const email = (emailFromBody ?? emailFromQuery ?? "").trim().toLowerCase();
  if (!email) throw new ApiError(400, "Email is required");
  if (!isValidEmail(email)) throw new ApiError(400, "Invalid email address");

  const deleted = await SubscriptionModel.findOneAndDelete({ email }).lean();
  if (!deleted) throw new ApiError(404, "Subscription not found");

  return successResponse(res, "Subscription deleted", 200, {
    email,
    deleted: true,
  });
};
