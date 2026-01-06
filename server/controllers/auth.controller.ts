import type { RequestHandler } from "express";
import { isValidEmail } from "../utils/validation";
import { UserModel } from "../models/userSchema";
import { sendMail } from "../services/sendMail";
import { generateOtp } from "../utils/Generator";
import { errorResponse, successResponse } from "../utils/ResponseHandler";
import { emailTemplate } from "../services/emailTemp";

export const craeteUser: RequestHandler = async (req, res) => {
  try {
    const { fullName, email, password, phone, address } = req.body;
    if (!email) return errorResponse(res, 400, "Email is Required");
    if (!isValidEmail(email))
      return errorResponse(res, 400, "Enter a valid email");
    if (!password) return errorResponse(res, 400, "Password is required");
    if (password.length < 6)
      return errorResponse(res, 400, "Password must be 6 characters");

    const isExistUser = await UserModel.findOne({ email });
    if (isExistUser) {
      return errorResponse(res, 400, "User already Exist!");
    }

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

    const template = emailTemplate;

    sendMail(email, emailOTP, "Email Verification Code", template);
    user.save();

    successResponse(
      res,
      201,
      "User Registration Successfull and Email verify code sent to your email"
    );
  } catch (error) {
    errorResponse(res, 500, "Internel server error", error);
  }
};

export const verifyOtp: RequestHandler = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return errorResponse(res, 400, "Invalid request");
    }

    const user = await UserModel.findOne({
      email,
      otp: Number(otp),
      otpExpires: { $gt: new Date() },
      isVerified: false,
    });

    if (!user) {
      return errorResponse(res, 400, "Invalid Request");
    }

    user.otp = null;
    user.isVerified = true;
    user.save();

    return successResponse(res, 200, "Email verified successfully");
  } catch (error) {
    return errorResponse(res, 500, "Internal server error", error);
  }
};

export const resendOtp: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email))
      return errorResponse(res, 400, "Invalid Request");

    const user = await UserModel.findOne({
      email,
      isVerified: false,
      otpExpires: { $lt: new Date() },
    });
    if (!user) {
      return errorResponse(res, 400, "Invalid Request");
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 2 * 60 * 1000);
    user.save();
    sendMail(email, otp, "Email Verification Code", emailTemplate);
    return successResponse(
      res,
      200,
      "Email verification code sent successfully"
    );
  } catch (error) {
    return errorResponse(res, 500, "Internal server error", error);
  }
};

export const logInUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return errorResponse(res, 400, "Email is required");
    if (!isValidEmail(email))
      return errorResponse(res, 400, "Enter a valid email");
    if (!password) return errorResponse(res, 400, "Password is required");

    const user = await UserModel.findOne({ email });
    if (!user) return errorResponse(res, 400, "Invalid Request");

    const checkPass = await user.comparePassword(password);
    if (!checkPass) return errorResponse(res, 400, "Invalid Request");

    return successResponse(res, 200, "Login Successful");
  } catch (error) {
    return errorResponse(res, 500, "Internal server error");
  }
};
