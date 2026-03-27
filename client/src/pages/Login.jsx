import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { LockKeyhole, Mail, ShoppingBag } from "lucide-react";
import Input from "../components/ui/Input";
import SEO from "../components/seo/SEO";
import { useLoginMutation } from "../api/auth/authApi";
import { useToast } from "../hooks/useToast";

const Login = () => {
    const navigate = useNavigate();
    const { push } = useToast();

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
        try {
            await loginUser(data).unwrap();
            push({
                title: "Login successful",
                message: "Welcome back! Redirecting to homepage...",
                variant: "success"
            });
            navigate("/");
        } catch (error) {
            push({
                title: "Login failed",
                message: error?.data?.message || "An error occurred during login",
                variant: "error"
            });
        }
    };

    return (
        <>
            <SEO {...loginSEO} />
            <section className="w-full px-4 py-10 transition-colors duration-300">
                <div className="mx-auto flex max-w-md items-center justify-center">
                    <div className="w-full rounded-3xl border p-8 shadow-xl">
                        {/* Logo */}
                        <div className="mb-6 flex justify-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border">
                                <ShoppingBag size={22} />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold tracking-tight">Login</h2>
                            <p className="mt-2 text-sm">
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
                                    className="text-sm font-medium transition hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex cursor-pointer h-11 w-full items-center justify-center rounded-xl border px-5 text-sm font-semibold transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? "Signing in..." : "Login"}
                            </button>
                        </form>

                        {/* Signup */}
                        <p className="mt-6 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link to="/register" className="font-semibold hover:underline">
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