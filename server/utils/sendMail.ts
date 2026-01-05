import nodemailer from "nodemailer";
import { env } from "./envValidation.ts";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: env.EMAIL_USER,
		pass: env.EMAIL_PASS,
	},
});

export const sendMail = async (email: string, otp: number, subject: string) => {
	const info = await transporter.sendMail({
		from: `Email Verification ${env.EMAIL_USER}`,
		to: email,
		subject: subject,
		html: `<b>Email verification code ${otp}</b>`,
	});
};
