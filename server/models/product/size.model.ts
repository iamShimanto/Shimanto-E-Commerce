import { Schema, model, Document } from "mongoose";

export interface ISize extends Document {
  size: string;
  createdAt: Date;
  updatedAt: Date;
}

const sizeSchema = new Schema<ISize>(
  {
    size: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Size = model<ISize>("Size", sizeSchema);
