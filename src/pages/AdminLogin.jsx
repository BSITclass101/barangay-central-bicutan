import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Activity,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import logo from "../assets/picture/logo (2).png";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// =====================================================
// MODERN TOAST — BLUE THEME (Admin)
// =====================================================
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
      textColor: "text-blue-800",
      Icon: CheckCircle,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      titleColor: "text-red-800",
      textColor: "text-red-700",
      Icon: AlertTriangle,
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      titleColor: "text-amber-800",
      textColor: "text-amber-700",
      Icon: AlertTriangle,
    },
  }[toast.type] || {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    titleColor: "text-blue-800",
    textColor: "text-blue-700",
    Icon: CheckCircle,
  };

  const { Icon } = config;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <div
        style={{ animation: "slideInRight 0.3s ease-out" }}
        className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${config.bg} ${config.border} min-w-[340px] max-w-md backdrop-blur-sm`}
      >
        <div
          className={`w-9 h-9 rounded-xl ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 pt-0.5">
          {toast.title && (
            <p className={`font-bold text-sm ${config.titleColor}`}>
              {toast.title}
            </p>
          )}
          <p className={`text-sm ${config.textColor} mt-0.5 leading-relaxed`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg hover:bg-black/5 ${config.textColor} shrink-0 transition-colors`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

// =====================================================
// MAIN ADMIN LOGIN
// =====================================================
export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const { login } = useAuth();

  // =====================================================
  // TOAST HELPERS
  // =====================================================
  const showToast = (type, message, title = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      showToast(
        "warning",
        "Please enter your username and password.",
        "Missing Information"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost/barangay-api/api/adminlogin.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim(), password }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid username or password.");
      }

      const userData = data.user || {};
      const roleName = String(userData.role || "").trim();
      const roleLower = roleName.toLowerCase();

      // ✅ ADMIN LOGIN ONLY — bawal ang resident dito
      if (roleLower === "resident") {
        throw new Error(
          "This is the Admin login. Please use the Resident login instead."
        );
      }

      const sessionToken = data.token;
      if (typeof sessionToken !== "string" || sessionToken.length < 32) {
        throw new Error(
          "The server did not return a valid session token. Please check adminlogin.php."
        );
      }

      const adminPermissions =
        userData.permissions && typeof userData.permissions === "object"
          ? userData.permissions
          : {};

      const completeUser = {
        id: userData.id || "",
        resident_id: userData.resident_id || "",
        username: userData.username || "",
        firstName: userData.firstName || userData.username || "",
        middleName: userData.middleName || "",
        lastName: userData.lastName || "",
        suffix: userData.suffix || "",
        email: userData.email || "",
        mobile: userData.mobile || "",
        profile_picture: userData.profile_picture || null,
        role: roleName,
        role_id: userData.role_id || null,
        status: userData.status || "Active",
        account_status: userData.account_status || "",
        permissions: adminPermissions,
      };

      sessionStorage.setItem("admin_isLoggedIn", "true");
      sessionStorage.setItem("admin_userId", String(userData.id || ""));
      sessionStorage.setItem("admin_username", userData.username || "");
      sessionStorage.setItem(
        "admin_firstName",
        userData.firstName || userData.username || "User"
      );
      sessionStorage.setItem("admin_lastName", userData.lastName || "");
      sessionStorage.setItem("admin_role", roleName);
      sessionStorage.setItem(
        "admin_permissions",
        JSON.stringify(adminPermissions)
      );
      sessionStorage.setItem("admin_status", userData.status || "Active");
      sessionStorage.setItem("admin_sessionToken", sessionToken);
      sessionStorage.setItem("admin_loginTime", String(Date.now()));
      sessionStorage.setItem("admin_user", JSON.stringify(completeUser));

      const loginSucceeded = login(completeUser);

      if (loginSucceeded === false) {
        [
          "admin_isLoggedIn", "admin_userId", "admin_username",
          "admin_firstName", "admin_lastName", "admin_role",
          "admin_permissions", "admin_status", "admin_sessionToken",
          "admin_loginTime", "admin_user",
        ].forEach((key) => sessionStorage.removeItem(key));

        throw new Error("Unable to initialize your session. Please try again.");
      }

      console.log(`${roleName.toUpperCase()} LOGIN SUCCESS`);

      showToast(
        "success",
        `Welcome back, ${completeUser.firstName}! Redirecting to dashboard...`,
        "Admin Login Successful"
      );

      setTimeout(() => {
        window.location.replace("/admin/dashboard");
      }, 800);
    } catch (err) {
      console.error("Login error:", err);

      // ✅ Determine toast type base sa error message
      let toastType = "error";
      let title = "Login Failed";

      if (err.message.includes("Please use the Resident login")) {
        title = "Wrong Portal";
        toastType = "warning";
      } else if (err.message.includes("Invalid username")) {
        title = "Invalid Credentials";
      } else if (err.message.includes("Failed to connect")) {
        title = "Connection Error";
      } else if (err.message.includes("inactive")) {
        title = "Account Inactive";
      } else if (err.message.includes("session token")) {
        title = "Server Error";
      }

      showToast(toastType, err.message || "Failed to connect to the server.", title);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col lg:flex-row bg-[#0b1220] font-sans antialiased m-0 p-0 box-border">

      {/* TOAST CONTAINER */}
      <div className="fixed top-6 right-6 z-[100] space-y-3">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* LEFT SIDE — Dark Blue Gradient */}
      <div
        className="lg:w-3/5 h-full relative p-6 lg:p-10 flex flex-col justify-between overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f1e3d 0%, #142850 50%, #0a1530 100%)",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.04] pointer-events-none" />

        <div
          className="absolute pointer-events-none"
          style={{
            top: "20%",
            left: "10%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center text-slate-300 hover:text-white text-sm font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-xl">
          <div className="mb-6">
            <div className="bg-white/10 backdrop-blur-md p-3 w-fit rounded-2xl border border-white/15 shadow-xl">
              <img
                src={logo}
                alt="Barangay Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2">
            Barangay Central
          </h1>

          <h2 className="text-xl lg:text-2xl font-semibold text-blue-300 mb-4">
            Admin Portal
          </h2>

          <p className="text-slate-300/80 text-sm lg:text-base leading-relaxed mb-6 max-w-md">
            Welcome to the administrative dashboard for Barangay Central
            Management System.
          </p>

          <div className="space-y-3">
            <div className="bg-white/[0.04] backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start space-x-3">
              <div className="p-2 bg-blue-500/20 text-blue-300 rounded-lg">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Manage Community
                </h3>
                <p className="text-slate-300/70 text-xs mt-0.5">
                  Oversee resident information, document requests, and
                  community services efficiently.
                </p>
              </div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start space-x-3">
              <div className="p-2 bg-blue-500/20 text-blue-300 rounded-lg">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Real-time Updates
                </h3>
                <p className="text-slate-300/70 text-xs mt-0.5">
                  Monitor reports, announcements, and activities happening in
                  the barangay in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10"></div>
      </div>

      {/* RIGHT SIDE — White Login Card */}
      <div className="lg:w-2/5 h-full bg-white flex flex-col justify-between p-6 lg:p-8 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to access the admin dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="text-right mt-1.5">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 text-white font-semibold rounded-lg shadow-md transition-all text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading
                    ? "opacity-70 cursor-not-allowed bg-blue-500"
                    : "cursor-pointer bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Signing In..." : "Sign In to Dashboard"}
              </button>

              <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">
                  Secure connection to Barangay Central portal
                </span>
              </div>

              <div className="text-center text-xs text-slate-500 pt-2">
                Are you a resident?{" "}
                <Link
                  to="/resident-login"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Resident Login
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2">
          © 2026 Barangay Central. All rights reserved.
        </div>
      </div>
    </div>
  );
}