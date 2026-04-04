import { model, Schema, Types } from "mongoose";

export type PaymentMethod = "cod" | "stripe" | "sslcommerz";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

interface IOrderItem {
  product: Types.ObjectId;
  sku: string;
  title: string;
  price: number;
  quantity: number;
  subTotal: number;
  thumbnail?: string;
}

interface IShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
}

interface IOrder {
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subTotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  currency: string;
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Types.ObjectId,
      ref: "product",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    thumbnail: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cod", "stripe", "sslcommerz"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    subTotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      default: "BDT",
    },
    transactionId: {
      type: String,
      trim: true,
      sparse: true,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentMethod: 1, paymentStatus: 1 });

const Order = model<IOrder>("Order", orderSchema);

export default Order;
