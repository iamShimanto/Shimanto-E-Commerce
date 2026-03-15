import React, { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { Mail, ShoppingBag } from "lucide-react";
import Input from "../components/ui/Input";
import SEO from "../components/seo/SEO";
import { useToast } from "../hooks/useToast";
import { useResetPasswordMutation } from "../api/auth/authApi";

const ForgetPassword = () => {
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const toast = useToast();
    const forgetPasswordSEO = {
        title: "Forgot Password - Best Online Shopping Store",
        description:
            "Reset your FashionHub BD password if you've forgotten it. Enter your email address to receive a password reset link.",
        keywords:
            "forgot password, password reset, account recovery, fashion hub password, online store password reset",
        image: "https://e-commerce.shimanto.dev/forgot-password-banner.jpg",
        url: "/forgot-password",
        type: "website",
    };
    const [forgotPassword, { isLoading }] = useResetPasswordMutation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
        },
        mode: "onTouched",
    });

    const onSubmit = async (data) => {
        setServerError("");
        setSuccessMessage("");

        try {
            const res = await forgotPassword(data).unwrap();
            setSuccessMessage(
                res?.message || "Password reset link has been sent to your email."
            );
            toast.success({
                title: "Password Reset Link Sent",
                message: "Please check your email for the password reset link.",
            });
        } catch (error) {
            toast.error({
                title: "Failed to Send Reset Link",
                message: error?.data?.message || "An error occurred while sending the reset link.",
            });
            setServerError(
                error?.data?.message ||
                "Failed to send reset link. Please try again."
            );
        }
    };

    return (
        <>
            <SEO {...forgetPasswordSEO} />

            <section className="w-full px-4 py-10 text-slate-900 transition-colors duration-300 dark:text-slate-100">
                <div className="mx-auto flex max-w-md items-center justify-center">
                    <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
                        {/* Logo */}
                        <div className="mb-6 flex justify-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black">
                                <ShoppingBag size={22} />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold tracking-tight">
                                Forgot Password
                            </h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Enter your email address and we&apos;ll send you a password reset
                                link.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="Enter your email"
                                leftIcon={<Mail size={18} />}
                                error={errors.email?.message}
                                required
                                autoComplete="email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Please enter a valid email address",
                                    },
                                })}
                            />

                            {/* Success Message */}
                            {successMessage && (
                                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    {successMessage}
                                </p>
                            )}

                            {/* Server Error */}
                            {serverError && (
                                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
                                    {serverError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                            >
                                {isLoading ? "Sending reset link..." : "Send Reset Link"}
                            </button>
                        </form>

                        {/* Back to login */}
                        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            Remember your password?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-slate-900 hover:underline dark:text-white"
                            >
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ForgetPassword;