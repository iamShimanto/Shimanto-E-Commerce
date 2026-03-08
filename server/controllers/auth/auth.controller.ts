import { type RequestHandler } from "express";
import { isValidEmail } from "../../utils/validation";
import { sendMail } from "../../services/sendMail";
import { generateOtp } from "../../utils/Generator";
import * as templates from "../../services/emailTemp";
import * as tokenHelper from "../../utils/tokenHelper";
import { env } from "../../Config/envConfig";
import * as cloudinaryService from "../../services/CloudinaryServices";
import { ApiError } from "../../utils/ApiError";
import { UserModel } from "../../models/user.model";
import { successResponse } from "../../utils/successResponse";
import redis from "../../Config/redis";
import { delCache, getCache, setCache } from "../../utils/redisCache";
import { Types } from "mongoose";

export const craeteUser: RequestHandler = async (req, res) => {
  const { fullName, email, password, phone, address } = req.body;

  if (!email) throw new ApiError(400, "Email is required");
  if (!isValidEmail(email)) throw new ApiError(400, "Enter a valid email");
  if (!password) throw new ApiError(400, "Password is required");
  if (password.length < 6)
    throw new ApiError(400, "Password must be 6 characters");

  const isExistUser = await UserModel.findOne({ email });
  if (isExistUser) throw new ApiError(400, "User already Exist!");

  const emailOTP = generateOtp();

  const user = new UserModel({
    fullName,
    email,
    password,
    phone,
    address,
    isVerified: false,
  });

  const otpKey = `otp:email:${email.toLowerCase()}`;
  await redis.set(otpKey, emailOTP, "EX", 120);

  const template = templates.emailTemplate;

  await sendMail(email, emailOTP, "Email Verification Code", template);
  await user.save();

  return successResponse(
    res,
    "User Registration Successfull and Email verify code sent to your email",
    201,
  );
};

export const verifyOtp: RequestHandler = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new ApiError(400, "Invalid request");

  const otpKey = `otp:email:${email.toLowerCase()}`;
  const savedOtp = await redis.get(otpKey);

  if (!savedOtp) throw new ApiError(400, "OTP Expired or invalid");
  if (savedOtp !== String(otp)) throw new ApiError(400, "OTP is not correct");

  await UserModel.updateOne({ email }, { $set: { isVerified: true } });

  const template = templates.successfullVerifyTemplate;

  await redis.del(otpKey);

  await sendMail(email, "Guest", "Email Verification Successfull", template);

  return successResponse(res, "Email verified successfully", 200);
};

export const resendOtp: RequestHandler = async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email))
    throw new ApiError(400, "Invalid Request");

  const user = await UserModel.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");
  if (user.isVerified) throw new ApiError(400, "Email already verified");

  const otpKey = `otp:email:${email.toLowerCase()}`;
  const coolDownKey = `otp:cooldown:${email.toLowerCase()}`;

  const onCoolDown = await redis.get(coolDownKey);
  if (onCoolDown) {
    throw new ApiError(429, "Please wait 30 seconds before requesting again");
  }
  const otp = generateOtp();

  await redis.set(otpKey, String(otp), "EX", 120);

  await redis.set(coolDownKey, "1", "EX", 30);

  await sendMail(
    email,
    otp,
    "Email Verification Code",
    templates.emailTemplate,
  );

  return successResponse(res, "Email verification code sent successfully", 200);
};

export const logInUser: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email) throw new ApiError(400, "Email is required");
  if (!isValidEmail(email)) throw new ApiError(400, "Enter a valid email");
  if (!password) throw new ApiError(400, "Password is required");

  const user = await UserModel.findOne({ email });
  if (!user) throw new ApiError(400, "Invalid Request");

  const checkPass = await user.comparePassword(password);
  if (!checkPass) throw new ApiError(400, "Invalid Request");

  if (!user.isVerified) throw new ApiError(400, "Email not verified");

  const accessToken = tokenHelper.generateAccessToken(user);
  const refreshToken = tokenHelper.generateRefreshToken(user);

  const isProd = env.NODE_ENV === "production";

  res.cookie("jwt_access", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 600000,
  });

  res.cookie("jwt_refresh", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 1296000000,
  });

  return successResponse(res, "Login Successful", 200, {
    name: user.fullName,
    email: user.email,
    role: user.role,
  });
};

export const resetPassword: RequestHandler = async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");
  if (!isValidEmail(email)) throw new ApiError(400, "Enter a valid email");

  const user = await UserModel.findOne({ email });
  if (!user) {
    return successResponse(
      res,
      "If this email is registered, a reset link has been sent.",
      200,
    );
  }

  const cooldownKey = `resetpass:cooldown:${email}`;
  const hasCooldown = await getCache(cooldownKey);

  if (hasCooldown) {
    throw new ApiError(
      429,
      "Password reset link already sent. Please check your email or try again later.",
    );
  }

  const { resetToken, resetTokenHash } = tokenHelper.generateResetPassToken();

  const RESET_TTL = 10 * 60;

  await setCache(`resetpass:token:${resetTokenHash}`, { email }, RESET_TTL);
  await setCache(cooldownKey, { email, createdAt: Date.now() }, RESET_TTL);

  const resetPassLink = `${env.CLIENT_URL1}/auth/resetpass?sec=${resetToken}`;

  await sendMail(
    email,
    resetPassLink,
    "Reset Password",
    templates.resetPassTemplate,
  );

  return successResponse(
    res,
    "If this email is registered, a reset link has been sent.",
    200,
  );
};

export const resetPasswordChange: RequestHandler = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token || Array.isArray(token)) throw new ApiError(400, "Token required");
  if (!newPassword) throw new ApiError(400, "New Password required");

  const tokenHash = tokenHelper.verifyResetPassToken(token);
  if (!tokenHash) throw new ApiError(400, "Invalid or expired reset link");

  const tokenKey = `resetpass:token:${tokenHash}`;
  const cached = await getCache<{ email: string }>(tokenKey);

  if (!cached || !cached.email) {
    throw new ApiError(400, "Invalid or expired reset link");
  }

  const user = await UserModel.findOne({ email: cached.email });
  if (!user) throw new ApiError(400, "Invalid or expired reset link");

  user.password = newPassword;
  await user.save();

  await delCache(tokenKey); // delete cache
  await delCache(`resetpass:cooldown:${cached.email}`);

  return successResponse(res, "User password updated successfully", 200);
};

export const getProfile: RequestHandler = async (req, res) => {
  const user = await UserModel.findById(req.user._id).select(
    "-password -otp -otpExpires -updatedAt",
  );

  if (!user) throw new ApiError(400, "Invalid Request");

  return successResponse(res, "User Profile", 200, user);
};

export const updateProfile: RequestHandler = async (req, res) => {
  const { fullName, phone, address } = req.body;
  const avatar = req.file;

  const user = await UserModel.findById(req.user._id).select(
    "-password -otp -otpExpires -resetPassToken -resetPassLinkExpires",
  );

  if (!user) throw new ApiError(400, "Invalid Request");

  if (avatar) {
    const publicId = user?.avatar?.split("/").pop()?.split(".")[0];
    if (publicId) {
      await cloudinaryService.destroyFromCloudinary(`avatar/${publicId}`);
    }

    const imageRes = await cloudinaryService.uploadToCloudinary(
      avatar,
      "avatar",
    );
    user.avatar = imageRes.secure_url;
  }

  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  await user.save();

  return successResponse(res, "User Profile Updated Successfull", 200);
};

export const refreshToken: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies.jwt_refresh || req.headers.authorization;
  if (!refreshToken) throw new ApiError(400, "Missing Refresh token");

  const decoded = tokenHelper.verifyToken(refreshToken);
  if (!decoded) throw new ApiError(400, "Invalid Token");

  const user = await UserModel.findOne({
    _id: decoded._id,
    email: decoded.email,
  });

  if (!user) throw new ApiError(400, "Invalid Request");

  const accessToken = tokenHelper.generateAccessToken(decoded);

  const isProd = env.NODE_ENV === "production";

  res.cookie("jwt_access", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 600000,
  });

  return res.status(200).json({ success: true });
};

export const logOutUser: RequestHandler = async (req, res) => {
  const isProd = env.NODE_ENV === "production";

  res.cookie("jwt_access", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    expires: new Date(0),
  });

  res.cookie("jwt_refresh", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    expires: new Date(0),
  });

  return successResponse(res, "Logout Successful", 200);
};

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const getAllUsers: RequestHandler = async (req, res) => {
  const pageRaw = Number(req.query.page ?? 1);
  const limitRaw = Number(req.query.limit ?? 10);

  const page = Number.isFinite(pageRaw) ? Math.max(1, Math.floor(pageRaw)) : 1;
  const limit = Number.isFinite(limitRaw)
    ? Math.min(100, Math.max(1, Math.floor(limitRaw)))
    : 10;

  const skip = (page - 1) * limit;

  const search = String(req.query.search ?? req.query.q ?? "").trim();
  const role = req.query.role ? String(req.query.role).trim() : "";

  const isVerifiedRaw = req.query.isVerified ?? req.query.verified;
  const isVerified =
    isVerifiedRaw === "true"
      ? true
      : isVerifiedRaw === "false"
        ? false
        : undefined;

  const hasAvatarRaw = req.query.hasAvatar;
  const hasAvatar =
    hasAvatarRaw === "true"
      ? true
      : hasAvatarRaw === "false"
        ? false
        : undefined;

  const filter: Record<string, any> = {};

  if (role) filter.role = role;
  if (typeof isVerified === "boolean") filter.isVerified = isVerified;
  if (typeof hasAvatar === "boolean") {
    filter.avatar = hasAvatar
      ? { $exists: true, $ne: "" }
      : { $in: [null, ""] };
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    const or: any[] = [{ fullName: regex }, { email: regex }];
    const phoneNum = Number(search);
    if (Number.isFinite(phoneNum)) or.push({ phone: phoneNum });
    filter.$or = or;
  }

  const allowedSortFields = new Set([
    "createdAt",
    "fullName",
    "email",
    "role",
    "isVerified",
  ]);

  const sortByRaw = String(req.query.sortBy ?? "createdAt");
  const sortBy = allowedSortFields.has(sortByRaw) ? sortByRaw : "createdAt";
  const sortOrderRaw = String(req.query.sortOrder ?? "desc").toLowerCase();
  const sortOrder = sortOrderRaw === "asc" ? 1 : -1;

  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select("-password -__v")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  return successResponse(res, "Users fetched", 200, {
    items: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getUserById: RequestHandler = async (req, res) => {
  const id = String((req.params as any).id);
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await UserModel.findById(id).select("-password -__v");
  if (!user) throw new ApiError(404, "User not found");

  return successResponse(res, "User fetched", 200, user);
};

export const verifyUser: RequestHandler = async (req, res) => {
  const id = String((req.params as any).id);
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await UserModel.findByIdAndUpdate(
    id,
    { $set: { isVerified: true } },
    { new: true },
  ).select("-password -__v");
  if (!user) throw new ApiError(404, "User not found");

  return successResponse(res, "User verified successfully", 200, user);
};

export const updateRole: RequestHandler = async (req, res) => {
  const id = String((req.params as any).id);

  if (!Types.ObjectId.isValid(id as any)) {
    throw new ApiError(400, "Invalid user id");
  }

  const roleFromQuery = req.query.role;
  const roleFromBody = (req.body as any)?.role;
  const roleRaw =
    typeof roleFromBody !== "undefined" ? roleFromBody : roleFromQuery;
  const role = String(roleRaw || "").trim();

  const allowedRoles = new Set(["user", "stuff", "admin"]);
  if (!role || !allowedRoles.has(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await UserModel.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true },
  ).select("-password -__v");

  if (!user) throw new ApiError(404, "User not found");

  return successResponse(res, "User Role Updated", 200, user);
};

export const changePassword: RequestHandler = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new password are required");
  }

  const user = await UserModel.findById(req.user._id);
  if (!user) throw new ApiError(400, "Invalid Request");
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(400, "Current password is incorrect");
  user.password = newPassword;
  await user.save();
  return successResponse(res, "Password changed successfully", 200);
};
