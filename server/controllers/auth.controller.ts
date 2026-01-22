import { type RequestHandler } from "express";
import { isValidEmail } from "../utils/validation";
import { UserModel } from "../models/userSchema";
import { sendMail } from "../services/sendMail";
import { generateOtp } from "../utils/Generator";
import { responseHandler } from "../utils/ResponseHandler";
import * as templates from "../services/emailTemp";
import * as tokenHelper from "../utils/tokenHelper";
import { env } from "../Config/envConfig";
import * as cloudinaryService from "../services/CloudinaryServices";

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

    const template = templates.emailTemplate;

    sendMail(email, emailOTP, "Email Verification Code", template);
    user.save();

    responseHandler.success(
      res,
      201,
      "User Registration Successfull and Email verify code sent to your email",
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

    const template = templates.successfullVerifyTemplate;

    sendMail(email, user.fullName, "Email Verification Successfull", template);

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
    sendMail(email, otp, "Email Verification Code", templates.emailTemplate);
    return responseHandler.success(
      res,
      200,
      "Email verification code sent successfully",
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
    if (!password)
      return responseHandler.error(res, 400, "Password is required");

    const user = await UserModel.findOne({ email });
    if (!user) return responseHandler.error(res, 400, "Invalid Request");

    const checkPass = await user.comparePassword(password);
    if (!checkPass) return responseHandler.error(res, 400, "Invalid Request");

    if (!user.isVerified)
      return responseHandler.error(res, 400, "Email not verified");

    const accessToken = tokenHelper.generateAccessToken(user);
    const refreshToken = tokenHelper.generateRefreshToken(user);

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
    if (!user)
      return responseHandler.error(res, 400, "Email is not registered");

    if (
      user.resetPassLinkExpires &&
      user.resetPassLinkExpires.getTime() > Date.now()
    ) {
      return responseHandler.error(
        res,
        400,
        "Password Reset link already sent to your email",
      );
    }

    const { resetToken, resetTokenHash } = tokenHelper.generateResetPassToken();

    const resetPassLink = `${env.CLIENT_URL}/auth/resetpass?sec=${resetToken}`;

    user.resetPassToken = resetTokenHash;
    user.resetPassLinkExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    sendMail(
      email,
      resetPassLink,
      "Reset Password",
      templates.resetPassTemplate,
    );

    return responseHandler.success(
      res,
      200,
      "Password reset link sent to your email",
    );
  } catch (error) {
    return responseHandler.error(res, 500, "Internal server error", error);
  }
};

export const resetPasswordChange: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || Array.isArray(token))
      return responseHandler.error(res, 400, "Token required");

    const decoded = tokenHelper.verifyResetPassToken(token);
    if (!decoded) return responseHandler.error(res, 400, "Invalid Request");

    if (!newPassword)
      return responseHandler.error(res, 400, "New Password required");

    const user = await UserModel.findOne({
      resetPassToken: decoded,
      resetPassLinkExpires: { $gt: new Date() },
    });
    if (!user) return responseHandler.error(res, 400, "Invalid Request");

    user.password = newPassword;
    user.resetPassToken = null;
    user.resetPassLinkExpires = null;
    user.save();

    return responseHandler.success(
      res,
      200,
      "User password updated successfully",
    );
  } catch (error) {
    responseHandler.error(res, 500, "Internal server error", error);
  }
};

export const getProfile: RequestHandler = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select(
      "-password -otp -otpExpires -updatedAt",
    );
    if (!user) return responseHandler.error(res, 400, "Invalid Request");

    responseHandler.success(res, 200, "User Profile", user);
  } catch (error) {
    responseHandler.error(res, 500, "Internal server error", error);
  }
};

export const updateProfile: RequestHandler = async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    const avatar = req.file;

    const user = await UserModel.findById(req.user._id).select(
      "-password -otp -otpExpires -resetPassToken -resetPassLinkExpires",
    );
    if (!user) return responseHandler.error(res, 400, "Invalid Request");

    if (avatar) {
      const publicId = user?.avatar?.split("/").pop()?.split(".")[0];
      if (publicId) {
        cloudinaryService.destroyFromCloudinary(`avatar/${publicId}`);
      }

      const imageRes = await cloudinaryService.uploadToCloudinary(
        avatar,
        "avatar",
      );
      if (user) {
        user.avatar = imageRes.secure_url;
      }
    }
    if (user && fullName) user.fullName = fullName;
    if (user && phone) user.phone = phone;
    if (user && address) user.address = address;
    user.save();

    return responseHandler.success(
      res,
      200,
      "User Profile Updated Successfull",
    );
  } catch (error) {
    responseHandler.error(res, 500, "Internal server error", error);
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies.jwt_refresh || req.headers.authorization;
    if (!refreshToken)
      return responseHandler.error(res, 400, "Missing Refresh token");

    const decoded = tokenHelper.verifyToken(refreshToken);
    if (!decoded) return responseHandler.error(res, 400, "Invalid Token");

    const user = await UserModel.findOne({
      _id: decoded._id,
      email: decoded.email,
    });
    if (!user) return responseHandler.error(res, 400, "Invalid Request");

    const accessToken = tokenHelper.generateAccessToken(decoded);

    const isProd = env.NODE_ENV === "production";

    res
      .cookie("jwt_access", accessToken, {
        httpOnly: isProd,
        secure: isProd,
        maxAge: 600000,
      })
      .send({ success: true });
  } catch (error) {
    responseHandler.error(res, 500, "Internal server error", error);
  }
};
