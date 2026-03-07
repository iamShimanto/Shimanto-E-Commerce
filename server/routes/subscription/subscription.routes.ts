import { Router } from "express";
import * as subscription from "../../controllers/subscription/subscription.controllers";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/create", asyncHandler(subscription.createSubscription));
router.get("/get", asyncHandler(subscription.getSubscription));
router.delete("/delete", asyncHandler(subscription.deleteSubscription));

export default router;
