import Link from "next/link";
import AuthShell from "@/components/auth/Auth-Shell";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Join Shimanto Store to track orders, save details, and shop faster."
      footer={
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#3f51f7] transition hover:text-[#3041d2]"
          >
            Login
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
