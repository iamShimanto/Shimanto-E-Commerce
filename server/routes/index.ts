import { Router } from "express";
const router = Router();
import authRoute from "./auth.route";
import categoryRoute from "./category.route";

router.get("/", (req, res) => {
  res.send("Server is running");
});

router.use("/api/auth", authRoute);
router.use("/api/category", categoryRoute);

router.use((req, res) => {
  res.status(404).send({ message: "Api enpoint not found" });
});

export default router;
