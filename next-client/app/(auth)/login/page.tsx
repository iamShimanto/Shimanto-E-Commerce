import Link from "next/link";
import AuthShell from "@/components/auth/Auth-Shell";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Login"
      description="Sign in to access your account, saved details, and order history."
      footer={
        <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[#3f51f7] transition hover:text-[#3041d2]"
            >
              Create one
            </Link>
          </p>
          <p>
            Account not verified?{" "}
            <Link
              href="/resend-otp"
              className="font-medium text-[#3f51f7] transition hover:text-[#3041d2]"
            >
              Resend OTP
            </Link>
          </p>
        </div>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
