
import { useAuth } from "../context/AuthContext";

export const usePermission = () => {
  const { user, activeRole } = useAuth();

  const permissions = user?.permissions || {};

  const userRole = String(
    activeRole || user?.role || ""
  )
    .trim()
    .toLowerCase();

  const can = (section, module, action) => {
    // Admin has full access
    if (userRole === "admin") {
      return true;
    }

    // No authenticated user
    if (!user) {
      return false;
    }

    // Validate requested permission
    const allowedActions = [
      "view",
      "create",
      "edit",
      "delete",
    ];

    if (
      !section ||
      !module ||
      !allowedActions.includes(action)
    ) {
      return false;
    }

    // Check the exact permission
    return (
      permissions?.[section]?.[module]?.[action] === true
    );
  };

  const canView = (section, module) =>
    can(section, module, "view");

  const canCreate = (section, module) =>
    can(section, module, "create");

  const canEdit = (section, module) =>
    can(section, module, "edit");

  const canDelete = (section, module) =>
    can(section, module, "delete");

  return {
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
};

export default usePermission;
