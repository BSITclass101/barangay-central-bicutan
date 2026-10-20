// src/admin/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// =====================================================
// ✅ MASTER ADMIN CHECK
// =====================================================
const isMasterAdminCheck = (user) => {
  if (!user) return false;
  return (
    user.isMasterAdmin === true ||
    user.username === "masteradmin" ||
    user.id === 0 ||
    user.id === "0"
  );
};

// =====================================================
// ✅ FORMAT ROLE LABEL
// =====================================================
const getRoleLabel = (user) => {
  if (!user) return "User";

  if (isMasterAdminCheck(user)) {
    return "Master Admin";
  }

  const role = String(user.role || "").trim().toLowerCase();
  if (role === "admin") return "Admin";
  if (role === "staff") return "Staff";
  if (role === "secretary") return "Secretary";
  if (role === "treasurer") return "Treasurer";
  if (role === "kagawad" || role === "councilor") return "Kagawad";

  return role.charAt(0).toUpperCase() + role.slice(1);
};

const AdminLayout = () => {
  const location = useLocation();

  const isUserManagementActive =
    location.pathname.startsWith("/admin/users");

  const [isUsersOpen, setIsUsersOpen] = useState(
    isUserManagementActive
  );

  const { user, logout, loading } = useAuth();

  // =====================================================
  // ROLE AND PERMISSIONS
  // =====================================================
  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  const isAdmin = role === "admin" || isMasterAdminCheck(user);

  const permissions = user?.permissions || {};

  // =====================================================
  // CHECK MODULE ACCESS
  // =====================================================
  const hasAccess = (section, module, action = "view") => {
    if (isAdmin) return true;

    if (!user || !section || !module || !action) {
      return false;
    }

    try {
      return (
        permissions?.[section]?.[module]?.[action] === true
      );
    } catch {
      return false;
    }
  };

  // =====================================================
  // USER MANAGEMENT ACCESS
  // =====================================================
  const canViewOfficials = hasAccess("userManagement", "officials");
  const canViewResidents = hasAccess("userManagement", "residents");
  const canViewRoles = hasAccess("userManagement", "roles");

  const canViewUserManagement =
    canViewOfficials || canViewResidents || canViewRoles;

  // =====================================================
  // DASHBOARD ACCESS
  // =====================================================
  const canViewDashboard = hasAccess("dashboardModule", "dashboard");

  // =====================================================
  // AUTO CLOSE USER DROPDOWN
  // =====================================================
  useEffect(() => {
    if (!isUserManagementActive) {
      setIsUsersOpen(false);
    } else {
      setIsUsersOpen(true);
    }
  }, [isUserManagementActive]);

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = () => {
    logout();
  };

  // =====================================================
  // NAVIGATION STYLES
  // =====================================================
  const mainLinkClass = ({ isActive }) =>
    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-emerald-700 text-white font-semibold"
        : "text-emerald-100 hover:bg-emerald-800"
    }`;

  const subLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-xs font-medium transition-colors ${
      isActive
        ? "bg-emerald-800 text-white font-bold shadow-inner"
        : "text-emerald-200 hover:bg-emerald-800/50"
    }`;

  // Wait until the authentication provider restores the session.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
          <p className="text-sm text-gray-600">
            Loading your session...
          </p>
        </div>
      </div>
    );
  }

  // The route guard should normally handle this as well.
  if (!user || role === "resident") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* SIDEBAR */}
      <aside className="flex w-64 flex-col justify-between bg-[#064e3b] text-white shadow-lg">
        <div className="overflow-y-auto">
          {/* HEADER */}
          <div className="p-5 text-2xl font-bold tracking-wide">
            Barangay Central

            <div className="mt-0.5 text-xs font-normal uppercase tracking-wider text-emerald-300">
              Management System
            </div>

            {/* ✅ ROLE BADGE — Dynamic (Master Admin = golden) */}
            {user?.role && (
              <div
                className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  isMasterAdminCheck(user)
                    ? "bg-amber-400 text-amber-950 font-bold shadow-md"
                    : "bg-emerald-800 text-emerald-100"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isMasterAdminCheck(user)
                      ? "bg-amber-900"
                      : "bg-emerald-300"
                  }`}
                />
                {getRoleLabel(user)}
              </div>
            )}
          </div>

          {/* NAVIGATION */}
          <nav className="mt-4 space-y-1 px-3">
            {/* DASHBOARD */}
            {canViewDashboard && (
              <NavLink to="/admin/dashboard" className={mainLinkClass}>
                Dashboard
              </NavLink>
            )}

            {/* USER MANAGEMENT */}
            {canViewUserManagement && (
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setIsUsersOpen((previous) => !previous)
                  }
                  aria-expanded={isUsersOpen}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isUserManagementActive
                      ? "bg-emerald-700 font-semibold text-white"
                      : "text-emerald-100 hover:bg-emerald-800"
                  }`}
                >
                  <span>User Management</span>

                  <span
                    className={`transform text-xs transition-transform duration-200 ${
                      isUsersOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {isUsersOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-emerald-600 py-1 pl-6">
                    {canViewOfficials && (
                      <NavLink
                        to="/admin/users/officials"
                        className={subLinkClass}
                      >
                        Officials
                      </NavLink>
                    )}

                    {canViewResidents && (
                      <NavLink
                        to="/admin/users/residents"
                        className={subLinkClass}
                      >
                        Residents
                      </NavLink>
                    )}

                    {canViewRoles && (
                      <NavLink
                        to="/admin/users/roles"
                        className={subLinkClass}
                      >
                        Roles
                      </NavLink>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* RESIDENTS RECORD */}
            {hasAccess("residentsRecord", "residentsList") && (
              <NavLink to="/admin/residents" className={mainLinkClass}>
                Residents Record
              </NavLink>
            )}

            {/* COMMUNITY HOUSEHOLD */}
            {hasAccess("communityHousehold", "households") && (
              <NavLink to="/admin/households" className={mainLinkClass}>
                Community Household
              </NavLink>
            )}

            {/* CERTIFICATE ISSUANCE */}
            {hasAccess("certificateIssuance", "certificates") && (
              <NavLink to="/admin/certificates" className={mainLinkClass}>
                Certificate Issuance
              </NavLink>
            )}

            {/* SERVICE REQUESTS */}
            {hasAccess("serviceRequests", "requests") && (
              <NavLink to="/admin/services" className={mainLinkClass}>
                Service Requests
              </NavLink>
            )}

            {/* BLOTTER RECORDS */}
            {hasAccess("blotterRecords", "blotter") && (
              <NavLink to="/admin/blotter" className={mainLinkClass}>
                Blotter Records
              </NavLink>
            )}

            {/* INCIDENT REPORTS */}
            {hasAccess("incidentReports", "incidents") && (
              <NavLink to="/admin/incidents" className={mainLinkClass}>
                Incident Reports
              </NavLink>
            )}

            {/* REPORTS */}
            {hasAccess("reportsModule", "reports") && (
              <NavLink to="/admin/reports" className={mainLinkClass}>
                Reports
              </NavLink>
            )}

            {/* SETTINGS */}
            {hasAccess("settingsModule", "settings") && (
              <NavLink to="/admin/settings" className={mainLinkClass}>
                Settings
              </NavLink>
            )}
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="border-t border-emerald-800/60 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full cursor-pointer rounded-lg px-4 py-2.5 text-left text-sm font-medium text-emerald-100 transition-colors hover:bg-red-500/20 hover:text-red-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;