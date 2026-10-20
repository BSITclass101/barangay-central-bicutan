// src/App.jsx
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useEffect } from "react";

// ==================================================
// COMPONENTS
// ==================================================
import Navbar from "./components/Navbar";

// ==================================================
// PUBLIC PAGES
// ==================================================
import Home from "./pages/Home";
import Login from "./pages/Login";             // ✅ Resident Login (green)
import AdminLogin from "./pages/AdminLogin";   // ✅ Admin Login (blue)
import About from "./pages/About";

// ==================================================
// AUTH PAGES
// ==================================================
import ForgotPassword from "./resident/ForgotPassword";
import ResetPassword from "./resident/ResetPassword";

// ==================================================
// ADMIN
// ==================================================
import AdminLayout from "./admin/AdminLayout";

import Dashboard from "./admin/Dashboard";
import UserManagement from "./admin/UserManagement";
import Residents from "./admin/Residents";
import ResidentsRecord from "./admin/ResidentsRecord";
import CommunityHousehold from "./admin/CommunityHousehold";
import CertificateIssuance from "./admin/CertificateIssuance";
import ServiceRequests from "./admin/ServiceRequests";
import BlotterRecords from "./admin/BlotterRecords";
import IncidentReports from "./admin/IncidentReports";
import Reports from "./admin/Reports";
import Settings from "./admin/Settings";
import Officials from "./admin/Officials";
import Roles from "./admin/Roles";

// ==================================================
// RESIDENT PORTAL
// ==================================================
import ResidentLayout from "./resident/ResidentLayout";
import ResidentDashboard from "./resident/ResidentDashboard";
import MyProfile from "./resident/MyProfile";
import CertificateRequests from "./resident/CertificateRequests";
import MyCertificates from "./resident/MyCertificates";
import Notifications from "./resident/Notifications";

// ==================================================
// PRINT PAGES
// ==================================================
import CertificatePrint from "./print/CertificatePrint";

// ==================================================
// SERVICES
// ==================================================
import BarangayClearance from "./pages/BarangayClearance";
import CertificateOfIndigency from "./pages/CertificateOfIndigency";
import CertificateOfResidency from "./pages/CertificateOfResidency";
import BusinessPermit from "./pages/BusinessPermit";
import BarangayID from "./pages/BarangayID";
import BarangayPermit from "./pages/BarangayPermit";
import HealthServices from "./pages/HealthServices";
import SocialWelfare from "./pages/SocialWelfare";

// ==================================================
// SESSION CONFIG
// ==================================================
const SESSION_DURATION = 8 * 60 * 60 * 1000;

const ADMIN_KEYS = {
  loggedIn: "admin_isLoggedIn",
  role: "admin_role",
  permissions: "admin_permissions",
  token: "admin_sessionToken",
  loginTime: "admin_loginTime",
};

const RESIDENT_KEYS = {
  loggedIn: "resident_isLoggedIn",
  role: "resident_role",
  token: "resident_sessionToken",
  loginTime: "resident_loginTime",
};

// ==================================================
// SESSION VALIDATION
// ==================================================
const isSessionValid = (keys) => {
  const loggedIn = sessionStorage.getItem(keys.loggedIn) === "true";
  const loginTime = Number(sessionStorage.getItem(keys.loginTime));

  if (!loggedIn || !Number.isFinite(loginTime)) {
    return false;
  }

  const elapsed = Date.now() - loginTime;
  if (elapsed < 0 || elapsed >= SESSION_DURATION) {
    return false;
  }

  if (keys === ADMIN_KEYS) {
    const token = sessionStorage.getItem(keys.token);
    if (!token || token.length < 32) {
      return false;
    }
  }

  return true;
};

const isAdminLoggedIn = () => {
  if (!isSessionValid(ADMIN_KEYS)) {
    return false;
  }

  const role = String(sessionStorage.getItem(ADMIN_KEYS.role) || "")
    .trim()
    .toLowerCase();

  return role !== "" && role !== "resident";
};

const isResidentLoggedIn = () => {
  if (!isSessionValid(RESIDENT_KEYS)) {
    return false;
  }

  const role = String(sessionStorage.getItem(RESIDENT_KEYS.role) || "")
    .trim()
    .toLowerCase();

  return role === "resident";
};

// ==================================================
// PERMISSIONS
// ==================================================
const getAdminPermissions = () => {
  try {
    const saved = sessionStorage.getItem(ADMIN_KEYS.permissions);

    if (!saved) {
      return {};
    }

    const permissions = JSON.parse(saved);

    return permissions &&
      typeof permissions === "object" &&
      !Array.isArray(permissions)
      ? permissions
      : {};
  } catch {
    return {};
  }
};

const isSuperAdmin = () => {
  return (
    String(sessionStorage.getItem(ADMIN_KEYS.role) || "")
      .trim()
      .toLowerCase() === "admin"
  );
};

const hasPermission = (permissions, section, module, action = "view") => {
  if (isSuperAdmin()) {
    return true;
  }

  if (!section || !module || !action) {
    return false;
  }

  return permissions?.[section]?.[module]?.[action] === true;
};

// ==================================================
// ADMIN PROTECTED ROUTE
// ==================================================
const ProtectedRoute = ({
  children,
  section,
  module,
  action = "view",
}) => {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (!section || !module) {
    return children;
  }

  const permissions = getAdminPermissions();

  if (!hasPermission(permissions, section, module, action)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

// ==================================================
// USER MANAGEMENT ROUTE
// ==================================================
const UserManagementRoute = ({ children }) => {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (isSuperAdmin()) {
    return children;
  }

  const permissions = getAdminPermissions();

  const canViewAnyUserModule = [
    ["userManagement", "officials"],
    ["userManagement", "residents"],
    ["userManagement", "roles"],
  ].some(([section, module]) =>
    hasPermission(permissions, section, module, "view")
  );

  if (!canViewAnyUserModule) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

// ==================================================
// RESIDENT PROTECTED ROUTE
// ==================================================
const ResidentRoute = ({ children }) => {
  if (!isResidentLoggedIn()) {
    return <Navigate to="/resident-login" replace />;
  }

  return children;
};

// ==================================================
// SESSION WATCHER
// ==================================================
function SessionWatcher() {
  useEffect(() => {
    const validateCurrentSession = () => {
      const path = window.location.pathname.toLowerCase();

      // ✅ Skip sa auth pages
      if (
        path === "/login" ||
        path === "/resident-login" ||
        path === "/forgot-password" ||
        path === "/reset-password"
      ) {
        return;
      }

      // ✅ Skip sa print pages
      if (path.startsWith("/print/")) {
        return;
      }

      if (path.startsWith("/admin") && !isAdminLoggedIn()) {
        window.location.replace("/login");
        return;
      }

      if (path.startsWith("/resident") && !isResidentLoggedIn()) {
        window.location.replace("/resident-login");
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        validateCurrentSession();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        validateCurrentSession();
      }
    };

    const handleFocus = () => {
      validateCurrentSession();
    };

    validateCurrentSession();

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}

// ==================================================
// APP
// ==================================================
function App() {
  return (
    <>
      <SessionWatcher />

      <Routes>
        {/* ✅ PRINT PAGES (PUBLIC) */}
        <Route path="/print/certificate/:id" element={<CertificatePrint />} />

        {/* ✅ LOGIN - ADMIN (Blue design) */}
        <Route path="/login" element={<AdminLogin />} />

        {/* ✅ LOGIN - RESIDENT (Green design) */}
        <Route path="/resident-login" element={<Login />} />

        {/* PASSWORD RECOVERY */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* RESIDENT PORTAL */}
        <Route
          path="/resident"
          element={
            <ResidentRoute>
              <ResidentLayout />
            </ResidentRoute>
          }
        >
          <Route index element={<Navigate to="/resident/dashboard" replace />} />
          <Route path="dashboard" element={<ResidentRoute><ResidentDashboard /></ResidentRoute>} />
          <Route path="my-profile" element={<ResidentRoute><MyProfile /></ResidentRoute>} />
          <Route path="certificate-requests" element={<ResidentRoute><CertificateRequests /></ResidentRoute>} />
          <Route path="my-certificates" element={<ResidentRoute><MyCertificates /></ResidentRoute>} />
          <Route path="notifications" element={<ResidentRoute><Notifications /></ResidentRoute>} />
        </Route>

        {/* ADMIN PORTAL */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          <Route path="users" element={<UserManagementRoute><UserManagement /></UserManagementRoute>} />
          <Route path="users/residents" element={<ProtectedRoute section="userManagement" module="residents"><Residents /></ProtectedRoute>} />
          <Route path="users/officials" element={<ProtectedRoute section="userManagement" module="officials"><Officials /></ProtectedRoute>} />
          <Route path="users/roles" element={<ProtectedRoute section="userManagement" module="roles"><Roles /></ProtectedRoute>} />

          <Route path="residents" element={<ProtectedRoute section="residentsRecord" module="residentsList"><ResidentsRecord /></ProtectedRoute>} />
          <Route path="residents-record" element={<ProtectedRoute section="residentsRecord" module="residentsList"><ResidentsRecord /></ProtectedRoute>} />

          <Route path="households" element={<ProtectedRoute section="communityHousehold" module="households"><CommunityHousehold /></ProtectedRoute>} />

          <Route path="certificates" element={<ProtectedRoute section="certificateIssuance" module="certificates"><CertificateIssuance /></ProtectedRoute>} />

          <Route path="services" element={<ProtectedRoute section="serviceRequests" module="requests"><ServiceRequests /></ProtectedRoute>} />

          <Route path="blotter" element={<ProtectedRoute section="blotterRecords" module="blotter"><BlotterRecords /></ProtectedRoute>} />

          <Route path="incidents" element={<ProtectedRoute section="incidentReports" module="incidents"><IncidentReports /></ProtectedRoute>} />

          <Route path="reports" element={<ProtectedRoute section="reportsModule" module="reports"><Reports /></ProtectedRoute>} />

          <Route path="settings" element={<ProtectedRoute section="settingsModule" module="settings"><Settings /></ProtectedRoute>} />
        </Route>

        {/* PUBLIC PAGES */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/about" element={<><Navbar /><About /></>} />
        <Route path="/goals" element={<><Navbar /><About /></>} />
        <Route path="/mission-vision" element={<><Navbar /><About /></>} />
        <Route path="/history" element={<><Navbar /><About /></>} />
        <Route path="/organization" element={<><Navbar /><About /></>} />

        {/* SERVICES */}
        <Route path="/services/barangay-clearance" element={<><Navbar /><BarangayClearance /></>} />
        <Route path="/services/certificate-of-indigency" element={<><Navbar /><CertificateOfIndigency /></>} />
        <Route path="/services/certificate-of-residency" element={<><Navbar /><CertificateOfResidency /></>} />
        <Route path="/services/business-permit" element={<><Navbar /><BusinessPermit /></>} />
        <Route path="/services/barangay-id" element={<><Navbar /><BarangayID /></>} />
        <Route path="/services/barangay-permit" element={<><Navbar /><BarangayPermit /></>} />
        <Route path="/services/health-services" element={<><Navbar /><HealthServices /></>} />
        <Route path="/services/social-welfare" element={<><Navbar /><SocialWelfare /></>} />

        <Route path="/barangay-clearance" element={<><Navbar /><BarangayClearance /></>} />
        <Route path="/certificate-of-indigency" element={<><Navbar /><CertificateOfIndigency /></>} />
        <Route path="/certificate-of-residency" element={<><Navbar /><CertificateOfResidency /></>} />
        <Route path="/business-permit" element={<><Navbar /><BusinessPermit /></>} />
        <Route path="/barangay-id" element={<><Navbar /><BarangayID /></>} />
        <Route path="/barangay-permit" element={<><Navbar /><BarangayPermit /></>} />
        <Route path="/health-services" element={<><Navbar /><HealthServices /></>} />
        <Route path="/social-welfare" element={<><Navbar /><SocialWelfare /></>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;