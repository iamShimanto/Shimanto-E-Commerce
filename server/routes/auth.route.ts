import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import { authMiddleWare } from "../middleware/auth.middleware";
import multer from "multer";

const upload = multer();
const router = Router();

router.post("/register", auth.craeteUser);
router.post("/verifyotp", auth.verifyOtp);
router.post("/resendotp", auth.resendOtp);
router.post("/login", auth.logInUser);
router.post("/resetpassword", auth.resetPassword);
router.post("/resetpasswordchange/:token", auth.resetPasswordChange);
router.get("/profile", authMiddleWare, auth.getProfile);
router.post("/refreshtoken", auth.refreshToken)
router.put(
  "/profile",
  authMiddleWare,
  upload.single("avatar"),
  auth.updateProfile,
);

export default router;
