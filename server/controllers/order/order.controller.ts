import { RequestHandler } from "express";
import { ApiError } from "../../utils/ApiError";
import { cartModel } from "../../models/cart.model";
import Order from "../../models/order/order.model";
import { successResponse } from "../../utils/successResponse";
import { delCache } from "../../utils/redisCache";
import Stripe = require("stripe");
const SSLCommerzPayment = require("sslcommerz-lts");
import { env } from "../../Config/envConfig";
const stripe = env.STRIPE_SECRET_KEY
  ? Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    })
  : null;

type StripeCheckoutSession = {
  id?: string;
  metadata?: { orderId?: string; transactionId?: string };
  client_reference_id?: string;
  payment_intent?: string | { id?: string };
  amount_total?: number | null;
  currency?: string | null;
  payment_status?: string | null;
};

const buildStripeGatewayResponse = (
  eventType: string,
  session: StripeCheckoutSession,
) => ({
  gateway: "stripe",
  eventType,
  transactionId: session.metadata?.transactionId ?? null,
  sessionId: session.id ?? null,
  paymentIntentId:
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null),
  paymentStatus: session.payment_status ?? null,
  amountTotal: session.amount_total ?? null,
  currency: session.currency ?? null,
});

type SslCommerzInitResponse = {
  GatewayPageURL?: string;
  status?: string;
  failedreason?: string;
  sessionkey?: string;
  [key: string]: unknown;
};

type SslCommerzValidationResponse = {
  status?: string;
  tran_id?: string;
  val_id?: string;
  amount?: string | number;
  currency?: string;
  bank_tran_id?: string;
  [key: string]: unknown;
};

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value))
      return String(value);
  }
  return "";
};

const buildSslGatewayResponse = (
  initResponse: SslCommerzInitResponse,
  transactionId: string,
) => ({
  gateway: "sslcommerz",
  transactionId,
  gatewayPageUrl: initResponse.GatewayPageURL ?? null,
  sessionKey: initResponse.sessionkey ?? null,
  status: initResponse.status ?? null,
});

const isSslCommerzLive = env.SSL_ISLIVE === "true";

export const checkout: RequestHandler = async (req, res) => {
  const userId = req.user?._id;
  const { shippingAddress, paymentMethod, insideDhaka } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!shippingAddress || typeof shippingAddress !== "object") {
    throw new ApiError(400, "Shipping address is required");
  }
//   address
  const fullName = String(shippingAddress.fullName ?? "").trim();
  const phone = String(shippingAddress.phone ?? "").trim();
  const address = String(
    shippingAddress.address ?? shippingAddress.addressLine1 ?? "",
  ).trim();
  const email = String(shippingAddress.email ?? "").trim();

  if (!fullName || !phone || !address) {
    throw new ApiError(
      400,
      "Full name, phone number, and address are required",
    );
  }
    // cart
  const cart = await cartModel
    .findOne({ user: userId })
    .populate("items.product", "title price thumbnail");

  if (!cart || !cart.items.length) {
    throw new ApiError(404, "Cart not found or empty");
  }
//   cart items
  const items = cart.items.map((item) => {
    const product = item.product as unknown as {
      _id?: string;
      title?: string;
      price?: number;
      thumbnail?: string;
    };

    if (!product?._id || !product.title || typeof product.price !== "number") {
      throw new ApiError(400, "Cart item product information is incomplete");
    }

    return {
      product: product._id,
      sku: item.sku,
      title: product.title,
      price: product.price,
      quantity: item.quantity,
      subTotal: item.subTotal,
      thumbnail: product.thumbnail ?? "",
    };
  });
//   calculate totals and prepare order data
  const subTotal = items.reduce((total, item) => total + item.subTotal, 0);
  const insideCharge = Number(process.env.INSIDE_DHAKA_CHARGE ?? 0);
  const outsideCharge = Number(process.env.OUTSIDE_DHAKA_CHARGE ?? 0);
  const shippingFee = insideDhaka ? insideCharge : outsideCharge;
  const totalAmount = subTotal + shippingFee;
  const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const normalizedPaymentMethod = String(paymentMethod ?? "cod").toLowerCase();
//   handle code, stripe, and sslcommerz payment methods
  if (normalizedPaymentMethod === "cod") {
    const order = await Order.create({
      user: userId,
      items,
      shippingAddress: {
        fullName,
        phone,
        email: email || undefined,
        address,
      },
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "pending",
      subTotal,
      shippingFee,
      totalAmount,
      currency: "BDT",
      transactionId,
    });

    await cartModel.findOneAndDelete({ user: userId });

    return successResponse(res, "Order placed successfully", 201, order);
  }
//   stripe payment method
  if (normalizedPaymentMethod === "stripe") {
    if (!stripe) {
      throw new ApiError(500, "Stripe is not configured");
    }

    const order = await Order.create({
      user: userId,
      items,
      shippingAddress: {
        fullName,
        phone,
        email: email || undefined,
        address,
      },
      paymentMethod: "stripe",
      paymentStatus: "pending",
      orderStatus: "pending",
      subTotal,
      shippingFee,
      totalAmount,
      currency: "BDT",
      transactionId,
    });

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "bdt",
              product_data: {
                name: `Order ${transactionId}`,
                description: `Payment for order ${transactionId}`,
              },
              unit_amount: Math.round(totalAmount * 100),
            },
          },
        ],
        success_url: `${env.CLIENT_URL1}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.CLIENT_URL1}/checkout/cancel`,
        customer_email: email || undefined,
        client_reference_id: order._id.toString(),
        metadata: {
          orderId: order._id.toString(),
          transactionId,
        },
      });

      return successResponse(
        res,
        "Stripe checkout session created successfully",
        201,
        {
          order,
          sessionId: session.id,
          checkoutUrl: session.url,
        },
      );
    } catch (error) {
      await Order.findByIdAndDelete(order._id);
      throw error;
    }
  }
//   sslcommerz payment method
  if (normalizedPaymentMethod === "sslcommerz") {
    if (!env.SSL_STORE_ID || !env.SSL_STORE_PASSWORD) {
      throw new ApiError(500, "SSLCommerz is not configured");
    }

    if (!env.SERVER_URL) {
      throw new ApiError(
        500,
        "SERVER_URL is required for SSLCommerz callbacks (success/fail/cancel/ipn)",
      );
    }

    const order = await Order.create({
      user: userId,
      items,
      shippingAddress: {
        fullName,
        phone,
        email: email || undefined,
        address,
      },
      paymentMethod: "sslcommerz",
      paymentStatus: "pending",
      orderStatus: "pending",
      subTotal,
      shippingFee,
      totalAmount,
      currency: "BDT",
      transactionId,
    });
    // ssl initialize and redirect to gateway
    try {
      const sslcz = new SSLCommerzPayment(
        env.SSL_STORE_ID,
        env.SSL_STORE_PASSWORD,
        isSslCommerzLive,
      );

      const initData = {
        total_amount: totalAmount,
        currency: "BDT",
        tran_id: transactionId,
        // SSLCommerz sends form-POST to these URLs; they must be backend endpoints.
        success_url: `${env.SERVER_URL}/sslcommerz/success`,
        fail_url: `${env.SERVER_URL}/sslcommerz/fail`,
        cancel_url: `${env.SERVER_URL}/sslcommerz/cancel`,
        ipn_url: `${env.SERVER_URL}/api/v1/order/sslcommerz-ipn`,
        shipping_method: "Courier",
        product_name: `Order ${transactionId}`,
        product_category: "E-commerce",
        product_profile: "general",
        cus_name: fullName,
        cus_email: email || "customer@example.com",
        cus_add1: address,
        cus_add2: address,
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: phone,
        cus_fax: phone,
        ship_name: fullName,
        ship_add1: address,
        ship_add2: address,
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };

      const initResponse = (await sslcz.init(
        initData,
      )) as SslCommerzInitResponse;

      const gatewayPageUrl = initResponse.GatewayPageURL;

      if (!gatewayPageUrl) {
        throw new ApiError(500, "SSLCommerz gateway URL was not returned");
      }

      await Order.findByIdAndUpdate(order._id, {
        gatewayResponse: buildSslGatewayResponse(initResponse, transactionId),
      });

      return successResponse(
        res,
        "SSLCommerz checkout initialized successfully",
        201,
        {
          order,
          gatewayPageUrl,
          transactionId,
          gatewayResponse: buildSslGatewayResponse(initResponse, transactionId),
        },
      );
    } catch (error) {
      await Order.findByIdAndDelete(order._id);
      throw error;
    }
  }

  throw new ApiError(400, "Invalid payment method");
};
    //  stripe webhook handler
export const stripeWebhook: RequestHandler = async (req, res) => {
  if (!stripe) {
    throw new ApiError(500, "Stripe is not configured");
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new ApiError(500, "Stripe webhook secret is not configured");
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    throw new ApiError(400, "Missing Stripe signature");
  }

  const payload = Buffer.isBuffer(req.body)
    ? req.body.toString("utf8")
    : JSON.stringify(req.body ?? {});

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    ) as any;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as StripeCheckoutSession;
        const orderId =
          session.metadata?.orderId || session.client_reference_id;

        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "paid",
            orderStatus: "confirmed",
            transactionId: session.metadata?.transactionId ?? undefined,
            gatewayResponse: buildStripeGatewayResponse(event.type, session),
          });
        }
        break;
      }

      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as StripeCheckoutSession;
        const orderId =
          session.metadata?.orderId || session.client_reference_id;

        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "failed",
            orderStatus: "cancelled",
            gatewayResponse: buildStripeGatewayResponse(event.type, session),
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    throw new ApiError(
      400,
      `Stripe webhook signature verification failed: ${(error as Error).message}`,
    );
  }

  return res.status(200).json({ received: true });
};
// sslcommerz IPN handler
export const sslcommerzIpn: RequestHandler = async (req, res) => {
  if (!env.SSL_STORE_ID || !env.SSL_STORE_PASSWORD) {
    throw new ApiError(500, "SSLCommerz is not configured");
  }

  const tranId = String(req.body?.tran_id ?? req.body?.tranId ?? "").trim();
  const valId = String(req.body?.val_id ?? req.body?.valId ?? "").trim();

  if (!tranId && !valId) {
    throw new ApiError(400, "Missing SSLCommerz transaction information");
  }

  const sslcz = new SSLCommerzPayment(
    env.SSL_STORE_ID,
    env.SSL_STORE_PASSWORD,
    isSslCommerzLive,
  );

  let validationResponse: SslCommerzValidationResponse | null = null;

  if (valId) {
    validationResponse = (await sslcz.validate({
      val_id: valId,
    })) as SslCommerzValidationResponse;
  }

  const resolvedTranId =
    validationResponse?.tran_id?.toString().trim() || tranId || undefined;

  if (!resolvedTranId) {
    throw new ApiError(400, "SSLCommerz transaction id is missing");
  }

  const isSuccess = ["VALID", "VALIDATED", "SUCCESS"].includes(
    String(validationResponse?.status ?? req.body?.status ?? "")
      .toUpperCase()
      .trim(),
  );

  const order = await Order.findOne({ transactionId: resolvedTranId });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const gatewayResponse = {
    gateway: "sslcommerz",
    transactionId: resolvedTranId,
    valId: valId || null,
    validationStatus: validationResponse?.status ?? req.body?.status ?? null,
    bankTransactionId: validationResponse?.bank_tran_id ?? null,
    amount: validationResponse?.amount ?? null,
    currency: validationResponse?.currency ?? null,
  };

  await Order.findByIdAndUpdate(
    order._id,
    {
      paymentStatus: isSuccess ? "paid" : "failed",
      orderStatus: isSuccess ? "confirmed" : "cancelled",
      gatewayResponse,
    },
    { new: true },
  );

  if (isSuccess) {
    await cartModel.findOneAndDelete({ user: order.user });
    await delCache(`cart:${order.user}`);
  }

  return res.status(200).json({
    success: true,
    message: isSuccess
      ? "SSLCommerz payment verified successfully"
      : "SSLCommerz payment failed or was not valid",
    data: gatewayResponse,
  });
};

const resolveSslOrderAndUpdate = async (params: {
  callbackType: "success" | "fail" | "cancel";
  tranId: string;
  valId: string;
  status: string;
  raw: Record<string, unknown>;
}) => {
  const { callbackType, tranId, valId, status, raw } = params;

  if (!env.SSL_STORE_ID || !env.SSL_STORE_PASSWORD) {
    throw new ApiError(500, "SSLCommerz is not configured");
  }

  const sslcz = new SSLCommerzPayment(
    env.SSL_STORE_ID,
    env.SSL_STORE_PASSWORD,
    isSslCommerzLive,
  );

  let validationResponse: SslCommerzValidationResponse | null = null;
  if (valId) {
    validationResponse = (await sslcz.validate({
      val_id: valId,
    })) as SslCommerzValidationResponse;
  }

  const resolvedTranId = pickString(validationResponse?.tran_id, tranId);
  if (!resolvedTranId) {
    throw new ApiError(400, "SSLCommerz transaction id is missing");
  }

  const normalizedStatus = pickString(validationResponse?.status, status)
    .toUpperCase()
    .trim();

  const isValidSuccess = ["VALID", "VALIDATED", "SUCCESS"].includes(
    normalizedStatus,
  );

  const shouldMarkPaid = callbackType === "success" && isValidSuccess;
  const shouldCancel = callbackType === "cancel";
  const shouldFail =
    callbackType === "fail" || (callbackType === "success" && !isValidSuccess);

  const order = await Order.findOne({ transactionId: resolvedTranId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (validationResponse?.amount != null) {
    const amountNumber =
      typeof validationResponse.amount === "string"
        ? Number(validationResponse.amount)
        : Number(validationResponse.amount);
    if (
      Number.isFinite(amountNumber) &&
      Math.abs(amountNumber - order.totalAmount) > 0.01
    ) {
      throw new ApiError(400, "SSLCommerz amount mismatch");
    }
  }

  const gatewayResponse = {
    gateway: "sslcommerz",
    callbackType,
    transactionId: resolvedTranId,
    valId: valId || null,
    status: normalizedStatus || null,
    bankTransactionId: validationResponse?.bank_tran_id ?? null,
    amount: validationResponse?.amount ?? null,
    currency: validationResponse?.currency ?? null,
  };

  await Order.findByIdAndUpdate(order._id, {
    paymentStatus: shouldMarkPaid ? "paid" : "failed",
    orderStatus: shouldMarkPaid
      ? "confirmed"
      : shouldCancel
        ? "cancelled"
        : "cancelled",
    gatewayResponse,
  });

  if (shouldMarkPaid) {
    await cartModel.findOneAndDelete({ user: order.user });
    await delCache(`cart:${order.user}`);
  }

  return {
    transactionId: resolvedTranId,
    isPaid: shouldMarkPaid,
    gatewayResponse,
    raw,
  };
};

export const sslcommerzSuccess: RequestHandler = async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const query = (req.query ?? {}) as Record<string, unknown>;

  const tranId = pickString(
    body.tran_id,
    body.tranId,
    body.transactionId,
    query.tran_id,
    query.tranId,
    query.transactionId,
  );
  const valId = pickString(body.val_id, body.valId, query.val_id, query.valId);
  const status = pickString(body.status, query.status);

  const result = await resolveSslOrderAndUpdate({
    callbackType: "success",
    tranId,
    valId,
    status,
    raw: { ...query, ...body },
  });

  const redirectBase = env.CLIENT_URL1;
  const redirectUrl = result.isPaid
    ? `${redirectBase}/checkout/success?transactionId=${encodeURIComponent(result.transactionId)}`
    : `${redirectBase}/checkout/fail?transactionId=${encodeURIComponent(result.transactionId)}`;

  return res.redirect(302, redirectUrl);
};

export const sslcommerzFail: RequestHandler = async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const query = (req.query ?? {}) as Record<string, unknown>;

  const tranId = pickString(
    body.tran_id,
    body.tranId,
    body.transactionId,
    query.tran_id,
    query.tranId,
    query.transactionId,
  );
  const valId = pickString(body.val_id, body.valId, query.val_id, query.valId);
  const status = pickString(body.status, query.status, "FAILED");

  const result = await resolveSslOrderAndUpdate({
    callbackType: "fail",
    tranId,
    valId,
    status,
    raw: { ...query, ...body },
  });

  const redirectUrl = `${env.CLIENT_URL1}/checkout/fail?transactionId=${encodeURIComponent(result.transactionId)}`;
  return res.redirect(302, redirectUrl);
};

export const sslcommerzCancel: RequestHandler = async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const query = (req.query ?? {}) as Record<string, unknown>;

  const tranId = pickString(
    body.tran_id,
    body.tranId,
    body.transactionId,
    query.tran_id,
    query.tranId,
    query.transactionId,
  );
  const valId = pickString(body.val_id, body.valId, query.val_id, query.valId);
  const status = pickString(body.status, query.status, "CANCELLED");

  const result = await resolveSslOrderAndUpdate({
    callbackType: "cancel",
    tranId,
    valId,
    status,
    raw: { ...query, ...body },
  });

  const redirectUrl = `${env.CLIENT_URL1}/checkout/cancel?transactionId=${encodeURIComponent(result.transactionId)}`;
  return res.redirect(302, redirectUrl);
};
