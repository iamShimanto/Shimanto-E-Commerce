import { Router } from "express";
import { authMiddleWare } from "../middleware/auth.middleware";
import { roleChecker } from "../middleware/roleChecker.middleware";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler";
import * as product from "../controllers/product.controlloer"
const upload = multer();

const router = Router();

router.post(
  "/create",
  authMiddleWare,
  roleChecker("admin", "stuff"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 6 },
  ]),
  asyncHandler(product.createProduct)
);

export default router;
