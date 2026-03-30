import { Router } from "express";
const router = Router();
import authRoute from "./auth/auth.route";
import categoryRoute from "./category/category.route";
import productRoute from "./product/product.route";
import cartRoute from "./cart/cart.route";
import { rateLimit } from "../utils/rateLimit";
import { authMiddleWare } from "../middleware/auth.middleware";
import settingsRoute from "./settings/settings.route";
import subscriptionRoute from "./subscription/subscription.routes";
import sizeRoute from "./product/size.route";

router.use(
  rateLimit({ limit: 1000, windowSec: 15 * 60, keyPrefix: "rl:global" }),
);

router.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

router.use("/api/v1/auth", authRoute);
router.use("/api/v1/category", categoryRoute);
router.use("/api/v1/product", productRoute);
router.use("/api/v1/size", sizeRoute);
router.use("/api/v1/cart", authMiddleWare, cartRoute);
router.use("/api/v1/settings", authMiddleWare, settingsRoute);
router.use("/api/v1/subscription", subscriptionRoute);

router.use((req, res) => {
  res.status(404).send({ message: "Api enpoint not found" });
});

export default router;
