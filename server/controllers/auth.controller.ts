import type { RequestHandler } from "express";
import { isValidEmail } from "../utils/validation.ts";
import { UserModel } from "../models/userSchema.ts";
import { sendMail } from "../utils/sendMail.ts";
import { generateOtp } from "../utils/Generator.ts";

export const craeteUser: RequestHandler = async (req, res) => {
	try {
		const {
			fullName,
			email,
			password,
			phone,
			address,
			role,
			isVerified,
			otp,
			otpExpires,
		} = req.body;
		if (!email) return res.status(400).send({ message: "Email is Required" });
		if (!isValidEmail(email))
			return res.status(400).send({ message: "Enter a valid email" });
		if (!password)
			return res.status(400).send({ message: "Password is required" });
		if (password.length < 6)
			return res.status(400).send({ message: "Password must be 6 characters" });

		const isExistUser = await UserModel.findOne({ email });
		if (isExistUser) {
			return res.status(400).send({ message: "User already Exist!" });
		}

		const emailOTP = generateOtp();

		await sendMail(email, emailOTP, "Email Verification");

		res
			.status(201)
			.send({
				message:
					"User Registration Successfull and Email verify code sent to your email",
			});
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Internal server error" });
	}
};
