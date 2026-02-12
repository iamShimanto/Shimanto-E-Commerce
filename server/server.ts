import dotenv from "dotenv";
dotenv.config();
import app from "./app";

import dbConfig from "./Config/dbConfig";
import { env } from "./Config/envConfig";
import redis from "./Config/redis";

async function startServer() {
  try {
    await dbConfig();
    console.log("MongoDb connencted Successfully");

    await redis.ping();
    console.log("Redis connected Successfully");

    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.log("Failed to connect Database");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.log(error);
    }

    process.exit(1);
  }
}

startServer();
