// src/admin/Settings.jsx
import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaUserCircle,
  FaSave,
  FaPrint,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaUserShield,
  FaBriefcase,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
} from "react-icons/fa";
import { api } from "../api/client";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  // Barangay Profile State
  const [barangayName, setBarangayName] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [province, setProvince] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);

  // Logged-in user
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (type, message, title = "") => {
    setToast({ type, message, title, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  // =====================================================
  // FETCH SETTINGS FROM DB
  // =====================================================
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoadingSettings(true);
        const res = await api.getSettings();
        if (res.success && res.data) {
          setBarangayName(res.data.barangay_name || "");
          setMunicipality(res.data.city || "");
          setProvince(res.data.province || "");
          setAddress(res.data.address || "");
          setContactNumber(res.data.contact_number || "");
          setMobileNumber(res.data.mobile_number || "");
          setEmail(res.data.email || "");
          setOfficeHours(res.data.office_hours || "");
          setFacebookUrl(res.data.facebook_url || "");
        }
      } catch (err) {
        console.error(err);
        showToast("error", "Failed to load settings.", "Error");
      } finally {
        setLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);

  // =====================================================
  // FETCH LOGGED-IN USER
  // =====================================================
  useEffect(() => {
    try {
      const adminUserRaw = sessionStorage.getItem("admin_user");
      const residentUserRaw = sessionStorage.getItem("resident_user");
      const adminUser = adminUserRaw ? JSON.parse(adminUserRaw) : null;
      const residentUser = residentUserRaw ? JSON.parse(residentUserRaw) : null;
      const user = adminUser || residentUser;
      setCurrentUser(user);
    } catch (err) {
      console.error("Failed to parse user:", err);
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // =====================================================
  // SAVE BARANGAY PROFILE
  // =====================================================
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.updateSettings({
        barangay_name: barangayName,
        city: municipality,
        province,
        address,
        contact_number: contactNumber,
        mobile_number: mobileNumber,
        email,
        office_hours: officeHours,
        facebook_url: facebookUrl,
      });

      if (!res.success) throw new Error(res.message || "Failed to save.");

      showToast(
        "success",
        "Barangay information updated successfully!",
        "Saved"
      );
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to save settings.", "Error");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // PRINT ACCOUNT DETAILS
  // =====================================================
  const handlePrintAccount = () => {
    if (!currentUser) {
      showToast("error", "No user data to print.", "Error");
      return;
    }

    const fullName =
      currentUser.full_name ||
      [
        currentUser.firstName || currentUser.first_name,
        currentUser.middleName || currentUser.middle_name,
        currentUser.lastName || currentUser.last_name,
        currentUser.suffix,
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim() || "—";

    const role = currentUser.role || "—";
    const username = currentUser.username || currentUser.user_name || "—";
    const emailAddr = currentUser.email || currentUser.email_address || "—";
    const phone = currentUser.mobile_number || currentUser.phone || "—";
    const employeeId = currentUser.employee_id || currentUser.id || "—";

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      showToast("error", "Please allow pop-ups to print.", "Pop-up Blocked");
      return;
    }

    const printedDate = new Date().toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Account Details - ${fullName}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; background: #f3f4f6; margin: 0; padding: 30px; color: #111827; }
          .container { max-width: 700px; margin: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { text-align: center; border-bottom: 3px double #111827; padding-bottom: 20px; margin-bottom: 30px; }
          .header p { margin: 4px 0; font-size: 13px; letter-spacing: 1px; }
          .header h1 { margin: 14px 0 4px; font-size: 22px; text-transform: uppercase; letter-spacing: 2px; }
          .header h2 { margin: 0; font-size: 15px; color: #6b7280; }
          .title { text-align: center; font-weight: bold; font-size: 20px; margin: 30px 0; text-transform: uppercase; letter-spacing: 2px; }
          .avatar { width: 80px; height: 80px; border-radius: 50%; background: #059669; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; margin: 0 auto 20px; }
          .row { display: flex; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
          .row:last-child { border-bottom: none; }
          .label { width: 40%; font-weight: bold; color: #4b5563; font-size: 14px; }
          .value { width: 60%; color: #111827; font-size: 14px; }
          .signature-block { margin-top: 60px; display: flex; justify-content: flex-end; }
          .signature { text-align: center; width: 250px; }
          .signature-line { border-top: 1px solid #111827; padding-top: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 13px; }
          .signature-role { font-size: 12px; color: #6b7280; margin-top: 4px; }
          .printed-date { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 30px; font-style: italic; }
          @media print { body { background: #fff; padding: 0; } .container { box-shadow: none; border: 1px solid #111827; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <p>REPUBLIC OF THE PHILIPPINES</p>
            <p>METRO MANILA</p>
            <p>CITY OF TAGUIG</p>
            <h1>${barangayName || "BARANGAY CENTRAL BICUTAN"}</h1>
            <h2>OFFICE OF THE PUNONG BARANGAY</h2>
          </div>

          <div class="title">Account Details</div>

          <div class="avatar">${fullName.charAt(0).toUpperCase()}</div>

          <div class="row"><div class="label">Employee ID</div><div class="value">${employeeId}</div></div>
          <div class="row"><div class="label">Full Name</div><div class="value">${fullName}</div></div>
          <div class="row"><div class="label">Username</div><div class="value">${username}</div></div>
          <div class="row"><div class="label">Role / Position</div><div class="value">${role.toUpperCase()}</div></div>
          <div class="row"><div class="label">Email Address</div><div class="value">${emailAddr}</div></div>
          <div class="row"><div class="label">Mobile Number</div><div class="value">${phone}</div></div>

          <div class="signature-block">
            <div class="signature">
              <div class="signature-line">${fullName.toUpperCase()}</div>
              <div class="signature-role">${role}</div>
            </div>
          </div>

          <div class="printed-date">Printed on: ${printedDate}</div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // =====================================================
  // HELPERS
  // =====================================================
  const getInitials = () => {
    if (!currentUser) return "?";
    const first = currentUser.firstName || currentUser.first_name || "";
    const last = currentUser.lastName || currentUser.last_name || "";
    if (first || last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "?";
    }
    return (currentUser.username || "?").charAt(0).toUpperCase();
  };

  const getFullName = () => {
    if (!currentUser) return "—";
    return (
      currentUser.full_name ||
      [
        currentUser.firstName || currentUser.first_name,
        currentUser.middleName || currentUser.middle_name,
        currentUser.lastName || currentUser.last_name,
        currentUser.suffix,
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim() ||
      currentUser.username ||
      "—"
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-slide-in">
          <div
            className={`flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg border min-w-[320px] max-w-md ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <FaCheckCircle className="text-emerald-600 w-5 h-5 mt-0.5 shrink-0" />
            ) : (
              <FaTimes className="text-red-600 w-5 h-5 mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              {toast.title && (
                <p
                  className={`font-semibold text-sm ${
                    toast.type === "success"
                      ? "text-emerald-800"
                      : "text-red-800"
                  }`}
                >
                  {toast.title}
                </p>
              )}
              <p
                className={`text-sm ${
                  toast.type === "success"
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg hover:bg-black/5"
            >
              <FaTimes className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          System Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure barangay profile details and view your account information.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-72 space-y-2">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "general"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
            }`}
          >
            <FaBuilding size={16} />
            Barangay Profile
          </button>

          <button
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "account"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
            }`}
          >
            <FaUserCircle size={16} />
            My Account
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* ================= GENERAL TAB ================= */}
          {activeTab === "general" && (
            <form onSubmit={handleSaveGeneral} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Barangay General Information
                </h2>
                <p className="text-xs text-gray-500">
                  Update official header details used in certificates, reports,
                  and footer.
                </p>
              </div>

              {loadingSettings ? (
                <div className="text-center py-16 text-gray-400">
                  <FaSpinner className="animate-spin inline mr-2" />
                  Loading settings...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Barangay Name"
                      value={barangayName}
                      onChange={setBarangayName}
                      placeholder="e.g., Barangay Central Bicutan"
                      icon={<FaBuilding size={11} />}
                    />
                    <InputField
                      label="Municipality / City"
                      value={municipality}
                      onChange={setMunicipality}
                      placeholder="e.g., Taguig City"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Province"
                      value={province}
                      onChange={setProvince}
                      placeholder="e.g., Metro Manila"
                    />
                    <InputField
                      label="Complete Address"
                      value={address}
                      onChange={setAddress}
                      placeholder="e.g., Central Bicutan, Taguig City"
                      icon={<FaMapMarkerAlt size={11} />}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Contact Number"
                      value={contactNumber}
                      onChange={setContactNumber}
                      placeholder="e.g., 9989692830"
                      icon={<FaPhone size={11} />}
                    />
                    <InputField
                      label="Mobile Number"
                      value={mobileNumber}
                      onChange={setMobileNumber}
                      placeholder="e.g., 09626836893"
                      icon={<FaPhone size={11} />}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Email Address"
                      value={email}
                      onChange={setEmail}
                      placeholder="e.g., brgy.centralbicutan@gmail.com"
                      icon={<FaEnvelope size={11} />}
                    />
                    <InputField
                      label="Office Hours"
                      value={officeHours}
                      onChange={setOfficeHours}
                      placeholder="e.g., Monday - Friday, 8:00 AM - 5:00 PM"
                      icon={<FaClock size={11} />}
                    />
                  </div>

                  <InputField
                    label="Facebook Page URL"
                    value={facebookUrl}
                    onChange={setFacebookUrl}
                    placeholder="e.g., https://facebook.com/barangaycentral"
                    icon={<FaFacebook size={11} />}
                  />

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-sm active:scale-95 disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <FaSave /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* ================= MY ACCOUNT TAB ================= */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    My Account
                  </h2>
                  <p className="text-xs text-gray-500">
                    Your account information as logged-in personnel.
                  </p>
                </div>
                {currentUser && (
                  <button
                    onClick={handlePrintAccount}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-sm active:scale-95"
                  >
                    <FaPrint /> Print
                  </button>
                )}
              </div>

              {loadingUser ? (
                <div className="text-center py-16 text-gray-400">
                  Loading account information...
                </div>
              ) : !currentUser ? (
                <div className="text-center py-16">
                  <FaUserShield className="mx-auto text-gray-300 text-5xl mb-3" />
                  <p className="text-gray-500 font-medium">
                    No user data found.
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Please log in again.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-5 p-6 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-2xl">
                    <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
                      {getInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 truncate">
                        {getFullName()}
                      </h3>
                      <p className="text-sm text-emerald-700 font-semibold capitalize mt-0.5">
                        {currentUser.role || "—"}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        ID: {currentUser.employee_id || currentUser.id || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={<FaIdCard />}
                      label="Employee ID"
                      value={currentUser.employee_id || currentUser.id || "—"}
                    />
                    <InfoCard
                      icon={<FaUser />}
                      label="Username"
                      value={
                        currentUser.username || currentUser.user_name || "—"
                      }
                    />
                    <InfoCard
                      icon={<FaEnvelope />}
                      label="Email Address"
                      value={
                        currentUser.email || currentUser.email_address || "—"
                      }
                    />
                    <InfoCard
                      icon={<FaPhone />}
                      label="Mobile Number"
                      value={
                        currentUser.mobile_number || currentUser.phone || "—"
                      }
                    />
                    <InfoCard
                      icon={<FaBriefcase />}
                      label="Role / Position"
                      value={(currentUser.role || "—").toUpperCase()}
                    />
                    <InfoCard
                      icon={<FaUserShield />}
                      label="Account Type"
                      value={
                        currentUser.is_admin || currentUser.role === "admin"
                          ? "Administrator"
                          : "Staff / Secretary"
                      }
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
                    <p className="font-semibold mb-1">
                      🔒 Account Information
                    </p>
                    <p>
                      Ang impormasyon na ito ay para sa verification at
                      identification ng authorized personnel ng barangay. Pwede
                      mong i-print para sa official records.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// HELPER COMPONENTS
// =====================================================
const InputField = ({ label, value, onChange, placeholder, icon }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
      {icon && <span className="text-gray-400">{icon}</span>}
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
    />
  </div>
);

const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5 break-words">
        {value}
      </p>
    </div>
  </div>
);

export default Settings;