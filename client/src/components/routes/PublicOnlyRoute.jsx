import { Navigate } from "react-router";
import { useProfileQuery } from "../../api/auth/authApi";

const PublicOnlyRoute = ({ children }) => {
    const { data, isLoading } = useProfileQuery();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                Loading...
            </div>
        );
    }

    const user = data?.data || data?.user || null;

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicOnlyRoute;