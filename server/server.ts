import dotenv from "dotenv";
dotenv.config();
import app from "./app";

import dbConfig from "./dbConfig/index";
import { env } from "./utils/envValidation";

dbConfig();

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
