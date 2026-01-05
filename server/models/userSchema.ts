import { model, Schema, type InferSchemaType } from "mongoose";
import bcrypt from "bcrypt";

interface user {
	fullName: string;
	email: string;
	password: string;
	phone: string;
	address: string;
	role: string;
	isVerified: boolean;
	otp: string;
	otpExpires: Date;
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
			type: String,
		},
		address: {
			type: String,
		},
		role: {
			type: String,
			default: "user",
			enum: ["user", "admin"],
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		otp: {
			type: String,
			default: null,
		},
		otpExpires: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
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
