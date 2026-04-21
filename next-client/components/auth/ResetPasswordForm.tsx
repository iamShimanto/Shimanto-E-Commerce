"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { FiLock, FiShield } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/components/auth/auth-utils";
import { useResetPasswordChangeMutation } from "@/services/auth.service";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [resetPassword, { isLoading }] = useResetPasswordChangeMutation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!token) {
      const message = "Reset token is missing. Open the link from your email again.";
      setError(message);
      toast.error("Reset failed", message);
      return;
    }

    if (password !== confirmPassword) {
      const message = "Passwords do not match.";
      setError(message);
      toast.error("Reset failed", message);
      return;
    }

    try {
      await resetPassword({ token, newPassword: password }).unwrap();
      toast.success(
        "Password updated",
        "Your password has been changed successfully. You can log in now.",
      );
      router.replace("/login");
    } catch (submissionError) {
      const message = getApiErrorMessage(
        submissionError,
        "Unable to update your password right now.",
      );
      setError(message);
      toast.error("Reset failed", message);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Open the password reset link from your email to continue.
        </div>

        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center rounded-full bg-[#3f51f7] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#3041d2]"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
        <div className="flex items-center gap-2 font-medium">
          <FiShield className="h-4 w-4" />
          Secure reset link detected
        </div>
        <p className="mt-1 leading-6">
          Create a new password for your account below.
        </p>
      </div>

      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="Enter a new password"
        startIcon={<FiLock className="h-4 w-4" />}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        startIcon={<FiLock className="h-4 w-4" />}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
      />

      <Button type="submit" fullWidth loading={isLoading} loadingLabel="Updating password...">
        Reset password
      </Button>
    </form>
  );
}