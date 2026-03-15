import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { LockKeyhole, Mail, ShoppingBag } from "lucide-react";
import Input from "../components/ui/Input";
import SEO from "../components/seo/SEO";
import { useLoginMutation } from "../api/auth/authApi";
import { useToast } from "../hooks/useToast";

const Login = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const toast = useToast();

    const loginSEO = {
        title: "Login - Best Online Shopping Store",
        description:
            "Login to your FashionHub BD account to access your orders, wishlist, and personalized recommendations. Enjoy seamless shopping with our secure login. Don&apos;t have an account? Sign up now for exclusive offers and updates!",
        keywords:
            "login fashion hub, user login, account access, secure login, fashion shopping account, online store login, customer login, sign in fashion hub, fashion hub account, shop online login",
        image: "https://e-commerce.shimanto.dev/login-banner.jpg",
        url: "/login",
        type: "website",
    };

    const [loginUser, { isLoading }] = useLoginMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onTouched",
    });

    const onSubmit = async (data) => {
        setServerError("");
        try {
             await loginUser(data).unwrap();
            toast.success({
                title: "Login successful",
                message: "Welcome back! Redirecting to homepage...",
            });
            navigate("/");
        } catch (error) {
            toast.error({
                title: "Login failed",
                message: error?.data?.message || "An error occurred during login",
            });
            setServerError(error?.data?.message || "An error occurred during login");
        }
    };

    return (
        <>
            <SEO {...loginSEO} />

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
                            <h2 className="text-3xl font-bold tracking-tight">Login</h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Enter your email and password to access your account.
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

                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                leftIcon={<LockKeyhole size={18} />}
                                error={errors.password?.message}
                                required
                                autoComplete="current-password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    },
                                })}
                            />

                            {/* Forgot password */}
                            <div className="flex justify-end">
                                <Link
                                    to="/forget-password"
                                    className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Server Error */}
                            {serverError && (
                                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
                                    {serverError}
                                </p>
                            )}

                            {/* Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                            >
                                {isLoading ? "Signing in..." : "Login"}
                            </button>
                        </form>

                        {/* Signup */}
                        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            Don&apos;t have an account?{" "}
                            <Link
                                to="/register"
                                className="font-semibold text-slate-900 hover:underline dark:text-white"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Login;