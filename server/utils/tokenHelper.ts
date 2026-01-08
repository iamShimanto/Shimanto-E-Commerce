import jwt from "jsonwebtoken";
import { user } from "../models/userSchema";
import { env } from "./envValidation";

export const generateAccessToken = (user: user) => {
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

export const generateRefreshToken = (user: user) => {
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

export const generateResentPassToken = (user: user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      expiresIn: "10m",
    }
  );
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    return decoded;
  } catch (error) {
    return null;
  }
};
