import { Navigate, useLocation } from "react-router"
import { useProfileQuery } from "../../api/auth/authApi"

export default function RequireRole({ roles = [], children, fallbackPath = "/" }) {
    const location = useLocation()
    const { data: user, isLoading } = useProfileQuery()

    if (isLoading) {
        return (
            <div
                className="min-h-dvh flex items-center justify-center px-4"
                style={{ background: "var(--bg)", color: "var(--text)" }}
            >
                <div className="text-sm font-semibold text-(--text-muted)">Loading…</div>
            </div>
        )
    }

    const role = String(user?.role || "").toLowerCase()
    const allowed = roles.map((r) => String(r).toLowerCase())

    if (!allowed.includes(role)) {
        return (
            <Navigate
                to={fallbackPath}
                replace
                state={{
                    from: location,
                    unauthorized: true,
                    message: "You are not allowed to access this page.",
                }}
            />
        )
    }

    return children
}
