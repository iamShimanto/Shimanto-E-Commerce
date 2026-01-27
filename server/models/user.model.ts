import { model, Schema, Types, type InferSchemaType } from "mongoose";
import bcrypt from "bcrypt";

interface user {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  phone: number;
  address: string;
  avatar: string;
  role: string;
  isVerified: boolean;
  otp: number | null;
  otpExpires: Date;
  resetPassLinkExpires: Date | null;
  resetPassToken: string | null;
  comparePassword(pass: string): Promise<boolean>;
}

const userSchema = new Schema<user>(
  {
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
    },
    address: {
      type: String,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "stuff"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: Number,
      default: null,
    },
    otpExpires: {
      type: Date,
    },
    resetPassToken: {
      type: String,
    },
    resetPassLinkExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (error) {}
});

userSchema.methods.comparePassword = function (pass: string): Promise<boolean> {
  return bcrypt.compare(pass, this.password);
};

export const UserModel = model<user>("User", userSchema);
