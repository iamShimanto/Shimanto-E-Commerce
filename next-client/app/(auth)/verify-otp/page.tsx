import Link from "next/link";
import AuthShell from "@/components/auth/Auth-Shell";
import VerifyOtpForm from "@/components/auth/VerifyOtpForm";

export default function VerifyOtpPage() {
  return (
    <AuthShell
      title="Verify your email"
      description="Enter the 6-digit code we sent to your inbox to activate your account."
      footer={
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Already verified?{" "}
          <Link
            href="/login"
            className="font-medium text-[#3f51f7] transition hover:text-[#3041d2]"
          >
            Login
          </Link>
        </p>
      }
    >
      <VerifyOtpForm />
    </AuthShell>
  );
}