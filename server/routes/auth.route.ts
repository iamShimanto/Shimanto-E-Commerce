import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import { authMiddleWare } from "../middleware/auth.middleware";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler";

const upload = multer();
const router = Router();

router.post("/register", asyncHandler(auth.craeteUser));
router.post("/verifyotp", asyncHandler(auth.verifyOtp));
router.post("/resendotp", asyncHandler(auth.resendOtp));
router.post("/login", asyncHandler(auth.logInUser));
router.post("/resetpassword", asyncHandler(auth.resetPassword));
router.post(
  "/resetpasswordchange/:token",
  asyncHandler(auth.resetPasswordChange),
);

router.get("/profile", authMiddleWare, asyncHandler(auth.getProfile));

router.post("/refreshtoken", asyncHandler(auth.refreshToken));

router.put(
  "/profile",
  authMiddleWare,
  upload.single("avatar"),
  asyncHandler(auth.updateProfile),
);

export default router;
