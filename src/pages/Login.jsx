// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  FileText,
  Bell,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";

import logo from "../assets/picture/logo (2).png";
import taguigLogo from "../assets/picture/taguig.png";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// =====================================================
// TOAST
// =====================================================
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-800",
      textColor: "text-emerald-700",
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
    <div className="animate-slide-in">
      <div
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
    </div>
  );
};

// =====================================================
// RESIDENT LOGIN
// =====================================================
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [toasts, setToasts] = useState([]);

  const { login } = useAuth();

  const showToast = (type, message, title = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ✅ I-clear ang admin session kapag binuksan ang resident login page
  useEffect(() => {
    [
      "admin_isLoggedIn",
      "admin_userId",
      "admin_username",
      "admin_firstName",
      "admin_lastName",
      "admin_role",
      "admin_permissions",
      "admin_status",
      "admin_sessionToken",
      "admin_loginTime",
      "admin_user",
    ].forEach((key) => sessionStorage.removeItem(key));
  }, []);

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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid username or password.");
      }

      const userData = data.user || {};
      const roleName = String(userData.role || "").trim();
      const roleLower = roleName.toLowerCase();

      // ✅ Resident login only
      if (roleLower !== "resident") {
        throw new Error(
          "This is the Resident login. Please use the Admin login instead."
        );
      }

      const residentPermissions =
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
        permissions: residentPermissions,
      };

      sessionStorage.setItem("resident_isLoggedIn", "true");
      sessionStorage.setItem("resident_userId", String(userData.id || ""));
      sessionStorage.setItem("resident_username", userData.username || "");
      sessionStorage.setItem(
        "resident_firstName",
        userData.firstName || userData.username || "Resident"
      );
      sessionStorage.setItem("resident_lastName", userData.lastName || "");
      sessionStorage.setItem("resident_role", roleName);
      sessionStorage.setItem(
        "resident_permissions",
        JSON.stringify(residentPermissions)
      );
      sessionStorage.setItem("resident_status", userData.status || "Active");
      sessionStorage.setItem("resident_loginTime", String(Date.now()));
      sessionStorage.setItem("resident_user", JSON.stringify(completeUser));

      const loginSucceeded = login(completeUser);

      if (loginSucceeded === false) {
        [
          "resident_isLoggedIn",
          "resident_userId",
          "resident_username",
          "resident_firstName",
          "resident_lastName",
          "resident_role",
          "resident_permissions",
          "resident_status",
          "resident_loginTime",
          "resident_user",
        ].forEach((key) => sessionStorage.removeItem(key));

        throw new Error(
          "Unable to initialize your resident session. Please try again."
        );
      }

      showToast(
        "success",
        "Welcome back! Redirecting to your dashboard...",
        "Login Successful"
      );

      setTimeout(() => {
        window.location.replace("/resident/dashboard");
      }, 800);
    } catch (err) {
      console.error("Login error:", err);

      let toastType = "error";
      let title = "Login Failed";

      if (err.message.includes("Please use the Admin login")) {
        title = "Wrong Portal";
        toastType = "warning";
      } else if (err.message.includes("Invalid username")) {
        title = "Invalid Credentials";
      } else if (err.message.includes("Failed to connect")) {
        title = "Connection Error";
      } else if (err.message.includes("inactive")) {
        title = "Account Inactive";
      }

      showToast(toastType, err.message || "Failed to connect to the server.", title);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col lg:flex-row bg-slate-950 font-sans antialiased m-0 p-0 box-border">
      {/* TOAST CONTAINER */}
      <div className="fixed top-6 right-6 z-[100] space-y-3">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* LEFT SIDE — GREEN */}
      <div
        className="lg:w-3/5 h-full relative p-6 lg:p-10 flex flex-col justify-between overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #2D5A27 0%, #1E3F1A 50%, #11260F 100%)",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5 pointer-events-none" />

        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center text-green-200 hover:text-white text-sm font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-xl">
          <div className="mb-3 flex items-center space-x-3">
            <div className="bg-white/15 backdrop-blur-md p-3 w-fit rounded-2xl border border-white/20 shadow-xl">
              <img
                src={logo}
                alt="Barangay Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
            <div className="bg-white/15 backdrop-blur-md p-3 w-fit rounded-2xl border border-white/20 shadow-xl">
              <img
                src={taguigLogo}
                alt="Taguig Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-1">
            Barangay Central Bicutan
          </h1>

          <h2 className="text-xl lg:text-2xl font-semibold text-green-300 mb-3">
            Resident Portal
          </h2>

          <p className="text-green-100/80 text-sm lg:text-base leading-relaxed mb-5">
            Access barangay services, submit reports, and stay updated with
            community announcements.
          </p>

          <div className="space-y-2.5">
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-3.5 rounded-xl flex items-start space-x-3">
              <div className="p-2 bg-green-500/20 text-green-300 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Community Services
                </h3>
                <p className="text-green-100/70 text-xs mt-0.5">
                  Request documents, certificates, and access various barangay
                  services online.
                </p>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-3.5 rounded-xl flex items-start space-x-3">
              <div className="p-2 bg-green-500/20 text-green-300 rounded-lg">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Stay Informed
                </h3>
                <p className="text-green-100/70 text-xs mt-0.5">
                  Receive important announcements and updates from your
                  barangay officials.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10"></div>
      </div>

      {/* RIGHT SIDE */}
      <div className="lg:w-2/5 h-full bg-white flex flex-col justify-between p-6 lg:p-8 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md bg-white p-6 lg:p-7 rounded-2xl shadow-xl border border-slate-100">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sign in using your resident credentials
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
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
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
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
                    className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:bg-white transition-all"
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
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#2D5A27] focus:ring-[#2D5A27]"
                  />
                  <span className="text-slate-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[#2D5A27] hover:opacity-80 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 text-white font-medium rounded-xl shadow-lg transition-all text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 mt-1 ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "cursor-pointer hover:opacity-90"
                }`}
                style={{ backgroundColor: "#2D5A27" }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
                Are you an admin?{" "}
                <Link
                  to="/login"
                  className="text-[#2D5A27] font-semibold hover:underline"
                >
                  Admin Login
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2">
          © 2026 Barangay Central Bicutan. All rights reserved.
        </div>
      </div>
    </div>
  );
}