import Button from "../components/ui/Button"
import Field from "../components/ui/Field"
import Input from "../components/ui/Input"

export default function Login() {
  return (
    <div
      className="min-h-dvh px-4 py-10 flex items-center justify-center"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-xl shadow-black/10">
          <div className="text-lg font-extrabold tracking-tight text-center">Welcome back</div>
          <div className="mt-1 text-sm font-semibold text-(--text-muted) text-center">
            Sign in to continue to Admin.
          </div>

          <div className="mt-6 space-y-3">
            <Field label="Email">
              <Input placeholder="admin@shimanto.com" />
            </Field>

            <Field label="Password">
              <Input type="password" placeholder="••••••••" />
            </Field>
          </div>

          <div className="mt-6">
            <Button type="button" className="w-full">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}