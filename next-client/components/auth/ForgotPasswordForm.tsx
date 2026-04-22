"use client";

import { useState, type FormEvent } from "react";
import { FiMail } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/components/auth/auth-utils";
import { useRequestPasswordResetMutation } from "@/services/auth.service";

export default function ForgotPasswordForm() {
  const toast = useToast();
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await toast.promise(requestReset({ email }).unwrap(), {
        loading: {
          title: "Sending reset link",
          description: "Please wait while we prepare your password reset email.",
          kind: "loading",
        },
        success: {
          title: "Reset link sent",
          description: "If the email exists, you will receive a password reset link shortly.",
          kind: "success",
        },
        error: (submissionError) => {
          const message = getApiErrorMessage(
            submissionError,
            "Unable to send reset link right now.",
          );

          return {
            title: "Reset request failed",
            description: message,
            kind: "error",
          };
        },
      });

      setSubmitted(true);
    } catch (submissionError) {
      const message = getApiErrorMessage(
        submissionError,
        "Unable to send reset link right now.",
      );
      setError(message);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {submitted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          If that email is registered, we sent a reset link.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

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

      <Button type="submit" fullWidth loading={isLoading} loadingLabel="Sending link...">
        Send reset link
      </Button>
    </form>
  );
}