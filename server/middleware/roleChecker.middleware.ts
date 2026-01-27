import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const roleChecker = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "You are not allowed to access");
    }
    next();
  };
};
