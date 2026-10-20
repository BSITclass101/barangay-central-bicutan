import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ permissionKey, children }) => {
  const { user } = useAuth();

  // Kung walang permissionKey, hayaan lang (tulad ng Dashboard)
  if (!permissionKey) return children;

  // Safe check kung may user at permissions
  if (!user || !user.permissions) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const modulePermissions = user.permissions[permissionKey];

  // Function para i-check kung may "view" access (same logic sa Sidebar)
  const hasViewAccess = () => {
    if (!modulePermissions) return false;

    // Case 1: Direct permission
    if (typeof modulePermissions.view === "boolean") {
      return modulePermissions.view === true;
    }

    // Case 2: Parent permission (may mga anak)
    if (typeof modulePermissions === "object") {
      return Object.values(modulePermissions).some(
        (child) => child?.view === true
      );
    }

    return false;
  };

  // Kung walang access, i-redirect sa Dashboard
  if (!hasViewAccess()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;