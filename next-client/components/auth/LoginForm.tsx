"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiMail } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/components/auth/auth-utils";
import { useLoginUserMutation } from "@/services/auth.service";

const initialState = {
  email: "",
  password: "",
  rememberMe: true,
};

export default function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await loginUser({ email: form.email, password: form.password }).unwrap();
      toast.success("Login successful", "You are now signed in.");
      router.replace("/");
      router.refresh();
    } catch (submissionError) {
      const message = getApiErrorMessage(
        submissionError,
        "Unable to sign in. Please check your credentials and try again.",
      );
      setError(message);
      toast.error("Login failed", message);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
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
        value={form.email}
        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        required
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        startIcon={<FiLock className="h-4 w-4" />}
        value={form.password}
        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        required
      />

      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={form.rememberMe}
            onChange={(event) =>
              setForm((current) => ({ ...current, rememberMe: event.target.checked }))
            }
            className="h-4 w-4 rounded border-slate-300 text-[#3f51f7] focus:ring-[#3f51f7]"
          />
          Remember me
        </label>
      </div>

      <Button type="submit" fullWidth loading={isLoading} loadingLabel="Signing in...">
        Login
      </Button>
    </form>
  );
}