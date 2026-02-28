import { Navigate, useLocation } from "react-router"
import { useProfileQuery } from "../../store/auth/authApi"

export default function RequireAuth({ children }) {
    const location = useLocation()
    const { data: user, isLoading, isError, error } = useProfileQuery(undefined, {
        refetchOnMountOrArgChange: true,
    })

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

    if (isError && error?.status === 401) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return children
}
