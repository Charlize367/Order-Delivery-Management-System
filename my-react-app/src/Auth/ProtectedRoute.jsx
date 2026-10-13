import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
const { user, token } = useAuth();
const location = useLocation();


if (!token || !user) {
    return (
        <Navigate
            to="/login"
            state={{
                message: "Your session has expired. Please log in again.",
                from: location.pathname,
            }}
            replace
        />
    );
}

const userRoleString = user.role
    ? String(user.role).trim().toUpperCase()
    : "";

const normalizedAllowedRoles = allowedRoles.map(
    r => String(r).trim().toUpperCase()
);

const hasAccess = normalizedAllowedRoles.includes(userRoleString);

if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
}

return children;


};

export default ProtectedRoute;
