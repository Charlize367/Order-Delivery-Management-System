import { Navigate } from "react-router-dom"
import { useAuth} from "./AuthContext"


const ProtectedRoute = ({ children, allowedRoles }) => {
    const {user, token } = useAuth();

    if (!token || !user) return <Navigate to="/login" />

    const userRoleString = user.role ? String(user.role).trim().toUpperCase() : "";


const normalizedAllowedRoles = allowedRoles.map(r => String(r).trim().toUpperCase());


const hasAccess = normalizedAllowedRoles.includes(userRoleString);

if (!hasAccess) return <Navigate to="/login" />;



    return children;


};

export default ProtectedRoute;