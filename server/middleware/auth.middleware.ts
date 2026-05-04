import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../Config/envConfig";
import { ApiError } from "../utils/ApiError";
import type { jwtUserPayload } from "../utils/tokenHelper";

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

    const payload = decoded as Partial<jwtUserPayload>;
    const id = Number(payload.id);
    const email = typeof payload.email === "string" ? payload.email : "";
    const role = typeof payload.role === "string" ? payload.role : "";

    if (!Number.isInteger(id) || id < 1 || !email || !role) {
      throw new ApiError(401, "Unauthorized");
    }

    req.user = { id, email, role };
    return next();
  } catch {
    throw new ApiError(401, "Unauthorized");
  }
};
