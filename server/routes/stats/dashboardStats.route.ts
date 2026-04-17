import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as statsController from "../../controllers/stats/stats.controller";
import { roleChecker } from "../../middleware/roleChecker.middleware";

const router = Router();

router.get("/dashboard", roleChecker("admin", "staff"), asyncHandler(statsController.getDashboardStats));


export default router;