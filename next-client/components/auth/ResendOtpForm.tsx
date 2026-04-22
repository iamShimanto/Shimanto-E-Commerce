"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiMail } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/components/auth/auth-utils";
import { useResendOtpMutation } from "@/services/auth.service";

export default function ResendOtpForm() {
  const router = useRouter();
  const toast = useToast();
  const [resendOtp, { isLoading }] = useResendOtpMutation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await toast.promise(resendOtp({ email }).unwrap(), {
        loading: {
          title: "Sending verification code",
          description: "Please wait while we send a fresh OTP to your inbox.",
          kind: "loading",
        },
        success: {
          title: "Code sent",
          description: "We sent a new verification code to your email.",
          kind: "success",
        },
        error: (submissionError) => {
          const message = getApiErrorMessage(
            submissionError,
            "Unable to send the verification code right now.",
          );

          return {
            title: "Resend failed",
            description: message,
            kind: "error",
          };
        },
      });

      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (submissionError) {
      const message = getApiErrorMessage(
        submissionError,
        "Unable to send the verification code right now.",
      );
      setError(message);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
        <p className="leading-6">
          Enter the email address you used to register. We will send a fresh OTP
          so you can verify your account.
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

      <Button
        type="submit"
        fullWidth
        loading={isLoading}
        loadingLabel="Sending code..."
      >
        Send verification code
      </Button>
    </form>
  );
}
