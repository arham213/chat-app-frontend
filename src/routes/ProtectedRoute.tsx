import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/localStorage";

/**
 * Wraps protected routes. Redirects to sign-in if no user token is found in sessionStorage.
 */
const ProtectedRoute = () => {
    const user = getUser();
    if (!user || !user.token) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};

export default ProtectedRoute;
