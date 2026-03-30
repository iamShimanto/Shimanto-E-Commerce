import { Router } from "express";
import { authMiddleWare } from "../../middleware/auth.middleware";
import { roleChecker } from "../../middleware/roleChecker.middleware";
import * as size from "../../controllers/product/size.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/", authMiddleWare, roleChecker("admin"), asyncHandler(size.createSize));
router.get("/", asyncHandler(size.getAllSizes));
router.get("/:id", asyncHandler(size.getSizeById));
router.put("/:id", authMiddleWare, roleChecker("admin"), asyncHandler(size.updateSize));
router.delete("/:id", authMiddleWare, roleChecker("admin"), asyncHandler(size.deleteSize));

export default router;
