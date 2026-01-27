import { Router } from "express";
import { authMiddleWare } from "../middleware/auth.middleware";
import { roleChecker } from "../middleware/roleChecker.middleware";
import * as category from "../controllers/category.controller";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler";
const upload = multer();

const router = Router();

router.post(
  "/create",
  authMiddleWare,
  roleChecker("admin", "stuff"),
  upload.single("thumbnail"),
  asyncHandler(category.create),
);
router.get("/all", asyncHandler(category.getAllCategory));

export default router;
