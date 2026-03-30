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
    const [successMessage, setSuccessMessage] = useState("");
    const { push } = useToast();
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
            push({
                title: "OTP Verification successful",
                message: "Your email has been verified. Redirecting to login...",
                variant: "success"
            });
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1200);
        } catch (error) {
            push({
                title: "OTP Verification failed",
                message: error?.data?.message || "An error occurred during OTP verification",
                variant: "error"
            });
        }
    };

    return (
        <>
            <SEO {...verifyOtpSEO} />

            <section className="w-full px-4 py-10 transition-colors duration-300">
                <div className="mx-auto flex max-w-md items-center justify-center">
                    <div className="w-full rounded-3xl border p-8 shadow-xl">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border">
                                <MailCheck size={24} />
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight">Verify OTP</h2>

                            <p className="mt-2 text-sm">
                                We sent a verification code to{" "}
                                <span className="font-medium">{maskedEmail || "your email"}</span>.
                                Enter the OTP below to verify your account.
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

                            {successMessage && (
                                <p className="rounded-xl border px-4 py-3 text-sm">
                                    {successMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border px-5 text-sm font-semibold transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? "Verifying..." : "Verify OTP"}
                            </button>
                        </form>

                        <div className="mt-6 space-y-2 text-center text-sm">
                            <p>
                                Wrong email?{" "}
                                <Link to="/register" className="font-semibold hover:underline">
                                    Register again
                                </Link>
                            </p>

                            <p>
                                Already verified?{" "}
                                <Link to="/login" className="font-semibold hover:underline">
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