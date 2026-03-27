import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { KeyRound, LockKeyhole, ShoppingBag } from "lucide-react";
import Input from "../components/ui/Input";
import SEO from "../components/seo/SEO";
import { useResetPasswordChangeMutation } from "../api/auth/authApi";
import { useToast } from "../hooks/useToast";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [successMessage, setSuccessMessage] = useState("");
    const { push } = useToast();
    const token = searchParams.get("sec") || "";

    const resetPasswordSEO = {
        title: "Reset Password - Best Online Shopping Store",
        description:
            "Set a new password for your account securely and regain access to your FashionHub BD account.",
        keywords:
            "reset password, change password, set new password, secure password reset, account recovery",
        image: "https://e-commerce.shimanto.dev/reset-password-banner.jpg",
        url: "/auth/resetpass",
        type: "website",
    };

    const [resetPassword, { isLoading }] = useResetPasswordChangeMutation();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onTouched",
    });

    const newPassword = watch("newPassword");

    const hasToken = useMemo(() => Boolean(token), [token]);

    const onSubmit = async (data) => {
        setSuccessMessage("");

        if (!token) {
            push({
                title: "Invalid Link",
                message: "The reset link you provided is invalid or has expired.",
                variant: "error"
            });
            return;
        }
        try {
            const res = await resetPassword({
                token,
                newPassword: data.newPassword,
            }).unwrap();

            setSuccessMessage(
                res?.message || "Password updated successfully. Redirecting to login..."
            );
            push({
                title: "Password Reset Successful",
                message: "Your password has been updated. Please log in with your new password.",
                variant: "success"
            });
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1500);
        } catch (error) {
            push({
                title: "Password Reset Failed",
                message: error?.data?.message || "Failed to reset password. Please try again.",
                variant: "error"
            });
        }
    };

    return (
        <>
            <SEO {...resetPasswordSEO} />

            <section className="w-full px-4 py-10 transition-colors duration-300">
                <div className="mx-auto flex max-w-md items-center justify-center">
                    <div className="w-full rounded-3xl border p-8 shadow-xl">

                        {/* Title */}
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border">
                                <KeyRound size={24} />
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight">
                                Reset your password
                            </h2>
                            <p className="mt-2 text-sm">
                                Enter a new password for your account.
                            </p>
                        </div>

                        {!hasToken ? (
                            <div className="space-y-5">
                                <p className="rounded-xl border px-4 py-3 text-sm">
                                    Invalid or missing reset link.
                                </p>

                                <p className="text-center text-sm">
                                    Request a new password reset link from the forgot password page.
                                </p>

                                <Link
                                    to="/forgot-password"
                                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border px-5 text-sm font-semibold transition-all duration-200"
                                >
                                    Go to Forgot Password
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <Input
                                    label="New Password"
                                    type="password"
                                    placeholder="Enter new password"
                                    leftIcon={<LockKeyhole size={18} />}
                                    error={errors.newPassword?.message}
                                    required
                                    autoComplete="new-password"
                                    {...register("newPassword", {
                                        required: "New password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters",
                                        },
                                    })}
                                />

                                <Input
                                    label="Confirm New Password"
                                    type="password"
                                    placeholder="Confirm new password"
                                    leftIcon={<LockKeyhole size={18} />}
                                    error={errors.confirmPassword?.message}
                                    required
                                    autoComplete="new-password"
                                    {...register("confirmPassword", {
                                        required: "Please confirm your new password",
                                        validate: (value) =>
                                            value === newPassword || "Passwords do not match",
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
                                    className="inline-flex cursor-pointer h-11 w-full items-center justify-center rounded-xl border px-5 text-sm font-semibold transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isLoading ? "Updating password..." : "Reset Password"}
                                </button>
                            </form>
                        )}

                        <p className="mt-6 text-center text-sm">
                            Remember your password?{" "}
                            <Link to="/login" className="font-semibold hover:underline">
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ResetPassword;