import { RequestHandler } from "express";
import { errorResponse } from "../utils/ResponseHandler";
import jwt from "jsonwebtoken";
import { env } from "../utils/envValidation";

export const authMiddleWare: RequestHandler = (req, res, next) => {
  try {
    const accessToken = req.cookies.jwt_access;

    if(!accessToken){
        return errorResponse(res, 400, "Invalid Request")
    }

    const decoded = jwt.verify(accessToken, env.JWT_SECRET)
    if(!decoded) return errorResponse(res, 400, "Invalid Request")


    // req.user = decoded



  } catch (error) {
    return errorResponse(res, 400, "Invalid Request");
  }
};
