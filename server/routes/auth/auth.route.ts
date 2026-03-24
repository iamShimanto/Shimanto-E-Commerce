import { Router } from "express";
import * as auth from "../../controllers/auth/auth.controller";
import { authMiddleWare } from "../../middleware/auth.middleware";
import { roleChecker } from "../../middleware/roleChecker.middleware";
import multer from "multer";
import { asyncHandler } from "../../utils/asyncHandler";
import { rateLimit } from "../../utils/rateLimit";

const upload = multer();
const router = Router();

router.post(
  "/register",
  rateLimit({ limit: 10, windowSec: 300, keyPrefix: "rl:register" }),
  asyncHandler(auth.craeteUser),
);
router.post(
  "/verifyotp",
  rateLimit({ limit: 5, windowSec: 300, keyPrefix: "rl:verifyotp" }),
  asyncHandler(auth.verifyOtp),
);
router.post(
  "/resendotp",
  rateLimit({ limit: 5, windowSec: 300, keyPrefix: "rl:resendotp" }),
  asyncHandler(auth.resendOtp),
);
router.post(
  "/login",
  rateLimit({ limit: 10, windowSec: 300, keyPrefix: "rl:login" }),
  asyncHandler(auth.logInUser),
);

router.post(
  "/logout",
  rateLimit({ limit: 30, windowSec: 300, keyPrefix: "rl:logout" }),
  asyncHandler(auth.logOutUser),
);
router.post(
  "/resetpassword",
  rateLimit({ limit: 5, windowSec: 300, keyPrefix: "rl:resetpassword" }),
  asyncHandler(auth.resetPassword),
);
router.post(
  "/resetpasswordchange/:token",
  rateLimit({ limit: 5, windowSec: 300, keyPrefix: "rl:resetpasschange" }),
  asyncHandler(auth.resetPasswordChange),
);

router.get("/profile", authMiddleWare, asyncHandler(auth.getProfile));

router.post("/refreshtoken", asyncHandler(auth.refreshToken));

router.get(
  "/all-users",
  authMiddleWare,
  roleChecker("admin", "staff"),
  asyncHandler(auth.getAllUsers),
);

router.get(
  "/user/:id",
  authMiddleWare,
  roleChecker("admin", "staff"),
  asyncHandler(auth.getUserById),
);

router.put(
  "/verify-user/:id",
  authMiddleWare,
  roleChecker("admin"),
  asyncHandler(auth.verifyUser),
);

router.put(
  "/profile",
  authMiddleWare,
  upload.single("avatar"),
  asyncHandler(auth.updateProfile),
);

router.put(
  "/update-role/:id",
  authMiddleWare,
  roleChecker("admin"),
  asyncHandler(auth.updateRole),
);

router.put(
  "/change-password",
  authMiddleWare,
  asyncHandler(auth.changePassword),
);

export default router;
