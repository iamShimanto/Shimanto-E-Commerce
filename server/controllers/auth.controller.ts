import type { RequestHandler } from "express";
import { isValidEmail } from "../utils/validation.ts";
import { UserModel } from "../models/userSchema.ts";
import { sendMail } from "../services/sendMail.ts";
import { generateOtp } from "../utils/Generator.ts";
import { errorResponse, successResponse } from "../utils/ResponseHandler.ts";
import { emailTemplate } from "../services/emailTemp.ts";

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

    const template = emailTemplate

    sendMail(email, emailOTP, "Email Verification", template);
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
    user.save()

    return successResponse(res, 200, "Email verified successfully");
  } catch (error) {
    return errorResponse(res, 500, "Internal server error", error);
  }
};
