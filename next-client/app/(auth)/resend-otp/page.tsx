import Link from "next/link";
import AuthShell from "@/components/auth/Auth-Shell";
import ResendOtpForm from "@/components/auth/ResendOtpForm";

export default function ResendOtpPage() {
  return (
    <AuthShell
      title="Resend verification code"
      description="If your account is not verified yet, send a new OTP to your email address."
      footer={
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Already have a code?{" "}
          <Link
            href="/verify-otp"
            className="font-medium text-[#3f51f7] transition hover:text-[#3041d2]"
          >
            Verify email
          </Link>
        </p>
      }
    >
      <ResendOtpForm />
    </AuthShell>
  );
}
