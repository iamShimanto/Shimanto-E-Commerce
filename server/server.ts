import dotenv from "dotenv";
dotenv.config();
import app from "./app";

import dbConfig from "./Config/dbConfig";
import { env } from "./Config/envConfig";

dbConfig();

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
