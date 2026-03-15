import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { KeyRound, MailCheck, ShoppingBag } from "lucide-react";
import Input from "../components/ui/Input";
import SEO from "../components/seo/SEO";
import { useVerifyOtpMutation } from "../api/auth/authApi";
import { useToast } from "../hooks/useToast";

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const toast = useToast();
    const emailFromState = location.state?.email || "";

    const verifyOtpSEO = {
        title: "Verify OTP - Best Online Shopping Store",
        description:
            "Verify your email address using the OTP sent to your inbox and activate your account securely.",
        keywords:
            "verify otp, email verification, account verification, otp verification",
        image: "https://e-commerce.shimanto.dev/verify-otp-banner.jpg",
        url: "/verify-otp",
        type: "website",
    };

    const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: emailFromState,
            otp: "",
        },
        mode: "onTouched",
    });
    useEffect(() => {
        if (emailFromState) {
            setValue("email", emailFromState);
        }
    }, [emailFromState, setValue]);

    const maskedEmail = useMemo(() => {
        if (!emailFromState) return "";
        const [name, domain] = emailFromState.split("@");
        if (!name || !domain) return emailFromState;
        const safeName =
            name.length <= 2
                ? `${name[0] || ""}*`
                : `${name.slice(0, 2)}${"*".repeat(Math.max(name.length - 2, 2))}`;
        return `${safeName}@${domain}`;
    }, [emailFromState]);

    const onSubmit = async (data) => {
        setServerError("");
        setSuccessMessage("");
        const payload = {
            email: data.email,
            otp: data.otp,
        };

        try {
            const res = await verifyOtp(payload).unwrap();
            setSuccessMessage(
                res?.message || "Email verified successfully. Redirecting to login..."
            );
            toast.success({
                title: "OTP Verification successful",
                message: "Your email has been verified. Redirecting to login...",
            });
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1200);
        } catch (error) {
            toast.error({
                title: "OTP Verification failed",
                message: error?.data?.message || "An error occurred during OTP verification",
            });
            setServerError(
                error?.data?.message || "OTP verification failed. Please try again."
            );
        }
    };

    return (
        <>
            <SEO {...verifyOtpSEO} />

            <section className="w-full px-4 py-10 text-slate-900 transition-colors duration-300 dark:text-slate-100">
                <div className="mx-auto flex max-w-md items-center justify-center">
                    <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
                        <div className="mb-6 flex justify-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black">
                                <ShoppingBag size={22} />
                            </div>
                        </div>

                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
                                <MailCheck size={24} />
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight">
                                Verify OTP
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                We sent a verification code to{" "}
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                    {maskedEmail || "your email"}
                                </span>
                                . Enter the OTP below to verify your account.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="Enter your email"
                                error={errors.email?.message}
                                required
                                readOnly={!!emailFromState}
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Please enter a valid email address",
                                    },
                                })}
                            />

                            <Input
                                label="Verification Code"
                                type="text"
                                placeholder="Enter OTP"
                                leftIcon={<KeyRound size={18} />}
                                error={errors.otp?.message}
                                required
                                maxLength={6}
                                inputMode="numeric"
                                {...register("otp", {
                                    required: "OTP is required",
                                    minLength: {
                                        value: 4,
                                        message: "OTP must be at least 4 characters",
                                    },
                                    maxLength: {
                                        value: 6,
                                        message: "OTP cannot be more than 6 characters",
                                    },
                                })}
                            />

                            {serverError && (
                                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
                                    {serverError}
                                </p>
                            )}

                            {successMessage && (
                                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    {successMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                            >
                                {isLoading ? "Verifying..." : "Verify OTP"}
                            </button>
                        </form>

                        <div className="mt-6 space-y-2 text-center text-sm text-slate-500 dark:text-slate-400">
                            <p>
                                Wrong email?{" "}
                                <Link
                                    to="/register"
                                    className="font-semibold text-slate-900 hover:underline dark:text-white"
                                >
                                    Register again
                                </Link>
                            </p>

                            <p>
                                Already verified?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold text-slate-900 hover:underline dark:text-white"
                                >
                                    Back to Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default VerifyOtp;