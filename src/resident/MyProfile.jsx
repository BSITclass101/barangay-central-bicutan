// src/resident/MyProfile.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Home,
  Gavel,
  FileText,
  Bell,
  Camera,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";

import useRealtimeUpdates from "../hooks/useRealtimeUpdates";

// =====================================================
// API
// =====================================================
const API_URL = "http://localhost/barangay-api/api/residents.php";
const BLOTTER_URL = "http://localhost/barangay-api/api/blotter.php";
const INCIDENT_URL = "http://localhost/barangay-api/api/incidents.php";
const BASE_URL = "http://localhost/barangay-api/";

// =====================================================
// TOAST
// =====================================================
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: "bg-emerald-50", border: "border-emerald-200", iconColor: "text-emerald-600", textColor: "text-emerald-800", Icon: CheckCircle },
    error: { bg: "bg-red-50", border: "border-red-200", iconColor: "text-red-600", textColor: "text-red-800", Icon: AlertTriangle },
  }[toast.type] || {
    bg: "bg-blue-50", border: "border-blue-200", iconColor: "text-blue-600", textColor: "text-blue-800", Icon: CheckCircle,
  };

  const { Icon } = config;

  return (
    <div className="animate-slide-in">
      <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${config.bg} ${config.border} min-w-[320px] max-w-md`}>
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
        <div className="flex-1">
          {toast.title && <p className={`font-bold text-sm ${config.textColor}`}>{toast.title}</p>}
          <p className={`text-sm ${config.textColor} mt-0.5`}>{toast.message}</p>
        </div>
        <button onClick={onClose} className={`p-1 rounded-lg hover:bg-black/5 ${config.textColor}`}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const MyProfile = () => {
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("personal");

  const [blotters, setBlotters] = useState([]);
  const [blottersLoading, setBlottersLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);

  // ✅ PROFILE PICTURE UPLOAD STATE
  const [uploading, setUploading] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const [toasts, setToasts] = useState([]);
  const fileInputRef = useRef(null);

  const showToast = (type, message, title = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // =====================================================
  // SIDEBAR SECTIONS
  // =====================================================
  const sections = [
    { id: "personal", label: "Personal Details", icon: User },
    { id: "emergency", label: "Emergency Contact", icon: Phone },
    { id: "additional", label: "Additional Information", icon: AlertCircle },
    { id: "household", label: "Household Details", icon: Home },
    { id: "blotter", label: "Blotter Records", icon: Gavel },
    { id: "requests", label: "Service Requests", icon: FileText },
    { id: "incident", label: "Incident Report", icon: Bell },
  ];

  // =====================================================
  // LOAD RESIDENT
  // =====================================================
  const loadResident = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      let storedResident = sessionStorage.getItem("resident_user");

      if (!storedResident) {
        storedResident =
          localStorage.getItem("resident_user") ||
          localStorage.getItem("resident") ||
          localStorage.getItem("user");
      }

      if (!storedResident) {
        const sessionId = sessionStorage.getItem("resident_userId");
        if (sessionId) {
          storedResident = JSON.stringify({
            id: sessionId,
            username: sessionStorage.getItem("resident_username"),
            firstName: sessionStorage.getItem("resident_firstName"),
            lastName: sessionStorage.getItem("resident_lastName"),
            role: sessionStorage.getItem("resident_role"),
          });
        }
      }

      if (!storedResident) {
        if (!silent) {
          setResident(null);
          setLoading(false);
        }
        return;
      }

      let loggedResident;
      try {
        loggedResident = JSON.parse(storedResident);
      } catch (parseError) {
        if (!silent) {
          setResident(null);
          setLoading(false);
        }
        return;
      }

      const residentId =
        loggedResident.id ||
        loggedResident.userId ||
        loggedResident.user_id ||
        loggedResident.resident_id ||
        loggedResident.residentId ||
        sessionStorage.getItem("resident_userId");

      if (!residentId) {
        if (!silent) {
          setResident(null);
          setLoading(false);
        }
        return;
      }

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to retrieve residents.");
      }

      const residents = Array.isArray(data.data) ? data.data : [];

      const currentResident = residents.find(
        (item) =>
          String(item.id) === String(residentId) ||
          String(item.resident_id) === String(residentId) ||
          String(item.user_id) === String(residentId)
      );

      if (!currentResident) {
        if (!silent) {
          setResident(null);
          setLoading(false);
        }
        return;
      }

      setResident(currentResident);
    } catch (error) {
      console.error("Error loading resident:", error);
      if (!silent) setResident(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // =====================================================
  // LOAD BLOTTERS
  // =====================================================
  const loadBlotters = useCallback(async (residentId) => {
    if (!residentId) return;

    try {
      setBlottersLoading(true);
      const response = await fetch(`${BLOTTER_URL}?resident_id=${residentId}`);
      const data = await response.json();

      if (data.success) {
        setBlotters(Array.isArray(data.data) ? data.data : []);
      } else {
        setBlotters([]);
      }
    } catch (error) {
      console.error("Error loading blotters:", error);
      setBlotters([]);
    } finally {
      setBlottersLoading(false);
    }
  }, []);

  // =====================================================
  // LOAD INCIDENTS
  // =====================================================
  const loadIncidents = useCallback(async (residentName) => {
    if (!residentName) return;

    try {
      setIncidentsLoading(true);
      const encodedName = encodeURIComponent(residentName);
      const response = await fetch(`${INCIDENT_URL}?reported_by=${encodedName}`);
      const data = await response.json();

      if (data.success) {
        setIncidents(Array.isArray(data.data) ? data.data : []);
      } else {
        setIncidents([]);
      }
    } catch (error) {
      console.error("Error loading incidents:", error);
      setIncidents([]);
    } finally {
      setIncidentsLoading(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    loadResident();
  }, [loadResident]);

  useEffect(() => {
    if (resident) {
      loadBlotters(resident.id);
      loadIncidents(
        [resident.first_name, resident.middle_name, resident.last_name, resident.suffix]
          .filter(Boolean)
          .join(" ")
      );
    }
  }, [resident, loadBlotters, loadIncidents]);

  // =====================================================
  // SSE REALTIME
  // =====================================================
  useRealtimeUpdates((data) => {
    console.log("🔔 Realtime update received:", data);
    if (data.resource === "residents" || !data.resource) {
      loadResident(true);
      if (resident) {
        loadBlotters(resident.id);
        loadIncidents(
          [resident.first_name, resident.middle_name, resident.last_name, resident.suffix]
            .filter(Boolean)
            .join(" ")
        );
      }
    }
  });

  // =====================================================
  // ✅ HANDLE PROFILE PICTURE SELECTION
  // =====================================================
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      showToast("error", "Only JPG, JPEG, and PNG files are allowed.", "Invalid File");
      return;
    }
    if (file.size > 1048576) {
      showToast("error", "File must be less than 1MB.", "File Too Large");
      return;
    }

    setProfileFile(file);
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // =====================================================
  // ✅ UPLOAD PROFILE PICTURE
  // =====================================================
  const handleUploadProfilePicture = async () => {
    if (!resident || !profileFile) {
      showToast("error", "Please select a picture first.", "No File Selected");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("id", resident.id);
      formData.append("_method", "PUT");
      formData.append("profile_picture", profileFile);

      const response = await fetch(`${API_URL}?id=${resident.id}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to upload profile picture.");
      }

      showToast("success", "Profile picture updated successfully!", "Saved");

      setProfileFile(null);
      setProfilePreview(null);

      // Reload
      await loadResident(true);
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to upload profile picture.", "Error");
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // ✅ CANCEL PREVIEW
  // =====================================================
  const handleCancelPreview = () => {
    setProfileFile(null);
    setProfilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // =====================================================
  // HELPERS
  // =====================================================
  const getFullName = () => {
    if (!resident) return "Resident";
    return [
      resident.first_name,
      resident.middle_name,
      resident.last_name,
      resident.suffix,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const formatDate = (date) => {
    if (!date) return "Not provided";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusInfo = () => {
    const status = String(resident?.account_status || resident?.status || "").toLowerCase();
    return status === "active";
  };

  const getBlotterStatusColor = (status) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-700";
      case "Under Investigation": return "bg-blue-100 text-blue-700";
      case "Dismissed": return "bg-gray-100 text-gray-600";
      case "Pending":
      default: return "bg-amber-100 text-amber-700";
    }
  };

  const getIncidentStatusColor = (status) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-700";
      case "Action Taken": return "bg-emerald-100 text-emerald-700";
      case "Investigating":
      default: return "bg-amber-100 text-amber-700";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Resident Profile Not Found</h2>
          <p className="text-sm text-slate-500">We couldn't find your resident information. Please login again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      <div className="fixed top-6 right-6 z-[100] space-y-3">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className="h-40 bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 relative">
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="0.2" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,224C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* ✅ Profile picture — may camera icon para sa upload */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex-shrink-0">
                {profilePreview ? (
                  <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : resident.profile_picture ? (
                  <img
                    src={`${BASE_URL}${resident.profile_picture}`}
                    alt={getFullName()}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <User className="w-12 h-12 text-blue-600" />
                  </div>
                )}
              </div>

              {/* ✅ Camera button — para i-upload ng bagong profile picture */}
              {!profileFile && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg cursor-pointer transition-all disabled:opacity-50"
                    title="Change profile picture"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-800">{getFullName()}</h1>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-sm text-slate-500">
                  {resident.resident_id || resident.resident_code || "N/A"}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    getStatusInfo()
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${getStatusInfo() ? "bg-green-500" : "bg-slate-400"}`}></span>
                  {resident.account_status || resident.status || "Active"}
                </span>
              </div>
            </div>

            {/* ✅ SAVE / CANCEL buttons — lalabas lang kapag may piniling file */}
            {profileFile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelPreview}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleUploadProfilePicture}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Save Picture
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
              <nav className="p-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left cursor-pointer ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span className="truncate">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              {/* PERSONAL */}
              {activeSection === "personal" && (
                <>
                  <SectionHeader title="Personal Information" subtitle="Your basic personal details" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                    <InfoRow label="First Name" value={resident.first_name} />
                    <InfoRow label="Middle Name" value={resident.middle_name} />
                    <InfoRow label="Last Name" value={resident.last_name} />
                    <InfoRow label="Suffix" value={resident.suffix} />
                    <InfoRow label="Sex" value={resident.sex} />
                    <InfoRow label="Date of Birth" value={formatDate(resident.date_of_birth)} />
                    <InfoRow label="Civil Status" value={resident.civil_status} />
                    <InfoRow label="Nationality" value={resident.nationality} />
                    <InfoRow label="Religion" value={resident.religion} />
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InfoRow label="Mobile Number" value={resident.mobile_number} icon={<Phone className="w-4 h-4" />} />
                      <InfoRow label="Email Address" value={resident.email_address} icon={<Mail className="w-4 h-4" />} />
                      <InfoRow
                        label="Complete Address"
                        value={[
                          resident.house_number,
                          resident.street,
                          resident.purok ? `Purok ${resident.purok}` : null,
                          resident.barangay,
                          resident.city,
                          resident.province,
                        ].filter(Boolean).join(", ")}
                        icon={<MapPin className="w-4 h-4" />}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* EMERGENCY */}
              {activeSection === "emergency" && (
                <>
                  <SectionHeader title="Emergency Contact Persons" subtitle="Who to contact in case of emergency" />
                  <div className="overflow-x-auto mt-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Name</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Relationship</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Mobile Number</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resident.emergency_name ? (
                          <tr className="border-b border-slate-100">
                            <td className="py-3 px-4 text-sm text-slate-700">{resident.emergency_name}</td>
                            <td className="py-3 px-4 text-sm text-slate-700">{resident.emergency_relationship || "-"}</td>
                            <td className="py-3 px-4 text-sm text-slate-700">{resident.emergency_number || "-"}</td>
                          </tr>
                        ) : (
                          <tr>
                            <td colSpan="3" className="py-8 text-center text-sm text-slate-400">
                              No emergency contact information on file.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {resident.emergency_address && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Emergency Address</p>
                      <p className="text-sm text-slate-700">{resident.emergency_address}</p>
                    </div>
                  )}
                </>
              )}

              {/* ADDITIONAL */}
              {activeSection === "additional" && (
                <>
                  <SectionHeader title="Additional Information" subtitle="Other important details" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                    <InfoRow label="Occupation" value={resident.occupation} />
                    <InfoRow label="Voter Status" value={resident.voter_status} />
                    <InfoRow label="Father's Name" value={resident.father_name} />
                    <InfoRow label="Mother's Name" value={resident.mother_name} />
                    <InfoRow label="Spouse Name" value={resident.spouse_name} />
                    <InfoRow label="Partner's Full Name" value={resident.partner_full_name} />
                    <InfoRow label="Family Members" value={resident.family_members} />
                  </div>
                </>
              )}

              {/* HOUSEHOLD */}
              {activeSection === "household" && (
                <>
                  <SectionHeader title="Household Details" subtitle="Your household information" />
                  {resident.household_no || resident.purok ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                      <InfoRow label="Household Number" value={resident.household_no} />
                      <InfoRow label="Purok" value={resident.purok} />
                      <InfoRow label="Street" value={resident.street} />
                      <InfoRow label="House Number" value={resident.house_number} />
                      <InfoRow label="Barangay" value={resident.barangay} />
                      <InfoRow label="City" value={resident.city} />
                      <InfoRow label="Province" value={resident.province} />
                    </div>
                  ) : (
                    <EmptyState icon={<Home className="w-12 h-12" />} message="No Household Details" />
                  )}
                </>
              )}

              {/* BLOTTER */}
              {activeSection === "blotter" && (
                <>
                  <SectionHeader title="Blotter Records" subtitle="Records where you are involved" />
                  <div className="mt-6">
                    {blottersLoading ? (
                      <div className="flex items-center justify-center py-16 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading blotter records...
                      </div>
                    ) : blotters.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Record #</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Date Reported</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Incident Type</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Incident Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {blotters.map((blotter) => (
                              <tr key={blotter.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 text-sm font-semibold text-slate-800">{blotter.record_number}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{blotter.date_reported}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getBlotterStatusColor(blotter.status)}`}>
                                    {blotter.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-600">{blotter.incident_type}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{blotter.incident_date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState icon={<Gavel className="w-12 h-12" />} message="No Results" />
                    )}
                  </div>
                </>
              )}

              {/* REQUESTS */}
              {activeSection === "requests" && (
                <>
                  <SectionHeader title="Service Requests" subtitle="Your certificate requests" />
                  <div className="mt-6">
                    <EmptyState icon={<FileText className="w-12 h-12" />} message="No requests found" />
                  </div>
                </>
              )}

              {/* INCIDENT */}
              {activeSection === "incident" && (
                <>
                  <SectionHeader title="Incident Report" subtitle="Incidents you've reported" />
                  <div className="mt-6">
                    {incidentsLoading ? (
                      <div className="flex items-center justify-center py-16 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading incident reports...
                      </div>
                    ) : incidents.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Report #</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Incident Title</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Location</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Date Reported</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {incidents.map((incident) => (
                              <tr key={incident.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 text-sm font-semibold text-slate-800">{incident.report_id}</td>
                                <td className="py-3 px-4 text-sm text-slate-700">{incident.incident_title}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{incident.location || "-"}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{incident.date_reported}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getIncidentStatusColor(incident.status)}`}>
                                    {incident.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState icon={<Bell className="w-12 h-12" />} message="No Results" />
                    )}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// HELPERS
// =====================================================
const SectionHeader = ({ title, subtitle }) => (
  <div>
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
  </div>
);

const EmptyState = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-slate-300 mb-4">{icon}</div>
    <p className="text-sm text-slate-400">{message}</p>
  </div>
);

const InfoRow = ({ label, value, icon }) => (
  <div>
    <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide font-semibold">{label}</p>
    <div className="flex items-center gap-2">
      {icon && <span className="text-slate-400">{icon}</span>}
      <p className="text-sm font-medium text-slate-700 break-words">{value || "Not provided"}</p>
    </div>
  </div>
);

export default MyProfile;