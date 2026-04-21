"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiMail, FiPhone, FiUser } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/components/auth/auth-utils";
import { useRegisterUserMutation } from "@/services/auth.service";

type RegisterFormState = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
};

const initialState: RegisterFormState = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      const message = "Passwords do not match.";
      setError(message);
      toast.error("Registration failed", message);
      return;
    }

    try {
      await registerUser({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
        password: form.password,
      }).unwrap();

      toast.success(
        "Account created",
        "We sent a verification code to your email address.",
      );
      router.replace(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (submissionError) {
      const message = getApiErrorMessage(
        submissionError,
        "Unable to create your account right now.",
      );
      setError(message);
      toast.error("Registration failed", message);
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
        label="Full name"
        type="text"
        autoComplete="name"
        placeholder="Your full name"
        startIcon={<FiUser className="h-4 w-4" />}
        value={form.fullName}
        onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
        required
      />

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
        label="Phone"
        type="tel"
        autoComplete="tel"
        placeholder="Optional phone number"
        startIcon={<FiPhone className="h-4 w-4" />}
        value={form.phone}
        onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
      />

      <Textarea
        label="Address"
        placeholder="Optional address"
        rows={3}
        helperText="Use the address where you want deliveries sent."
        value={form.address}
        onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="Create a password"
        startIcon={<FiLock className="h-4 w-4" />}
        value={form.password}
        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        helperText="Must be at least 6 characters."
        required
      />

      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        startIcon={<FiLock className="h-4 w-4" />}
        value={form.confirmPassword}
        onChange={(event) =>
          setForm((current) => ({ ...current, confirmPassword: event.target.value }))
        }
        required
      />

      <Button type="submit" fullWidth loading={isLoading} loadingLabel="Creating account...">
        Create account
      </Button>
    </form>
  );
}