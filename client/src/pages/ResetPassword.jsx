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
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const toast = useToast();
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
        setServerError("");
        setSuccessMessage("");

        if (!token) {
            setServerError("Invalid or missing reset link.");
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
            toast.success({
                title: "Password Reset Successful",
                description: "Your password has been updated. Please log in with your new password.",
            });
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1500);
        } catch (error) {
            toast.error({
                title: "Password Reset Failed",
                description: error?.data?.message || "Failed to reset password. Please try again.",
            });
            setServerError(
                error?.data?.message || "Failed to reset password. Please try again."
            );
        }
    };

    return (
        <>
            <SEO {...resetPasswordSEO} />

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
                            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white">
                                <KeyRound size={24} />
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight">
                                Reset your password
                            </h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Enter a new password for your account.
                            </p>
                        </div>

                        {!hasToken ? (
                            <div className="space-y-5">
                                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
                                    Invalid or missing reset link.
                                </p>

                                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                                    Request a new password reset link from the forgot password
                                    page.
                                </p>

                                <Link
                                    to="/forgot-password"
                                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
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
                                    <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
                                        {successMessage}
                                    </p>
                                )}

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
                                    {isLoading ? "Updating password..." : "Reset Password"}
                                </button>
                            </form>
                        )}

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

export default ResetPassword;