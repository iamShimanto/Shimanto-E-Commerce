import { Router } from "express";
const router = Router();
import authRoute from "./auth.route";
import categoryRoute from "./category.route";
import productRoute from "./product.route"

router.get("/", (req, res) => {
  res.send("Server is running");
});

router.use("/api/v1/auth", authRoute);
router.use("/api/v1/category", categoryRoute);
router.use("/api/v1/product", productRoute)

router.use((req, res) => {
  res.status(404).send({ message: "Api enpoint not found" });
});

export default router;
