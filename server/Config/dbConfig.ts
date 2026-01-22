import mongoose from "mongoose";
import { env } from "./envConfig";

const dbConfig = async () => {
  await mongoose
    .connect(env.MONGODB_URI)
    .then(() => console.log("db connected"))
    .catch((err) => console.log(err));
};

export default dbConfig;
