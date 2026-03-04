import { model, Schema, Types } from "mongoose";

export interface CartItem {
  product: Types.ObjectId;
  sku: string;
  quantity: number;
  subTotal: number;
}

export interface Cart {
  user: Types.ObjectId;
  items: CartItem[];
  totalItems: number;
}

const cartItemSchema = new Schema<CartItem>(
  {
    product: {
      type: Types.ObjectId,
      ref: "product",
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    subTotal: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const cartSchema = new Schema<Cart>(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

cartSchema.pre("save", function () {
  this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
});

export const cartModel = model<Cart>("cart", cartSchema);
