import type { RequestHandler } from "express";
import { isValidEmail } from "../utils/validation";
import { UserModel } from "../models/userSchema";
import { sendMail } from "../services/sendMail";
import { generateOtp } from "../utils/Generator";
import { responseHandler } from "../utils/ResponseHandler";
import { emailTemplate, resetPassTemplate } from "../services/emailTemp";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResentPassToken,
  verifyToken,
} from "../utils/tokenHelper";
import { env } from "../utils/envValidation";

export const craeteUser: RequestHandler = async (req, res) => {
  try {
    const { fullName, email, password, phone, address } = req.body;
    if (!email) return responseHandler.error(res, 400, "Email is required");
    if (!isValidEmail(email))
      return responseHandler.error(res, 400, "Enter a valid email");
    if (!password)
      return responseHandler.error(res, 400, "Password is required");
    if (password.length < 6)
      return responseHandler.error(res, 400, "Password must be 6 characters");

    const isExistUser = await UserModel.findOne({ email });
    if (isExistUser) {
      return responseHandler.error(res, 400, "User already Exist!");
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

    responseHandler.success(
      res,
      201,
      "User Registration Successfull and Email verify code sent to your email"
    );
  } catch (error) {
    responseHandler.error(res, 500, "Internel server error", error);
  }
};

export const verifyOtp: RequestHandler = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return responseHandler.error(res, 400, "Invalid request");
    }

    const user = await UserModel.findOne({
      email,
      otp: Number(otp),
      otpExpires: { $gt: new Date() },
      isVerified: false,
    });

    if (!user) {
      return responseHandler.error(res, 400, "Invalid Request");
    }

    user.otp = null;
    user.isVerified = true;
    user.save();

    return responseHandler.error(res, 200, "Email verified successfully");
  } catch (error) {
    return responseHandler.error(res, 500, "Internal server error", error);
  }
};

export const resendOtp: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email))
      return responseHandler.error(res, 400, "Invalid Request");

    const user = await UserModel.findOne({
      email,
      isVerified: false,
      otpExpires: { $lt: new Date() },
    });
    if (!user) {
      return responseHandler.error(res, 400, "Invalid Request");
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 2 * 60 * 1000);
    user.save();
    sendMail(email, otp, "Email Verification Code", emailTemplate);
    return responseHandler.success(
      res,
      200,
      "Email verification code sent successfully"
    );
  } catch (error) {
    return responseHandler.error(res, 500, "Internal server error", error);
  }
};

export const logInUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return responseHandler.error(res, 400, "Email is required");
    if (!isValidEmail(email))
      return responseHandler.error(res, 400, "Enter a valid email");
    if (!password) return responseHandler.error(res, 400, "Password is required");

    const user = await UserModel.findOne({ email });
    if (!user) return responseHandler.error(res, 400, "Invalid Request");

    const checkPass = await user.comparePassword(password);
    if (!checkPass) return responseHandler.error(res, 400, "Invalid Request");

    if (!user.isVerified) return responseHandler.error(res, 400, "Email not verified");

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const isProd = env.NODE_ENV === "production";

    res.cookie("jwt_access", accessToken, {
      httpOnly: isProd,
      secure: isProd,
      maxAge: 600000,
    });

    res.cookie("jwt_refresh", refreshToken, {
      httpOnly: isProd,
      secure: isProd,
      maxAge: 1296000000,
    });

    return responseHandler.success(res, 200, "Login Successful");
  } catch (error) {
    return responseHandler.error(res, 500, "Internal server error");
  }
};

export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return responseHandler.error(res, 400, "Email is required");
    if (!isValidEmail(email))
      return responseHandler.error(res, 400, "Enter a valid email");

    const user = await UserModel.findOne({ email });
    if (!user) return responseHandler.error(res, 400, "Email is not registered");

    if (
      user.resetPassLinkExpires &&
      user.resetPassLinkExpires.getTime() > Date.now()
    ) {
      return responseHandler.error(
        res,
        400,
        "Password Reset link already sent to your email"
      );
    }

    const resetPassToken = generateResentPassToken(user);

    const resetPassLink = `${env.CLIENT_URL}/resetpass?sec=${resetPassToken}`;

    user.resetPassLinkExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    sendMail(email, resetPassLink, "Reset Password Link", resetPassTemplate);

    return responseHandler.success(res, 200, "Password reset link sent to your email");
  } catch (error) {
    return responseHandler.error(res, 500, "Internal server error", error);
  }
};


export const resetPasswordChange : RequestHandler = async (req , res )=>{
  try {
    const {token} = req.params
    const {newPassword} = req.body
    
    if(!token) return responseHandler.error(res, 400, "Token required")
    const decoded = await verifyToken(token)
    if(!decoded) return responseHandler.error(res, 400, "Invalid Request")
    if(!newPassword) return responseHandler.error(res, 400, "")
    
    const user = await UserModel.findOne({email:decoded.email})
    if(!user) return responseHandler.error(res, 400, "Invalid Request")
    
    user.password = newPassword
    user.save()

    return responseHandler.success(res, 200, "User password updated successfully")
  } catch (error) {
    responseHandler.error(res, 500, "Internal server error", error)
  }
}
