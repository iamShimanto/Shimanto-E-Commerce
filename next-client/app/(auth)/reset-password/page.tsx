import Link from "next/link";
import AuthShell from "@/components/auth/Auth-Shell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset password"
      description="Use the secure link from your email to create a new password."
      footer={
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Need a new reset link?{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-[#3f51f7] transition hover:text-[#3041d2]"
          >
            Request another one
          </Link>
        </p>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
