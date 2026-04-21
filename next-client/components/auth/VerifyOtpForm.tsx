"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiMail, FiShield } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/components/auth/auth-utils";
import { useResendOtpMutation, useVerifyOtpMutation } from "@/services/auth.service";

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await verifyOtp({ email, otp }).unwrap();
      toast.success(
        "Email verified",
        "Your account is now active. You can log in next.",
      );
      router.replace("/login");
    } catch (submissionError) {
      const message = getApiErrorMessage(
        submissionError,
        "Unable to verify the code right now.",
      );
      setError(message);
      toast.error("Verification failed", message);
    }
  };

  const handleResend = async () => {
    setError("");

    try {
      await resendOtp({ email }).unwrap();
      toast.success(
        "Code resent",
        "We sent a fresh verification code to your inbox.",
      );
    } catch (submissionError) {
      const message = getApiErrorMessage(
        submissionError,
        "Unable to resend the code right now.",
      );
      setError(message);
      toast.error("Resend failed", message);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleVerify}>
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
        <div className="flex items-center gap-2 font-medium">
          <FiShield className="h-4 w-4" />
          Check your email for the verification code
        </div>
        <p className="mt-1 leading-6">
          If you just registered, the code should arrive within a few seconds.
        </p>
      </div>

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        startIcon={<FiMail className="h-4 w-4" />}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <Input
        label="Verification code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="6 digit code"
        value={otp}
        onChange={(event) => setOtp(event.target.value)}
        required
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" fullWidth loading={isVerifying} loadingLabel="Verifying...">
          Verify email
        </Button>

        <Button
          type="button"
          variant="outline"
          fullWidth
          loading={isResending}
          loadingLabel="Resending..."
          onClick={handleResend}
          disabled={!email}
        >
          Resend code
        </Button>
      </div>
    </form>
  );
}