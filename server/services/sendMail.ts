import nodemailer from "nodemailer";
import { env } from "../utils/envValidation";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export const sendMail = async (
  email: string,
  otp: number | string,
  subject: string,
  emailTemplate: any
) => {
  await transporter.sendMail({
    from: `Email Verification ${env.EMAIL_USER}`,
    to: email,
    subject: subject,
    html: emailTemplate({ code: otp, appName: "Shimanto" }),
  });
};


