import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import defaultProfile from "../assets/picture/profile.png";

const BASE_URL = "http://localhost/barangay-api/";

const ResidentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

  // =====================================================
  // GET USER
  // =====================================================
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // =====================================================
  // CLOSE DROPDOWN PAG CLICK SA LABAS
  // =====================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =====================================================
  // CLOSE MOBILE MENU PAG NAGBAGO ANG ROUTE
  // =====================================================
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = () => {
    logout();
  };

  // =====================================================
  // FULL NAME
  // =====================================================
  const getFullName = () => {
    if (!user) return "Resident";
    return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Resident";
  };

  // =====================================================
  // NAV ITEMS
  // =====================================================
  const navItems = [
    { label: "Home", path: "/resident/dashboard" },
    { label: "My Requests", path: "/resident/certificate-requests" },
  ];

  // =====================================================
  // AVATAR
  // =====================================================
  const avatarSrc = user?.profile_picture
    ? `${BASE_URL}${user.profile_picture}`
    : defaultProfile;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =================================================
          HEADER
      ================================================= */}
      <header
        className="px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50"
        style={{
          background: "linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%)",
        }}
      >

        {/* LEFT: Mobile Menu + Nav */}
        <div className="flex items-center gap-6">

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700 cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-semibold transition-colors ${
                  location.pathname === item.path
                    ? "text-emerald-700"
                    : "text-gray-600 hover:text-emerald-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

        </div>

        {/* RIGHT: Date + Profile Dropdown */}
        <div className="flex items-center gap-4">

          {/* DATE */}
          <span className="hidden md:block text-xs text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>

          {/* PROFILE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 cursor-pointer group"
              aria-label="Profile menu"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100">
                <img
                  src={avatarSrc}
                  alt={getFullName()}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = defaultProfile;
                  }}
                />
              </div>
              <FaChevronDown
                size={10}
                className={`text-gray-500 transition-transform hidden md:block ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* DROPDOWN MENU */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">

                {/* USER INFO */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {getFullName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.resident_id || user?.username || ""}
                  </p>
                </div>

                <Link
                  to="/resident/my-profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaUser size={14} className="text-gray-400" />
                  Profile
                </Link>

                <Link
                  to="/resident/my-profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaUser size={14} className="text-gray-400" />
                  My Account
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 cursor-pointer"
                >
                  <FaSignOutAlt size={14} />
                  Logout
                </button>

              </div>
            )}
          </div>

        </div>
      </header>

      {/* =================================================
          MOBILE NAV
      ================================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-3 space-y-1 shadow-sm">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block text-sm font-semibold py-2 transition-colors ${
                location.pathname === item.path
                  ? "text-emerald-700"
                  : "text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* =================================================
          MAIN CONTENT
      ================================================= */}
      <main>
        <Outlet />
      </main>

    </div>
  );
};

export default ResidentLayout;