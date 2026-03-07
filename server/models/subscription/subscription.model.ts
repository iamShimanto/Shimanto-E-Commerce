import { model, Schema } from "mongoose";

interface ISubscription {
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const SubscriptionModel = model<ISubscription>(
  "Subscription",
  subscriptionSchema,
);
