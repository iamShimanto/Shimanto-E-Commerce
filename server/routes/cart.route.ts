import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as cart from "../controllers/cart.controller";

const router = Router();

router.post("/add", asyncHandler(cart.addToCart));

export default router;
