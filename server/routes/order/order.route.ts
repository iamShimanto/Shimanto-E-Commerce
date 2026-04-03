import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as order from "../../controllers/order/order.controller";

const router = Router();

router.post("/checkout", asyncHandler(order.checkout));

export default router;
