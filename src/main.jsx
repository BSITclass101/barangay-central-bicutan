import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// ==================================================
// SESSION CONFIG
// ==================================================
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

// ==================================================
// CHECK SESSION
// ✅ Token requirement — para lang sa admin
// ==================================================
const checkSession = (prefix) => {
  const loggedIn = sessionStorage.getItem(`${prefix}_isLoggedIn`) === "true";
  const loginTime = sessionStorage.getItem(`${prefix}_loginTime`);

  if (!loggedIn || !loginTime) return false;

  // Token — required lang sa admin
  if (prefix === "admin") {
    const token = sessionStorage.getItem(`${prefix}_sessionToken`);
    if (!token || token.length < 32) return false;
  }

  const parsed = parseInt(loginTime, 10);
  if (Number.isNaN(parsed)) return false;

  const elapsed = Date.now() - parsed;
  return elapsed >= 0 && elapsed <= SESSION_DURATION;
};

// ==================================================
// PRE-RENDER GUARD
// ✅ Skip ang /login at /resident-login (public pages)
// ✅ Check lang para sa /admin/* at /resident/* (dashboards)
// ==================================================
const path = window.location.pathname.toLowerCase();

const isAdminLoginPage = path === "/login";
const isResidentLoginPage = path === "/resident-login";
const isPrintPage = path.startsWith("/print/");

// ✅ Skip lahat ng public/auth pages
const isPublicPage = isAdminLoginPage || isResidentLoginPage || isPrintPage;

if (!isPublicPage) {
  // Admin dashboard routes
  if (path.startsWith("/admin") && !checkSession("admin")) {
    window.location.replace("/login");
  }

  // Resident dashboard routes
  if (path.startsWith("/resident") && !checkSession("resident")) {
    window.location.replace("/resident-login");
  }
}

// ==================================================
// RENDER
// ==================================================
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);