import { type RequestHandler } from "express";
import { isValidEmail } from "../utils/validation";
import { sendMail } from "../services/sendMail";
import { generateOtp } from "../utils/Generator";
import * as templates from "../services/emailTemp";
import * as tokenHelper from "../utils/tokenHelper";
import { env } from "../Config/envConfig";
import * as cloudinaryService from "../services/CloudinaryServices";
import { ApiError } from "../utils/ApiError";
import { UserModel } from "../models/user.model";
import { successResponse } from "../utils/successResponse";

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
    otp: emailOTP,
    otpExpires: new Date(Date.now() + 2 * 60 * 1000),
  });

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

  const user = await UserModel.findOne({
    email,
    otp: Number(otp),
    otpExpires: { $gt: new Date() },
    isVerified: false,
  });

  if (!user) throw new ApiError(400, "Invalid Request");

  user.otp = null;
  user.isVerified = true;
  await user.save();

  const template = templates.successfullVerifyTemplate;

  await sendMail(
    email,
    user.fullName,
    "Email Verification Successfull",
    template,
  );

  return successResponse(res, "Email verified successfully", 200);
};

export const resendOtp: RequestHandler = async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email))
    throw new ApiError(400, "Invalid Request");

  const user = await UserModel.findOne({
    email,
    isVerified: false,
    otpExpires: { $lt: new Date() },
  });

  if (!user) throw new ApiError(400, "Invalid Request");

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 2 * 60 * 1000);

  await user.save();
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

  return successResponse(res, "Login Successful", 200);
};

export const resetPassword: RequestHandler = async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");
  if (!isValidEmail(email)) throw new ApiError(400, "Enter a valid email");

  const user = await UserModel.findOne({ email });
  if (!user) throw new ApiError(400, "Email is not registered");

  if (
    user.resetPassLinkExpires &&
    user.resetPassLinkExpires.getTime() > Date.now()
  ) {
    throw new ApiError(400, "Password Reset link already sent to your email");
  }

  const { resetToken, resetTokenHash } = tokenHelper.generateResetPassToken();

  const resetPassLink = `${env.CLIENT_URL}/auth/resetpass?sec=${resetToken}`;

  user.resetPassToken = resetTokenHash;
  user.resetPassLinkExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendMail(
    email,
    resetPassLink,
    "Reset Password",
    templates.resetPassTemplate,
  );

  return successResponse(res, "Password reset link sent to your email", 200);
};

export const resetPasswordChange: RequestHandler = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token || Array.isArray(token)) throw new ApiError(400, "Token required");

  const decoded = tokenHelper.verifyResetPassToken(token);
  if (!decoded) throw new ApiError(400, "Invalid Request");

  if (!newPassword) throw new ApiError(400, "New Password required");

  const user = await UserModel.findOne({
    resetPassToken: decoded,
    resetPassLinkExpires: { $gt: new Date() },
  });

  if (!user) throw new ApiError(400, "Invalid Request");

  user.password = newPassword;
  user.resetPassToken = null;
  user.resetPassLinkExpires = null;
  await user.save();

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
