import { RequestHandler } from "express";
import { responseHandler } from "../utils/ResponseHandler";
import jwt from "jsonwebtoken";
import { env } from "../utils/envValidation";

export const authMiddleWare: RequestHandler = (req, res, next) => {
  try {
    const accessToken = req.cookies.jwt_access;

    if (!accessToken) {
      return responseHandler.error(res, 400, "Invalid Request");
    }

    const decoded = jwt.verify(accessToken, env.JWT_SECRET);
    if (!decoded) return responseHandler.error(res, 400, "Invalid Request");

    req.user = decoded;

    next();
  } catch (error) {
    return responseHandler.error(res, 400, "Invalid Request");
  }
};
