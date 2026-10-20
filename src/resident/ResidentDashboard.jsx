import React, { useEffect, useState } from "react";
import {
  FaChevronUp,
  FaChevronDown,
  FaUsers,
  FaBullhorn,
  FaPhoneAlt,
} from "react-icons/fa";

// =====================================================
// COMPONENT
// =====================================================
const ResidentDashboard = () => {
  const [user, setUser] = useState(null);

  // =====================================================
  // GET USER
  // =====================================================
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(loggedInUser);
  }, []);

  // =====================================================
  // SCROLL HANDLERS
  // =====================================================
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* =================================================
          WELCOME BANNER — EMERALD GREEN
      ================================================= */}
      <div
        className="rounded-3xl p-8 md:p-10 text-white mb-8 relative overflow-hidden shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10" />

        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-wide">
            Hi! {user?.firstName || "First Name"}{" "}
            {user?.lastName || "Last Name"}
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold mt-2 leading-tight">
            Welcome to
            <br />
            Barangay Central Bicutan
          </h1>

          <p className="mt-4 text-sm md:text-base max-w-lg opacity-95">
            Our barangay is committed to serving the community and improving
            the quality of life for all residents.
          </p>
        </div>
      </div>

      {/* =================================================
          OFFICIALS SECTION (PLACEHOLDER)
      ================================================= */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Officials
        </h2>
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
          These officials are currently serving and supporting our community.
        </p>
      </div>

      {/* EMPTY STATE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-6xl mx-auto text-center mb-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <FaUsers size={32} className="text-gray-300" />
        </div>
        <p className="text-gray-500 text-sm font-medium">
          No officials added yet.
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Barangay officials will be displayed here once added by the admin.
        </p>
      </div>

      {/* =================================================
          EXTRA INFO CARDS
      ================================================= */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
            <FaUsers size={20} className="text-emerald-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Barangay Services</h3>
          <p className="text-sm text-gray-500">
            Request certificates, report incidents, and access other barangay
            services online.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
            <FaBullhorn size={20} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Announcements</h3>
          <p className="text-sm text-gray-500">
            Stay updated with the latest news and announcements from your
            barangay.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
            <FaPhoneAlt size={20} className="text-red-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Emergency Hotline</h3>
          <p className="text-sm text-gray-500">
            Contact the barangay office in case of emergencies.
          </p>
        </div>

      </div>

      {/* =================================================
          SCROLL BUTTONS
      ================================================= */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-2 z-40">
        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-gray-600 text-white shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
          title="Scroll to top"
        >
          <FaChevronUp size={16} />
        </button>

        <button
          onClick={scrollToBottom}
          className="w-12 h-12 rounded-full bg-gray-400 text-white shadow-lg flex items-center justify-center hover:bg-gray-500 transition-colors cursor-pointer"
          title="Scroll to bottom"
        >
          <FaChevronDown size={16} />
        </button>
      </div>

    </div>
  );
};

export default ResidentDashboard;