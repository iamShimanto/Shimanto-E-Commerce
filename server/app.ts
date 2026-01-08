import express from "express";
const app = express();
import routes from "./routes/index";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./utils/envValidation";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [env.CLIENT_URL],
    credentials: true,
  })
);
app.use(routes);

export default app;
