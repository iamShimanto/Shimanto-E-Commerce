import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { LockKeyhole, Mail, ShoppingBag, User } from "lucide-react";
import Input from "../components/ui/Input";
import SEO from "../components/seo/SEO";
import { useRegisterMutation } from "../api/auth/authApi";
import { useToast } from "../hooks/useToast";

const Register = () => {
    const navigate = useNavigate();
    const { push } = useToast();
    const registerSEO = {
        title: "Register - Best Online Shopping Store",
        description:
            "Create an account with FashionHub BD to access your orders, wishlist, and personalized recommendations.",
        keywords:
            "register, sign up, account creation, e-commerce registration",
        image: "https://e-commerce.shimanto.dev/register-banner.jpg",
        url: "/register",
        type: "website",
    };

    const [registerUser, { isLoading }] = useRegisterMutation();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onTouched",
    });

    const password = watch("password");

    const onSubmit = async (data) => {

        const payload = {
            fullName: data.fullName,
            email: data.email,
            password: data.password,
        };

        try {
            await registerUser(payload).unwrap();

            push({
                title: "Registration successful",
                message: "Your account has been created. Please verify your email.",
                variant: "success"
            });
            reset();
            navigate("/verify-otp", {
                state: { email: data.email },
                replace: true,
            });
        } catch (error) {
            push({
                title: "Registration failed",
                message: error?.data?.message || "An error occurred during registration",
                variant: "error"
            });
        }
    };

    return (
        <>
            <SEO {...registerSEO} />

            <section className="w-full px-4 py-10 text-slate-900 transition-colors duration-300 dark:text-slate-100">
                <div className="mx-auto flex max-w-md items-center justify-center">
                    <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">
                        <div className="mb-6 flex justify-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black">
                                <ShoppingBag size={22} />
                            </div>
                        </div>

                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold tracking-tight">
                                Create Account
                            </h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Enter your details below to create your account.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <Input
                                label="Full Name"
                                type="text"
                                placeholder="Enter your full name"
                                leftIcon={<User size={18} />}
                                error={errors.fullName?.message}
                                required
                                {...register("fullName", {
                                    required: "Full name is required",
                                    minLength: {
                                        value: 2,
                                        message: "Name must be at least 2 characters",
                                    },
                                })}
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="Enter your email"
                                leftIcon={<Mail size={18} />}
                                error={errors.email?.message}
                                required
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
                                placeholder="Create a password"
                                leftIcon={<LockKeyhole size={18} />}
                                error={errors.password?.message}
                                required
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    },
                                })}
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                leftIcon={<LockKeyhole size={18} />}
                                error={errors.confirmPassword?.message}
                                required
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) =>
                                        value === password || "Passwords do not match",
                                })}
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                            >
                                {isLoading ? "Creating account..." : "Sign Up"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-slate-900 hover:underline dark:text-white"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Register;