import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../Config/envConfig";
import { ApiError } from "../utils/ApiError";

export const authMiddleWare: RequestHandler = (req, res, next) => {
  const accessToken = req.cookies?.jwt_access;

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const decoded = jwt.verify(accessToken, env.JWT_SECRET);

    if (!decoded || typeof decoded !== "object") {
      throw new ApiError(401, "Unauthorized");
    }

    req.user = decoded as any; 
    return next();
  } catch {
    throw new ApiError(401, "Unauthorized");
  }
};
