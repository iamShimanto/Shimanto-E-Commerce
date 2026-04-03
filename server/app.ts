import express from "express";
const app = express();
import routes from "./routes/index";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { env } from "./Config/envConfig";
import { errorHandler } from "./middleware/errorHandler";
import {
  sslcommerzIpn,
  sslcommerzSuccess,
  sslcommerzFail,
  sslcommerzCancel,
  stripeWebhook,
} from "./controllers/order/order.controller";

app.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// SSLCommerz posts form-urlencoded data to success/fail/cancel URLs.
app.post(
  "/sslcommerz/success",
  express.urlencoded({ extended: true }),
  sslcommerzSuccess,
);
app.get("/sslcommerz/success", sslcommerzSuccess);
app.post(
  "/sslcommerz/fail",
  express.urlencoded({ extended: true }),
  sslcommerzFail,
);
app.get("/sslcommerz/fail", sslcommerzFail);
app.post(
  "/sslcommerz/cancel",
  express.urlencoded({ extended: true }),
  sslcommerzCancel,
);
app.get("/sslcommerz/cancel", sslcommerzCancel);

app.post(
  "/api/v1/order/sslcommerz-ipn",
  express.urlencoded({ extended: true }),
  sslcommerzIpn,
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      env.CLIENT_URL1,
      env.CLIENT_URL2,
      env.CLIENT_URL3,
      env.CLIENT_URL4,
    ],
    credentials: true,
  }),
);
app.use(routes);

app.use(errorHandler);

export default app;
