import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router"
import { useToast } from "../hooks/useToast"

import Button from "../components/ui/Button"
import Field from "../components/ui/Field"
import Input from "../components/ui/Input"
import { useLoginMutation, useProfileQuery } from "../store/auth/authApi"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const { data: user } = useProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const [triggerLogin, { isLoading }] = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true })
    }
  }, [user, navigate])

  const onSubmit = async (values) => {
    try {
      await triggerLogin(values).unwrap()

      const nextPath = location.state?.from?.pathname || "/"
      navigate(nextPath, { replace: true })
      toast.success("Signed in")
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error ||
        (typeof error === "string" ? error : null) ||
        "Login failed"

      toast.error("Login failed", message)
    }
  }

  return (
    <div
      className="min-h-dvh px-4 py-10 flex items-center justify-center"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="mx-auto w-full max-w-md">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-xl shadow-black/10"
        >
          <div className="text-lg font-extrabold tracking-tight text-center">Welcome back</div>
          <div className="mt-1 text-sm font-semibold text-(--text-muted) text-center">
            Sign in to continue to Admin.
          </div>

          <div className="mt-6 space-y-3">
            <Field label="Email" error={errors.email?.message}>
              <Input
                placeholder="admin@shimanto.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter a valid email",
                  },
                })}
              />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <Input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Min 6 characters" },
                })}
              />
            </Field>
          </div>

          <div className="mt-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign In"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}