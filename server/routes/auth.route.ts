import { Router } from "express";
import * as auth from "../controllers/auth.controller";

const router = Router();

router.post("/register", auth.craeteUser);
router.post("/verifyotp", auth.verifyOtp);
router.post("/resendotp", auth.resendOtp);
router.post("/login", auth.logInUser);
router.post("/resetpassword", auth.resetPassword)
router.post("/resetpasswordchange/:token", auth.resetPasswordChange)

export default router;
