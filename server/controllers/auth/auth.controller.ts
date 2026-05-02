import { type RequestHandler } from "express";
import { isValidEmail } from "../../utils/validation";
import { sendMail } from "../../services/sendMail";
import { generateOtp } from "../../utils/Generator";
import * as templates from "../../services/emailTemp";
import * as tokenHelper from "../../utils/tokenHelper";
import { env } from "../../Config/envConfig";
import * as cloudinaryService from "../../services/CloudinaryServices";
import { ApiError } from "../../utils/ApiError";
import { successResponse } from "../../utils/successResponse";
import redis from "../../Config/redis";
import { delCache, getCache, setCache } from "../../utils/redisCache";
import { prisma } from "../../Config/prisma";
import bcrypt from "bcrypt";

const userPublicSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  address: true,
  avatar: true,
  role: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

const userPasswordSelect = {
  id: true,
  password: true,
} as const;

export const craeteUser: RequestHandler = async (req, res) => {
  const { fullName, email, password, phone, address } = req.body;

  if (!email) throw new ApiError(400, "Email is required");
  if (!isValidEmail(email)) throw new ApiError(400, "Enter a valid email");
  if (!password) throw new ApiError(400, "Password is required");
  if (password.length < 6)
    throw new ApiError(400, "Password must be 6 characters");

  const isExistUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (isExistUser) throw new ApiError(400, "User already Exist!");

  const emailOTP = generateOtp();
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      phone,
      address,
      isVerified: false,
    },
  });

  const otpKey = `otp:email:${email.toLowerCase()}`;
  await redis.set(otpKey, emailOTP, "EX", 120);

  const template = templates.emailTemplate;

  await sendMail(email, emailOTP, "Email Verification Code", template);
  // await user.save();

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

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      isVerified: true,
    },
  });

  const template = templates.successfullVerifyTemplate;

  await redis.del(otpKey);

  await sendMail(email, "Guest", "Email Verification Successfull", template);

  return successResponse(res, "Email verified successfully", 200);
};

export const resendOtp: RequestHandler = async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email))
    throw new ApiError(400, "Invalid Request");

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
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

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) throw new ApiError(400, "Invalid Request");

  const checkPass = await bcrypt.compare(password, user.password);
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

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
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

  const user = await prisma.user.findUnique({
    where: {
      email: cached.email,
    },
  });
  if (!user) throw new ApiError(400, "Invalid or expired reset link");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      email: cached.email,
    },
    data: {
      password: hashedPassword,
    },
  });

  await delCache(tokenKey); // delete cache
  await delCache(`resetpass:cooldown:${cached.email}`);

  return successResponse(res, "User password updated successfully", 200);
};

export const getProfile: RequestHandler = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      address: true,
      avatar: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new ApiError(400, "Invalid Request");

  return successResponse(res, "User Profile", 200, user);
};

export const updateProfile: RequestHandler = async (req, res) => {
  const { fullName, phone, address } = req.body;
  const avatar = req.file;

  const phoneValue =
    typeof phone === "string"
      ? phone.trim()
        ? Number(phone.trim())
        : undefined
      : typeof phone === "number"
        ? phone
        : undefined;

  if (
    typeof phoneValue !== "undefined" &&
    (!Number.isInteger(phoneValue) || phoneValue <= 0)
  ) {
    throw new ApiError(400, "Invalid phone number");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      address: true,
      avatar: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

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
  if (typeof phoneValue !== "undefined") user.phone = phoneValue;
  if (address) user.address = address;

  await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      fullName: user.fullName,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
    },
  });

  return successResponse(res, "User Profile Updated Successfull", 200);
};

export const refreshToken: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies.jwt_refresh || req.headers.authorization;
  if (!refreshToken) throw new ApiError(400, "Missing Refresh token");

  const decoded = tokenHelper.verifyToken(refreshToken);
  if (!decoded) throw new ApiError(400, "Invalid Token");

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
      email: decoded.email,
    },
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

  const where: Record<string, any> = {};
  const and: Record<string, any>[] = [];

  if (role) where.role = role;
  if (typeof isVerified === "boolean") where.isVerified = isVerified;
  if (typeof hasAvatar === "boolean") {
    and.push(
      hasAvatar
        ? {
            AND: [{ avatar: { not: null } }, { avatar: { not: "" } }],
          }
        : {
            OR: [{ avatar: null }, { avatar: "" }],
          },
    );
  }

  if (search) {
    const or: Record<string, any>[] = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
    const phoneNum = Number(search);
    if (Number.isFinite(phoneNum)) or.push({ phone: phoneNum });
    and.push({ OR: or });
  }

  if (and.length) where.AND = and;

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
  const sortOrder = sortOrderRaw === "asc" ? "asc" : "desc";

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder } as Record<string, "asc" | "desc">,
      skip,
      take: limit,
      select: userPublicSelect,
    }),
    prisma.user.count({ where }),
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
  const id = Number((req.params as any).id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: userPublicSelect,
  });
  if (!user) throw new ApiError(404, "User not found");

  return successResponse(res, "User fetched", 200, user);
};

export const verifyUser: RequestHandler = async (req, res) => {
  const id = Number((req.params as any).id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: userPublicSelect,
  });
  if (!user) throw new ApiError(404, "User not found");

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      isVerified: true,
    },
    select: userPublicSelect,
  });

  return successResponse(res, "User verified successfully", 200, updatedUser);
};

export const updateRole: RequestHandler = async (req, res) => {
  const id = Number((req.params as any).id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "Invalid user id");
  }

  const roleFromQuery = req.query.role;
  const roleFromBody = (req.body as any)?.role;
  const roleRaw =
    typeof roleFromBody !== "undefined" ? roleFromBody : roleFromQuery;
  const role = String(roleRaw || "").trim();

  const allowedRoles = new Set(["user", "staff", "admin"]);
  if (!role || !allowedRoles.has(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: userPublicSelect,
  });
  if (!user) throw new ApiError(404, "User not found");

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      role,
    },
    select: userPublicSelect,
  });

  return successResponse(res, "User Role Updated", 200, updatedUser);
};

export const changePassword: RequestHandler = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new password are required");
  }

  const userId = Number(req.user.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ApiError(400, "Invalid Request");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: userPasswordSelect,
  });

  if (!user) throw new ApiError(400, "Invalid Request");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new ApiError(400, "Current password is incorrect");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return successResponse(res, "Password changed successfully", 200);
};
