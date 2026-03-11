import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as cart from "../../controllers/cart/cart.controller";
import { roleChecker } from "../../middleware/roleChecker.middleware";

const router = Router();

router.post("/add", asyncHandler(cart.addToCart));
router.get("/", asyncHandler(cart.getCart));
router.put("/update", asyncHandler(cart.updateCart));
router.delete("/remove", asyncHandler(cart.removeFromCart));
router.delete("/clear", asyncHandler(cart.clearCart));
router.get(
  "/total-carts",
  roleChecker("admin", "stuff"),
  asyncHandler(cart.getAllCart),
);

export default router;
