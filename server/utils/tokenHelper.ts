import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "./envValidation";
import { Types } from "mongoose";
import crypto from "crypto"

interface jwtUserPayload {
  _id: Types.ObjectId;
  email: string;
  role: string;
}

export const generateAccessToken = (user: jwtUserPayload) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: "10m",
    }
  );
};

export const generateRefreshToken = (user: jwtUserPayload) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: "15d",
    }
  );
};

export const generateResetPassToken = () => {
  const resetToken = crypto.randomBytes(16).toString("hex");

  const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

  return {resetToken, resetTokenHash}
}

export const verifyResetPassToken = (token: string) => {
  const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

  return resetTokenHash;
}

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  return decoded as JwtPayload;
};
