import { Navigate, useLocation } from "react-router";
import { useProfileQuery } from "../../api/auth/authApi";
import { Spinner } from "../ui/SkeletonLoader";

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const { data, isLoading } = useProfileQuery();

    if (isLoading) {
        return (
            <Spinner />
        );
    }

    const user = data?.data || data?.user || null;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;