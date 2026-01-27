import { model, Schema } from "mongoose";

interface ICategory {
  name: string;
  thumbnail: string;
  description?: string;
  isActive: boolean;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export const CategoryModel = model<ICategory>("category", categorySchema);
