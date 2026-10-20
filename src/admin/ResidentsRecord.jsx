// src/admin/ResidentsRecord.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch, FaPlus, FaEdit, FaTrash, FaTimes,
  FaEye, FaFilter, FaSpinner, FaCheckCircle, FaExclamationTriangle,
  FaInfoCircle, FaUserCheck, FaUser, FaPhone, FaEnvelope,
  FaBirthdayCake, FaVenusMars, FaUserFriends, FaBriefcase, FaIdCard,
  FaMapMarkerAlt, FaVoteYea, FaWheelchair,
} from "react-icons/fa";
import { api } from "../api/client";
import { usePermission } from "../hooks/usePermission";

// =====================================================
// OCCUPATION OPTIONS
// =====================================================
const OCCUPATION_OPTIONS = [
  "Student",
  "Employed - Private",
  "Employed - Government",
  "Self-Employed",
  "Business Owner",
  "Freelancer",
  "OFW",
  "Retired",
  "Unemployed",
  "Housewife / Househusband",
  "Farmer",
  "Fisherfolk",
  "Driver",
  "Vendor",
  "Laborer",
  "Others",
];

const VOTER_STATUS_OPTIONS = ["Yes", "No"];

const DISABILITY_TYPES = [
  "Blind / Visual Impairment",
  "Deaf / Hard of Hearing",
  "Speech Impairment",
  "Physical Disability (Orthopedic)",
  "Intellectual Disability",
  "Learning Disability",
  "Mental / Psychosocial Disability",
  "Autism",
  "Multiple Disabilities",
  "Others",
];

const FILTER_OPTIONS = [
  "All",
  "Active",
  "Inactive",
  "Voters",
  "PWD",
  "Single Parent",
  "Senior",
];

// =====================================================
// ✅ ONLINE/OFFLINE DOT
// =====================================================
const getOnlineStatusDot = (resident) => {
  if (resident.status === "Deceased") {
    return { color: "bg-red-500", label: "Deceased" };
  }
  if (resident.status === "Transferred") {
    return { color: "bg-amber-500", label: "Transferred" };
  }

  // ✅ Online = BRIGHT GREEN
  if (Number(resident.is_online) === 1) {
    return { color: "bg-emerald-500", label: "Online" };
  }

  // ✅ Offline = GRAY
  return { color: "bg-gray-400", label: "Offline" };
};

// =====================================================
// TOAST
// =====================================================
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config =
    {
      success: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", text: "text-emerald-800", Icon: FaCheckCircle },
      error: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", text: "text-red-800", Icon: FaExclamationTriangle },
      info: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", text: "text-blue-800", Icon: FaInfoCircle },
    }[toast.type] || {
      bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", text: "text-emerald-800", Icon: FaCheckCircle,
    };

  const Icon = config.Icon;

  return (
    <div className="animate-slide-in">
      <div className={`flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg border ${config.bg} ${config.border} min-w-[320px] max-w-md`}>
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.icon}`} />
        <div className="flex-1">
          {toast.title && <p className={`font-semibold text-sm ${config.text}`}>{toast.title}</p>}
          <p className={`text-sm ${config.text} opacity-90 mt-0.5`}>{toast.message}</p>
        </div>
        <button onClick={onClose} className={`p-1 rounded-lg hover:bg-black/5 ${config.text} shrink-0`}>
          <FaTimes className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// =====================================================
// MAIN
// =====================================================
export default function ResidentsRecord() {
  const { canView, canCreate, canEdit, canDelete } = usePermission();

  const hasAccess = canView("residentsRecord", "residentsList");
  const canAddResident = canCreate("residentsRecord", "residentsList");
  const canEditResident = canEdit("residentsRecord", "residentsList");
  const canDeleteResident = canDelete("residentsRecord", "residentsList");

  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [quickToggling, setQuickToggling] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState("");
  const [profileFile, setProfileFile] = useState(null);

  const [isDisabilityManual, setIsDisabilityManual] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingResident, setDeletingResident] = useState(null);

  const [viewResident, setViewResident] = useState(null);

  const [toasts, setToasts] = useState([]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  const showToast = (type, message, title = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const emptyForm = {
    first_name: "", middle_name: "", last_name: "", suffix: "",
    sex: "Male", date_of_birth: "", civil_status: "Single",
    nationality: "Filipino", religion: "",
    father_name: "", mother_name: "", spouse_name: "", partner_full_name: "",
    family_members: "",
    emergency_name: "", emergency_relationship: "",
    emergency_number: "", emergency_address: "",
    email_address: "", mobile_number: "",
    house_number: "", street: "", purok: "", household_no: "",
    barangay: "Barangay Central", city: "Taguig City", province: "Metro Manila",
    occupation: "", voter_status: "No", status: "Active",
    is_pwd: 0, disability_type: "", is_single_parent: 0,
  };

  // =====================================================
  // FETCH
  // =====================================================
  const fetchResidents = async () => {
    try {
      setLoading(true);
      const res = await api.getResidents();
      if (res.success) setResidents(res.data || []);
      else showToast("error", res.message || "Failed to load residents.", "Load Failed");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load residents.", "Connection Error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch initially
  useEffect(() => {
    fetchResidents();
  }, []);

  // ✅ SSE — Real-time updates
  useEffect(() => {
    console.log("🔌 Subscribing to SSE...");

    const eventSource = api.subscribeToUpdates((data) => {
      console.log("🔔 Real-time update received:", data);

      if (data.resource === "residents") {
        console.log("🔄 Refetching residents...");
        fetchResidents();
      }
    });

    return () => {
      console.log("🔌 Closing SSE connection");
      eventSource.close();
    };
  }, []);

  // =====================================================
  // QUICK TOGGLE VOTER
  // =====================================================
  const toggleVoterStatus = async (resident) => {
    if (!canEditResident) return;

    const currentStatus = String(resident.voter_status || "").toLowerCase();
    const newStatus = currentStatus === "yes" ? "No" : "Yes";

    try {
      setQuickToggling(`voter-${resident.id}`);

      const res = await api.updateResident(resident.id, {
        ...resident,
        voter_status: newStatus,
      });

      if (!res.success) throw new Error(res.message || "Failed to update.");

      setResidents((prev) =>
        prev.map((r) =>
          r.id === resident.id ? { ...r, voter_status: newStatus } : r
        )
      );

      showToast("success", `${resident.first_name} ${resident.last_name} — Voter: ${newStatus}`, "Updated");
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to update voter status.", "Error");
    } finally {
      setQuickToggling(null);
    }
  };

  // =====================================================
  // QUICK TOGGLE STATUS
  // =====================================================
  const toggleResidentStatus = async (resident) => {
    if (!canEditResident) return;

    const newStatus = resident.status === "Active" ? "Inactive" : "Active";
    const newAccountStatus = newStatus === "Active" ? "Active" : "Inactive";

    try {
      setQuickToggling(`status-${resident.id}`);

      const res = await api.updateResident(resident.id, {
        ...resident,
        status: newStatus,
        account_status: newAccountStatus,
      });

      if (!res.success) throw new Error(res.message || "Failed to update.");

      setResidents((prev) =>
        prev.map((r) =>
          r.id === resident.id
            ? { ...r, status: newStatus, account_status: newAccountStatus }
            : r
        )
      );

      showToast("success", `${resident.first_name} ${resident.last_name} — Status: ${newStatus}`, "Updated");
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to update status.", "Error");
    } finally {
      setQuickToggling(null);
    }
  };

  const isCustomDisabilityType = (value) => {
    if (!value) return false;
    return !DISABILITY_TYPES.includes(value);
  };

  // =====================================================
  // OPEN CREATE / EDIT
  // =====================================================
  const handleOpenCreate = () => {
    if (!canAddResident) return;
    setEditingResident(null);
    setFormData({ ...emptyForm });
    setProfileFile(null);
    setFormError("");
    setIsDisabilityManual(false);
    setShowModal(true);
  };

  const handleOpenEdit = (resident) => {
    if (!canEditResident) return;
    setEditingResident(resident);
    setFormData({
      ...emptyForm,
      ...resident,
      is_pwd: Number(resident.is_pwd) === 1 ? 1 : 0,
      is_single_parent: Number(resident.is_single_parent) === 1 ? 1 : 0,
      disability_type: resident.disability_type || "",
    });
    setProfileFile(null);
    setFormError("");
    setIsDisabilityManual(isCustomDisabilityType(resident.disability_type));
    setShowModal(true);
  };

  // =====================================================
  // SUBMIT
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (editingResident && !canEditResident) return;
    if (!editingResident && !canAddResident) return;

    if (!formData.first_name?.trim()) return setFormError("First name is required.");
    if (!formData.last_name?.trim()) return setFormError("Last name is required.");

    if (formData.date_of_birth && formData.date_of_birth > todayStr) {
      return setFormError("Date of Birth cannot be a future date.");
    }

    setActionLoading(true);

    try {
      const payload = { ...formData };
      if (profileFile) payload.profile_picture = profileFile;

      let res;
      if (editingResident) res = await api.updateResident(editingResident.id, payload);
      else res = await api.createResident(payload);

      if (!res.success) throw new Error(res.message || "Failed to save resident.");

      showToast(
        "success",
        editingResident ? "Resident updated successfully." : "Resident added successfully.",
        "Saved"
      );

      setShowModal(false);
      await fetchResidents();
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Failed to save resident.");
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================
  const confirmDelete = async () => {
    if (!deletingResident) return;
    if (!canDeleteResident) return;

    setActionLoading(true);

    try {
      const res = await api.deleteResident(deletingResident.id);
      if (!res.success) throw new Error(res.message || "Failed to delete.");

      showToast("success", `${deletingResident.first_name} ${deletingResident.last_name} deleted.`, "Deleted");
      setShowDeleteModal(false);
      setDeletingResident(null);
      await fetchResidents();
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to delete.", "Error");
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================
  const computeAge = (dob) => {
    if (!dob) return "N/A";
    const bd = new Date(dob);
    if (isNaN(bd.getTime())) return "N/A";
    const today = new Date();
    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
    return age;
  };

  const isSenior = (dob) => {
    const age = computeAge(dob);
    return typeof age === "number" && age >= 60;
  };

  // =====================================================
  // FILTER
  // =====================================================
  const filtered = residents.filter((r) => {
    const keyword = search.toLowerCase();
    const matchSearch =
      !search ||
      String(r.first_name || "").toLowerCase().includes(keyword) ||
      String(r.last_name || "").toLowerCase().includes(keyword) ||
      String(r.resident_id || "").toLowerCase().includes(keyword) ||
      String(r.mobile_number || "").toLowerCase().includes(keyword) ||
      String(r.email_address || "").toLowerCase().includes(keyword);

    let matchFilter = true;
    const voterStatus = String(r.voter_status || "").toLowerCase();

    if (statusFilter === "Active") {
      matchFilter = r.status === "Active";
    } else if (statusFilter === "Inactive") {
      matchFilter = r.status === "Inactive";
    } else if (statusFilter === "Voters") {
      matchFilter = voterStatus === "yes";
    } else if (statusFilter === "PWD") {
      matchFilter = Number(r.is_pwd) === 1;
    } else if (statusFilter === "Single Parent") {
      matchFilter = Number(r.is_single_parent) === 1;
    } else if (statusFilter === "Senior") {
      matchFilter = isSenior(r.date_of_birth);
    }

    return matchSearch && matchFilter;
  });

  // =====================================================
  // VOTER BADGE
  // =====================================================
  const getVoterBadge = (resident) => {
    const status = String(resident.voter_status || "").toLowerCase();
    const isToggling = quickToggling === `voter-${resident.id}`;

    if (!canEditResident) {
      return (
        <span
          className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold min-w-[52px] ${
            status === "yes"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
              : "bg-red-50 text-red-700 border border-red-300"
          }`}
        >
          {status === "yes" ? "Yes" : "No"}
        </span>
      );
    }

    if (status === "yes") {
      return (
        <button
          onClick={() => toggleVoterStatus(resident)}
          disabled={isToggling}
          title="Click to switch to 'No'"
          className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all cursor-pointer disabled:opacity-50 min-w-[52px]"
        >
          {isToggling ? <FaSpinner className="animate-spin" size={10} /> : "Yes"}
        </button>
      );
    }

    if (status === "no") {
      return (
        <button
          onClick={() => toggleVoterStatus(resident)}
          disabled={isToggling}
          title="Click to switch to 'Yes'"
          className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer disabled:opacity-50 min-w-[52px]"
        >
          {isToggling ? <FaSpinner className="animate-spin" size={10} /> : "No"}
        </button>
      );
    }

    return (
      <button
        onClick={() => toggleVoterStatus(resident)}
        disabled={isToggling}
        title="Click to set 'Yes'"
        className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all cursor-pointer disabled:opacity-50 min-w-[52px]"
      >
        {isToggling ? <FaSpinner className="animate-spin" size={10} /> : "—"}
      </button>
    );
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================
  const getStatusBadge = (resident) => {
    const status = resident.status || "Unknown";
    const isToggling = quickToggling === `status-${resident.id}`;

    const config = {
      Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-600 hover:text-white",
      Inactive: "bg-gray-100 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-600 hover:text-white",
      Deceased: "bg-red-50 text-red-700 ring-1 ring-red-200",
      Transferred: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    };

    if (!canEditResident || status === "Deceased" || status === "Transferred") {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${config[status] || "bg-gray-100 text-gray-700"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {status}
        </span>
      );
    }

    return (
      <button
        onClick={() => toggleResidentStatus(resident)}
        disabled={isToggling}
        title={`Click to switch to '${status === "Active" ? "Inactive" : "Active"}'`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50 ${config[status] || "bg-gray-100 text-gray-700"}`}
      >
        {isToggling ? (
          <FaSpinner className="animate-spin" size={10} />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        )}
        {status}
      </button>
    );
  };

  // =====================================================
  // ACCESS DENIED
  // =====================================================
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <FaExclamationTriangle className="text-red-500 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-2">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="fixed top-6 right-6 z-[100] space-y-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Residents Record
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all {residents.length} registered residents of Barangay Central.
          </p>
        </div>

        {canAddResident && (
          <button
            onClick={handleOpenCreate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer text-sm"
          >
            <FaPlus size={12} /> Add Resident
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute top-3.5 left-4 text-gray-400" size={13} />
          <input
            type="text"
            placeholder="Search name, ID, mobile, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <FaFilter className="text-gray-400 shrink-0" size={13} />
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === filter
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-700 text-white text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Resident ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Sex</th>
                <th className="p-4 font-semibold">Age</th>
                <th className="p-4 font-semibold">Voter</th>
                <th className="p-4 font-semibold">Status</th>
                {(canEditResident || canDeleteResident) && (
                  <th className="p-4 font-semibold text-center">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400">
                    <FaSpinner className="animate-spin inline mr-2" size={16} />
                    Loading residents...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((resident) => {
                  const age = computeAge(resident.date_of_birth);
                  const senior = isSenior(resident.date_of_birth);
                  const pwd = Number(resident.is_pwd) === 1;
                  const singleParent = Number(resident.is_single_parent) === 1;
                  const onlineStatus = getOnlineStatusDot(resident);

                  const fullName = `${resident.first_name} ${resident.middle_name ? resident.middle_name.charAt(0) + "." : ""} ${resident.last_name} ${resident.suffix || ""}`.trim();

                  return (
                    <tr key={resident.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="p-4 font-mono text-xs text-gray-500">
                        {resident.resident_id || "-"}
                      </td>

                      <td className="p-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          {/* ✅ Avatar with ONLINE/OFFLINE dot */}
                          <div className="relative w-9 h-9 shrink-0">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs overflow-hidden ring-2 ring-white shadow-sm">
                              {resident.profile_picture ? (
                                <img
                                  src={`http://localhost/barangay-api/${resident.profile_picture}`}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                resident.first_name?.charAt(0)?.toUpperCase() || "?"
                              )}
                            </div>

                            {/* ✅ Status dot — green kapag online, gray kapag offline */}
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${onlineStatus.color}`}
                              title={onlineStatus.label}
                            />
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="truncate">{fullName}</span>
                            <div className="flex items-center gap-1 flex-wrap">
                              {pwd && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[9px] font-bold uppercase">
                                  <FaWheelchair size={8} /> PWD
                                </span>
                              )}
                              {singleParent && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 text-[9px] font-bold uppercase">
                                  SP
                                </span>
                              )}
                              {senior && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold uppercase">
                                  Senior
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">{resident.sex || "—"}</td>

                      <td className="p-4 font-semibold text-gray-800">{age}</td>

                      <td className="p-4">{getVoterBadge(resident)}</td>

                      <td className="p-4">{getStatusBadge(resident)}</td>

                      {(canEditResident || canDeleteResident) && (
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewResident(resident)}
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                              title="View"
                            >
                              <FaEye size={12} />
                            </button>

                            {canEditResident && (
                              <button
                                onClick={() => handleOpenEdit(resident)}
                                className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                                title="Edit"
                              >
                                <FaEdit size={12} />
                              </button>
                            )}

                            {canDeleteResident && (
                              <button
                                onClick={() => { setDeletingResident(resident); setShowDeleteModal(true); }}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                                title="Delete"
                              >
                                <FaTrash size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400">
                    No residents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          Showing <strong className="text-gray-700">{filtered.length}</strong> of{" "}
          <strong className="text-gray-700">{residents.length}</strong> residents
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewResident && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewResident(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-emerald-50">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg overflow-hidden shadow-md">
                    {viewResident.profile_picture ? (
                      <img src={`http://localhost/barangay-api/${viewResident.profile_picture}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      viewResident.first_name?.charAt(0)?.toUpperCase() || "?"
                    )}
                  </div>

                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${getOnlineStatusDot(viewResident).color}`}
                    title={getOnlineStatusDot(viewResident).label}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {viewResident.first_name} {viewResident.middle_name} {viewResident.last_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-gray-500">{viewResident.resident_id}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewResident(null)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 shadow-sm cursor-pointer"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <Section title="Personal Information" icon={<FaIdCard />}>
                <Field icon={<FaBirthdayCake />} label="Date of Birth" value={viewResident.date_of_birth} />
                <Field icon={<FaVenusMars />} label="Sex" value={viewResident.sex} />
                <Field label="Civil Status" value={viewResident.civil_status} />
                <Field label="Nationality" value={viewResident.nationality} />
                <Field label="Religion" value={viewResident.religion} />
              </Section>

              <Section title="Contact & Address" icon={<FaMapMarkerAlt />}>
                <Field icon={<FaPhone />} label="Mobile" value={viewResident.mobile_number} />
                <Field icon={<FaEnvelope />} label="Email" value={viewResident.email_address} />
                <Field label="House No." value={viewResident.house_number} />
                <Field label="Street" value={viewResident.street} />
                <Field label="Purok" value={viewResident.purok} />
                <Field label="Barangay" value={viewResident.barangay} />
                <Field label="City" value={viewResident.city} />
                <Field label="Province" value={viewResident.province} />
              </Section>

              <Section title="Family Information" icon={<FaUserFriends />}>
                <Field label="Father" value={viewResident.father_name} />
                <Field label="Mother" value={viewResident.mother_name} />
                <Field label="Spouse" value={viewResident.spouse_name} />
                <Field label="Family Members" value={viewResident.family_members} />
              </Section>

              <Section title="Emergency Contact" icon={<FaUser />}>
                <Field label="Name" value={viewResident.emergency_name} />
                <Field label="Relationship" value={viewResident.emergency_relationship} />
                <Field label="Number" value={viewResident.emergency_number} />
                <Field label="Address" value={viewResident.emergency_address} />
              </Section>

              <Section title="Other Information" icon={<FaBriefcase />}>
                <Field label="Occupation" value={viewResident.occupation} />
                <Field icon={<FaVoteYea />} label="Voter Status" value={viewResident.voter_status} />
                <Field
                  icon={<FaWheelchair />}
                  label="PWD"
                  value={
                    Number(viewResident.is_pwd) === 1
                      ? `Yes${viewResident.disability_type ? ` — ${viewResident.disability_type}` : ""}`
                      : "No"
                  }
                />
                <Field
                  label="Single Parent"
                  value={Number(viewResident.is_single_parent) === 1 ? "Yes" : "No"}
                />
              </Section>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setViewResident(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-100 text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-emerald-50">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editingResident ? "Edit Resident" : "Add New Resident"}
                </h2>
                <p className="text-xs text-gray-500">
                  {editingResident ? `ID: ${editingResident.resident_id}` : "Fill in the resident information"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 shadow-sm cursor-pointer"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
              <FormSection title="Personal Information">
                <Input label="First Name *" value={formData.first_name} onChange={(v) => setFormData({ ...formData, first_name: v })} />
                <Input label="Middle Name" value={formData.middle_name} onChange={(v) => setFormData({ ...formData, middle_name: v })} />
                <Input label="Last Name *" value={formData.last_name} onChange={(v) => setFormData({ ...formData, last_name: v })} />
                <Input label="Suffix" value={formData.suffix} onChange={(v) => setFormData({ ...formData, suffix: v })} />
                <Select label="Sex" value={formData.sex} onChange={(v) => setFormData({ ...formData, sex: v })} options={["Male", "Female", "Other"]} />
                <Input label="Date of Birth" type="date" max={todayStr} value={formData.date_of_birth} onChange={(v) => setFormData({ ...formData, date_of_birth: v })} />
                <Select label="Civil Status" value={formData.civil_status} onChange={(v) => setFormData({ ...formData, civil_status: v })} options={["Single", "Married", "Widowed", "Separated", "Annulled"]} />
                <Input label="Nationality" value={formData.nationality} onChange={(v) => setFormData({ ...formData, nationality: v })} />
                <Input label="Religion" value={formData.religion} onChange={(v) => setFormData({ ...formData, religion: v })} />
              </FormSection>

              <FormSection title="Contact Information">
                <Input label="Mobile Number" value={formData.mobile_number} onChange={(v) => setFormData({ ...formData, mobile_number: v })} />
                <Input label="Email Address" type="email" value={formData.email_address} onChange={(v) => setFormData({ ...formData, email_address: v })} />
                <Input label="House Number" value={formData.house_number} onChange={(v) => setFormData({ ...formData, house_number: v })} />
                <Input label="Street" value={formData.street} onChange={(v) => setFormData({ ...formData, street: v })} />
                <Input label="Purok" value={formData.purok} onChange={(v) => setFormData({ ...formData, purok: v })} />
                <Input label="Household No." value={formData.household_no} onChange={(v) => setFormData({ ...formData, household_no: v })} />
                <Input label="Barangay" value={formData.barangay} onChange={(v) => setFormData({ ...formData, barangay: v })} />
                <Input label="City" value={formData.city} onChange={(v) => setFormData({ ...formData, city: v })} />
                <Input label="Province" value={formData.province} onChange={(v) => setFormData({ ...formData, province: v })} />
              </FormSection>

              <FormSection title="Family Information">
                <Input label="Father's Name" value={formData.father_name} onChange={(v) => setFormData({ ...formData, father_name: v })} />
                <Input label="Mother's Name" value={formData.mother_name} onChange={(v) => setFormData({ ...formData, mother_name: v })} />
                <Input label="Spouse Name" value={formData.spouse_name} onChange={(v) => setFormData({ ...formData, spouse_name: v })} />
                <Input label="Partner Full Name" value={formData.partner_full_name} onChange={(v) => setFormData({ ...formData, partner_full_name: v })} />
              </FormSection>

              <FormSection title="Emergency Contact">
                <Input label="Emergency Contact Name" value={formData.emergency_name} onChange={(v) => setFormData({ ...formData, emergency_name: v })} />
                <Input label="Relationship" value={formData.emergency_relationship} onChange={(v) => setFormData({ ...formData, emergency_relationship: v })} />
                <Input label="Emergency Number" value={formData.emergency_number} onChange={(v) => setFormData({ ...formData, emergency_number: v })} />
                <Input label="Emergency Address" value={formData.emergency_address} onChange={(v) => setFormData({ ...formData, emergency_address: v })} />
              </FormSection>

              <FormSection title="Account & Other">
                <Select
                  label="Occupation"
                  value={formData.occupation}
                  onChange={(v) => setFormData({ ...formData, occupation: v })}
                  options={OCCUPATION_OPTIONS}
                />
                <Select
                  label="Voter Status"
                  value={formData.voter_status}
                  onChange={(v) => setFormData({ ...formData, voter_status: v })}
                  options={VOTER_STATUS_OPTIONS}
                />
                <Select label="Status" value={formData.status} onChange={(v) => setFormData({ ...formData, status: v })} options={["Active", "Inactive"]} />
              </FormSection>

              <FormSection title="Special Categories">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Person with Disability (PWD)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 rounded-xl p-2.5">
                    <input
                      type="checkbox"
                      checked={Number(formData.is_pwd) === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_pwd: e.target.checked ? 1 : 0,
                          disability_type: e.target.checked ? formData.disability_type : "",
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">
                      Yes, this resident is a PWD
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-600">
                      Disability Type
                    </label>

                    {Number(formData.is_pwd) === 1 && (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isDisabilityManual}
                          onChange={(e) => {
                            const manual = e.target.checked;
                            setIsDisabilityManual(manual);
                            if (manual) {
                              setFormData({ ...formData, disability_type: "" });
                            } else {
                              setFormData({ ...formData, disability_type: "" });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 font-medium">
                          Manual Input (Not in list)
                        </span>
                      </label>
                    )}
                  </div>

                  {Number(formData.is_pwd) === 1 ? (
                    isDisabilityManual ? (
                      <input
                        type="text"
                        value={formData.disability_type || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, disability_type: e.target.value })
                        }
                        placeholder="I-type ang disability (e.g., Rare medical condition)"
                        className="w-full bg-white border-2 border-emerald-300 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <select
                        value={formData.disability_type || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, disability_type: e.target.value })
                        }
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">-- Select disability type --</option>
                        {DISABILITY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    )
                  ) : (
                    <input
                      type="text"
                      value=""
                      disabled
                      placeholder="N/A (only for PWD)"
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-sm outline-none cursor-not-allowed text-gray-400"
                    />
                  )}

                  {Number(formData.is_pwd) === 1 && isDisabilityManual && (
                    <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
                      <FaInfoCircle size={10} />
                      I-type ang specific na disability na wala sa listahan.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Single Parent
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 rounded-xl p-2.5">
                    <input
                      type="checkbox"
                      checked={Number(formData.is_single_parent) === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_single_parent: e.target.checked ? 1 : 0,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">
                      Yes, this resident is a single parent
                    </span>
                  </label>
                </div>
              </FormSection>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Profile Picture (optional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => setProfileFile(e.target.files[0] || null)}
                  className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer cursor-pointer bg-gray-50 border border-gray-200 rounded-xl p-1.5"
                />
                <p className="text-[11px] text-gray-400 mt-1">JPG o PNG, max 1MB.</p>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  {formError}
                </div>
              )}
            </form>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-100 text-sm disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-60 cursor-pointer shadow-md"
              >
                {actionLoading ? (
                  <><FaSpinner className="animate-spin" size={12} /> Saving...</>
                ) : (
                  <><FaUserCheck size={13} /> {editingResident ? "Update" : "Save"} Resident</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && deletingResident && canDeleteResident && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <FaTrash />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Delete Resident?</h3>
                  <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  You are about to delete{" "}
                  <span className="font-bold">
                    {deletingResident.first_name} {deletingResident.last_name}
                  </span>{" "}
                  ({deletingResident.resident_id}). All associated data will be removed.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm cursor-pointer"
              >
                {actionLoading ? (
                  <><FaSpinner className="animate-spin" size={12} /> Deleting...</>
                ) : (
                  <><FaTrash size={12} /> Delete Permanently</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// HELPERS
// =====================================================
const Section = ({ title, icon, children }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-emerald-600">{icon}</span>}
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h4>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">{children}</div>
  </div>
);

const FormSection = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 pb-2 border-b border-emerald-100">
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{children}</div>
  </div>
);

const Field = ({ icon, label, value }) => (
  <div>
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="font-medium text-gray-800 flex items-center gap-1.5">
      {icon && <span className="text-gray-400">{icon}</span>}
      {value || "—"}
    </p>
  </div>
);

const Input = ({ label, value, onChange, type = "text", max }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      value={value || ""}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <option value="">-- Select --</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);