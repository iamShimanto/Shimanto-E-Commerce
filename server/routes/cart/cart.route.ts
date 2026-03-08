import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as cart from "../../controllers/cart/cart.controller";

const router = Router();

router.post("/add", asyncHandler(cart.addToCart));
router.get("/", asyncHandler(cart.getCart));

export default router;
