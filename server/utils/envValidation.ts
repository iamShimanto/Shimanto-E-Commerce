import dotenv from "dotenv";
dotenv.config();
import { cleanEnv, port, str } from "envalid";

export const env = cleanEnv(process.env, {
  PORT: port({ default: 5000 }),
  MONGODB_URI: str(),
  EMAIL_USER: str(),
  EMAIL_PASS: str(),
});
