import { Router } from "express";
const router = Router();
import authRoute from "./auth.route";

router.get("/", (req, res) => {
  res.send("Server is running");
});

router.use("/api/auth", authRoute);

router.use((req, res) => {
  res.status(404).send({ message: "Api enpoint not found" });
});

export default router;
