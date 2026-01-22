import dotenv from "dotenv";
dotenv.config();
import { cleanEnv, email, port, str, url } from "envalid";

export const env = cleanEnv(process.env, {
  PORT: port({ default: 5000 }),
  MONGODB_URI: str(),
  EMAIL_USER: email(),
  EMAIL_PASS: str(),
  NODE_ENV: str({ choices: ["development", "production"] }),
  JWT_SECRET: str(),
  CLIENT_URL: url(),
  CLOUDINARY_CLOUD_NAME: str(),
  CLOUDINARY_API_KEY: str(),
  CLOUDINARY_API_SECRET: str(),
});
