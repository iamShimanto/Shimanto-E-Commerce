import { Router } from "express";
import * as auth from "../controllers/auth.controller.ts";

const router = Router();

router.post("/register", auth.craeteUser);

export default router;
