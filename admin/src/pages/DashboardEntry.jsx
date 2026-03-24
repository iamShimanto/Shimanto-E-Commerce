import { Navigate } from "react-router"
import { useProfileQuery } from "../api/auth/authApi"

export default function DashboardEntry() {
    const { data: user, isLoading } = useProfileQuery()

    if (isLoading) {
        return (
            <div
                className="min-h-[40vh] flex items-center justify-center px-4"
                style={{ color: "var(--text)" }}
            >
                <div className="text-sm font-semibold text-(--text-muted)">Loading…</div>
            </div>
        )
    }

    const role = String(user?.role || "").toLowerCase()

    if (role === "staff") return <Navigate to="/staff-dashboard" replace />
    return <Navigate to="/admin-dashboard" replace />
}
