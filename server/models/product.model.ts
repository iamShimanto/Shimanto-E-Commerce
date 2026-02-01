import { model, Schema, Types } from "mongoose";

export type Size = "s" | "m" | "l" | "xl" | "2xl" | "3xl";

export interface IProductVariant {
  sku: string;
  attribute: {
    color: string;
    sizes: Size;
    stock: number;
  };
}

export interface IProduct {
  _id?: Types.ObjectId;

  title: string;
  description: string;
  category: Types.ObjectId;

  price: number;
  discountPercentage?: number;

  variants: IProductVariant[];

  tags?: string[];
  thumbnail: string;
  images?: string[];

  isActive?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: Types.ObjectId,
      ref: "category",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    variants: [
      {
        sku: {
          type: String,
          required: true,
          unique: true,
        },
        attribute: {
          color: {
            type: String,
            required: true,
          },
          sizes: {
            type: String,
            required: true,
            enum: ["s", "m", "l", "xl", "2xl", "3xl"],
          },
          stock: {
            type: Number,
            required: true,
          },
        },
      },
    ],
    tags: {
      type: Array,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const productModel = model<IProduct>("product", productSchema);
