// src/admin/IncidentReports.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaShieldAlt,
  FaPlus,
  FaEdit,
  FaTimes,
  FaClipboardList,
  FaMapMarkerAlt,
  FaEllipsisV,
  FaEye,
  FaTrash,
  FaUser,
  FaInfoCircle,
} from "react-icons/fa";
import { usePermission } from "../hooks/usePermission";

// ===== API URLs =====
const API_URL = "http://localhost/barangay-api/api/incidents.php";
const RESIDENTS_API_URL = "http://localhost/barangay-api/api/residents.php";

// ===== BARANGAY INCIDENT TYPES (A–Z) =====
const INCIDENT_TYPES = [
  "Animal Bite",
  "Barangay Dispute",
  "Blocked Drainage",
  "Broken Street Light",
  "Curfew Violation",
  "Dead Animal",
  "Domestic Dispute",
  "Drug-related Activity",
  "Electrical Hazard",
  "Fallen Tree",
  "Flooding",
  "Garbage Complaint",
  "Illegal Dumping",
  "Illegal Parking",
  "Illegal Structure",
  "Jet Ski / Water Hazard",
  "Kabataan / Minor Dispute",
  "Lost and Found",
  "Minor Accident",
  "Noise Complaint",
  "Obstruction",
  "Open Burning",
  "Peace and Order",
  "Public Disturbance",
  "Road Repair Request",
  "Rodent / Pest Infestation",
  "Stray Animal",
  "Street Fight",
  "Suspicious Person",
  "Theft",
  "Unattended Vehicle",
  "Verbal Threat",
  "Water Supply Issue",
  "Wounded Person",
  "Xenophobia / Discrimination",
  "Youth Disturbance",
  "Zoning Violation",
];

// =====================================================
// ✅ HELPER: Get today's date in YYYY-MM-DD format
// Para sa `max` attribute ng date input (block future dates)
// =====================================================
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// =====================================================
// TOAST COMPONENT
// =====================================================
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "text-emerald-600",
      text: "text-emerald-800",
      Icon: FaCheckCircle,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      text: "text-red-800",
      Icon: FaExclamationTriangle,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      text: "text-blue-800",
      Icon: FaInfoCircle,
    },
  }[toast.type] || {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    text: "text-emerald-800",
    Icon: FaCheckCircle,
  };

  const Icon = config.Icon;

  return (
    <div className="fixed top-6 right-6 z-[100]">
      <div
        className={`flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg border ${config.bg} ${config.border} min-w-[320px] max-w-md`}
      >
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.icon}`} />
        <div className="flex-1">
          {toast.title && (
            <p className={`font-semibold text-sm ${config.text}`}>
              {toast.title}
            </p>
          )}
          <p className={`text-sm ${config.text} opacity-90 mt-0.5`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg hover:bg-black/5 ${config.text} shrink-0`}
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const IncidentReports = () => {
  // ✅ INALIS: useAuth at refreshUser — walang CORS error na

  // ✅ Permission hooks
  const { canView, canCreate, canEdit, canDelete } = usePermission();

  const hasAccess = canView("incidentReports", "incidents");
  const canAddIncident = canCreate("incidentReports", "incidents");
  const canEditIncident = canEdit("incidentReports", "incidents");
  const canDeleteIncident = canDelete("incidentReports", "incidents");

  // ===== DATA =====
  const [reports, setReports] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ===== MODAL =====
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedReport, setSelectedReport] = useState(null);
  const [saving, setSaving] = useState(false);

  // ===== DROPDOWN =====
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // ===== VIEW MODAL =====
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);

  // ===== DELETE MODAL =====
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingReport, setDeletingReport] = useState(null);

  // ===== TOASTS =====
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message, title = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ===== FORM FIELDS =====
  const [incidentTitle, setIncidentTitle] = useState("");
  const [location, setLocation] = useState("");
  const [dateReported, setDateReported] = useState("");
  const [status, setStatus] = useState("Investigating");
  const [description, setDescription] = useState("");

  // ===== INCIDENT TITLE DROPDOWN =====
  const [incidentSearch, setIncidentSearch] = useState("");
  const [showIncidentDropdown, setShowIncidentDropdown] = useState(false);
  const [isManualIncident, setIsManualIncident] = useState(false);
  const incidentDropdownRef = useRef(null);

  // ===== REPORTED BY =====
  const [reportedBySearch, setReportedBySearch] = useState("");
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [showReporterDropdown, setShowReporterDropdown] = useState(false);
  const [isManualReporter, setIsManualReporter] = useState(false);
  const [manualReporterName, setManualReporterName] = useState("");
  const reporterDropdownRef = useRef(null);

  // ===================================================
  // HELPER
  // ===================================================
  const getResidentName = (resident) => {
    return [
      resident.first_name,
      resident.middle_name,
      resident.last_name,
      resident.suffix,
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // ===================================================
  // FETCH REPORTS
  // ===================================================
  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      const result = await res.json();
      if (result.success) {
        setReports(result.data || []);
      } else {
        setError(result.message || "Failed to load incident reports.");
      }
    } catch (err) {
      console.error("INCIDENTS GET ERROR:", err);
      setError("Unable to load incident reports. Check if API is running.");
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // FETCH RESIDENTS
  // ===================================================
  const fetchResidents = async () => {
    try {
      const res = await fetch(RESIDENTS_API_URL);
      const result = await res.json();

      let list = [];
      if (Array.isArray(result)) {
        list = result;
      } else if (result.success && Array.isArray(result.data)) {
        list = result.data;
      } else if (Array.isArray(result.data)) {
        list = result.data;
      }

      setResidents(list);
    } catch (err) {
      console.error("RESIDENTS FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchResidents();
  }, []);

  // ===== CLOSE DROPDOWNS =====
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
      if (
        reporterDropdownRef.current &&
        !reporterDropdownRef.current.contains(e.target)
      ) {
        setShowReporterDropdown(false);
      }
      if (
        incidentDropdownRef.current &&
        !incidentDropdownRef.current.contains(e.target)
      ) {
        setShowIncidentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== STATISTICS =====
  const totalReports = reports.length;
  const investigatingCount = reports.filter(
    (r) => r.status === "Investigating"
  ).length;
  const actionTakenCount = reports.filter(
    (r) => r.status === "Action Taken"
  ).length;
  const resolvedCount = reports.filter((r) => r.status === "Resolved").length;

  // ===== FILTER =====
  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      (rep.incident_title || "").toLowerCase().includes(search.toLowerCase()) ||
      (rep.location || "").toLowerCase().includes(search.toLowerCase()) ||
      (rep.reported_by || "").toLowerCase().includes(search.toLowerCase()) ||
      (rep.report_id || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || rep.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ===== FILTERED RESIDENTS =====
  const filteredResidentsForReporter = residents.filter((r) => {
    if (!reportedBySearch.trim()) return true;
    const q = reportedBySearch.toLowerCase();
    const fullName = getResidentName(r).toLowerCase();
    const residentId = String(r.resident_id || r.id || "").toLowerCase();

    return fullName.includes(q) || residentId.includes(q);
  });

  // ===== FILTERED INCIDENT TYPES =====
  const filteredIncidentTypes = INCIDENT_TYPES.filter((type) =>
    type.toLowerCase().includes(incidentSearch.toLowerCase())
  );

  // ===================================================
  // OPEN ADD MODAL
  // ===================================================
  const handleOpenAddModal = () => {
    if (!canAddIncident) return;
    setModalMode("add");
    setSelectedReport(null);
    setIncidentTitle("");
    setIncidentSearch("");
    setIsManualIncident(false);
    setShowIncidentDropdown(false);
    setLocation("");
    setDateReported(getTodayDate()); // ✅ Default today's date
    setStatus("Investigating");
    setDescription("");
    setReportedBySearch("");
    setSelectedReporter(null);
    setIsManualReporter(false);
    setManualReporterName("");
    setShowReporterDropdown(false);
    setShowModal(true);
  };

  // ===================================================
  // OPEN EDIT MODAL
  // ===================================================
  const handleOpenEditModal = (rep) => {
    if (!canEditIncident) return;
    setModalMode("edit");
    setSelectedReport(rep);
    setIncidentTitle(rep.incident_title || "");
    setIncidentSearch("");
    setIsManualIncident(false);
    setShowIncidentDropdown(false);
    setLocation(rep.location || "");
    setDateReported(rep.date_reported || "");
    setStatus(rep.status || "Investigating");
    setDescription(rep.description || "");

    const matchedResident = residents.find(
      (r) => getResidentName(r) === rep.reported_by
    );

    if (matchedResident) {
      setSelectedReporter(matchedResident);
      setReportedBySearch("");
      setIsManualReporter(false);
      setManualReporterName("");
    } else {
      setSelectedReporter(null);
      setReportedBySearch("");
      setIsManualReporter(true);
      setManualReporterName(rep.reported_by || "");
    }
    setShowReporterDropdown(false);
    setShowModal(true);
    setOpenDropdown(null);
  };

  // ===================================================
  // SELECT REPORTER
  // ===================================================
  const handleSelectReporter = (resident) => {
    setSelectedReporter(resident);
    setReportedBySearch("");
    setShowReporterDropdown(false);
    setIsManualReporter(false);
    setManualReporterName("");
  };

  const handleClearReporter = () => {
    setSelectedReporter(null);
    setReportedBySearch("");
    setIsManualReporter(false);
    setManualReporterName("");
  };

  // ===================================================
  // SUBMIT
  // ✅ May validation din para sa future dates
  // ===================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modalMode === "add" && !canAddIncident) return;
    if (modalMode === "edit" && !canEditIncident) return;

    // ✅ VALIDATION: Hindi pwedeng future date
    const today = getTodayDate();
    if (dateReported > today) {
      showToast(
        "error",
        "Date reported cannot be in the future.",
        "Invalid Date"
      );
      return;
    }

    setSaving(true);

    let reportedByName = "";
    if (isManualReporter) {
      reportedByName = manualReporterName.trim();
    } else if (selectedReporter) {
      reportedByName = getResidentName(selectedReporter);
    }

    if (!reportedByName) {
      showToast(
        "error",
        "Please select or enter the Reported By name.",
        "Missing Field"
      );
      setSaving(false);
      return;
    }

    const payload = {
      incident_title: incidentTitle,
      location,
      reported_by: reportedByName,
      date_reported: dateReported,
      status,
      description,
    };

    try {
      let res;
      if (modalMode === "add") {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedReport.id,
            ...payload,
          }),
        });
      }

      const result = await res.json();

      if (result.success) {
        await fetchReports();
        setShowModal(false);
        showToast(
          "success",
          modalMode === "add"
            ? "Incident report added successfully."
            : "Incident report updated successfully.",
          modalMode === "add" ? "Report Created" : "Report Updated"
        );
      } else {
        showToast(
          "error",
          result.message || "Failed to save incident report.",
          "Save Failed"
        );
      }
    } catch (err) {
      console.error("INCIDENTS SAVE ERROR:", err);
      showToast("error", "Network error. Please try again.", "Connection Error");
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // VIEW / DELETE
  // ===================================================
  const handleViewDetails = (rep) => {
    setViewingReport(rep);
    setShowViewModal(true);
    setOpenDropdown(null);
  };

  const handleDeleteClick = (rep) => {
    if (!canDeleteIncident) return;
    setDeletingReport(rep);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const confirmDelete = async () => {
    if (!deletingReport) return;
    if (!canDeleteIncident) return;

    try {
      const res = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingReport.id }),
      });
      const result = await res.json();
      if (result.success) {
        await fetchReports();
        showToast(
          "success",
          `${deletingReport.report_id} has been deleted.`,
          "Report Deleted"
        );
      } else {
        showToast(
          "error",
          result.message || "Failed to delete incident report.",
          "Delete Failed"
        );
      }
    } catch (err) {
      console.error("INCIDENTS DELETE ERROR:", err);
      showToast("error", "Network error. Please try again.", "Connection Error");
    } finally {
      setShowDeleteModal(false);
      setDeletingReport(null);
    }
  };

  // ===================================================
  // STATUS BADGE
  // ===================================================
  const getStatusBadge = (status) => {
    switch (status) {
      case "Investigating":
        return (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max">
            <FaExclamationTriangle size={10} /> Investigating
          </span>
        );
      case "Action Taken":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max">
            <FaShieldAlt size={10} /> Action Taken
          </span>
        );
      case "Resolved":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max">
            <FaCheckCircle size={10} /> Resolved
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  // ===================================================
  // RENDER GROUPED INCIDENT DROPDOWN (A–Z)
  // ===================================================
  const renderIncidentDropdown = () => {
    if (filteredIncidentTypes.length === 0) {
      return (
        <div className="px-4 py-3 text-sm text-gray-500 text-center">
          No matching incident found. Enable{" "}
          <span className="font-semibold">"Manual Input"</span> above to enter
          a custom incident.
        </div>
      );
    }

    const groups = {};
    filteredIncidentTypes.forEach((item) => {
      const letter = item[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(item);
    });

    return Object.keys(groups)
      .sort()
      .map((letter) => (
        <div key={letter}>
          <div className="px-4 py-1.5 bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
            {letter}
          </div>
          {groups[letter].map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => {
                setIncidentTitle(type);
                setIncidentSearch("");
                setShowIncidentDropdown(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 text-sm text-gray-800"
            >
              {type}
            </button>
          ))}
        </div>
      ));
  };

  // ===================================================
  // ACCESS DENIED
  // ===================================================
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* TOASTS */}
      <div className="fixed top-6 right-6 z-[100] space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Incident Reports
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track barangay-level incidents, complaints, and community concerns.
          </p>
        </div>

        {canAddIncident && (
          <button
            onClick={handleOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer text-sm"
          >
            <FaPlus />
            New Incident Report
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Incidents
            </p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">
              {totalReports}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
            <FaClipboardList />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Investigating
            </p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">
              {investigatingCount}
            </h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">
            <FaExclamationTriangle />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Action Taken
            </p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {actionTakenCount}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
            <FaShieldAlt />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Resolved
            </p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {resolvedCount}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
            <FaCheckCircle />
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute top-3.5 left-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, title, location, reporter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <FaFilter className="text-gray-400 ml-1 mr-1" size={14} />
          {["All", "Investigating", "Action Taken", "Resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === s
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead className="bg-emerald-700 text-white text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Report ID</th>
              <th className="p-4 font-semibold">Incident Title</th>
              <th className="p-4 font-semibold">Location</th>
              <th className="p-4 font-semibold">Reported By</th>
              <th className="p-4 font-semibold">Date Reported</th>
              <th className="p-4 font-semibold">Status</th>
              {(canEditIncident || canDeleteIncident) && (
                <th className="p-4 font-semibold text-center">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
            {loading ? (
              <tr>
                <td className="text-center py-12 text-gray-400" colSpan="7">
                  Loading incident reports...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="text-center py-12 text-red-500" colSpan="7">
                  {error}
                </td>
              </tr>
            ) : filteredReports.length > 0 ? (
              filteredReports.map((rep) => (
                <tr
                  key={rep.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4 font-medium text-gray-800">
                    {rep.report_id}
                  </td>
                  <td className="p-4 font-semibold text-gray-900">
                    {rep.incident_title}
                  </td>
                  <td className="p-4 text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <FaMapMarkerAlt
                        className="text-rose-500 shrink-0"
                        size={12}
                      />
                      {rep.location || "—"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-800">
                    {rep.reported_by || "—"}
                  </td>
                  <td className="p-4 text-gray-500">
                    {rep.date_reported}
                  </td>
                  <td className="p-4">{getStatusBadge(rep.status)}</td>

                  {(canEditIncident || canDeleteIncident) && (
                    <td className="p-4 text-center">
                      <div
                        className="relative inline-block"
                        ref={openDropdown === rep.id ? dropdownRef : null}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(
                              openDropdown === rep.id ? null : rep.id
                            );
                          }}
                          className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition inline-flex items-center justify-center"
                        >
                          <FaEllipsisV size={14} />
                        </button>

                        {openDropdown === rep.id && (
                          <div
                            className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-[100] text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleViewDetails(rep)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <FaEye size={14} className="text-emerald-600" />
                              View Details
                            </button>

                            {canEditIncident && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(rep)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <FaEdit size={14} className="text-amber-600" />
                                Edit
                              </button>
                            )}

                            {canDeleteIncident && (
                              <>
                                <div className="border-t border-gray-100 my-1" />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClick(rep)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <FaTrash size={14} />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td className="text-center py-12 text-gray-400" colSpan="7">
                  No incident reports found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        (modalMode === "add" && canAddIncident) ||
        (modalMode === "edit" && canEditIncident)
      ) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {modalMode === "add"
                    ? "New Incident Report"
                    : `Edit Report: ${selectedReport?.report_id}`}
                </h2>
                <p className="text-xs text-gray-500">
                  Provide details regarding the incident or complaint.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 overflow-y-auto"
            >
              <div className="relative" ref={incidentDropdownRef}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Incident Title / Summary
                </label>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="manualIncidentToggle"
                    checked={isManualIncident}
                    onChange={(e) => {
                      setIsManualIncident(e.target.checked);
                      setIncidentTitle("");
                      setIncidentSearch("");
                      setShowIncidentDropdown(false);
                    }}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="manualIncidentToggle"
                    className="text-xs text-gray-600 cursor-pointer"
                  >
                    Manual Input (Not in the list)
                  </label>
                </div>

                {isManualIncident ? (
                  <input
                    type="text"
                    required
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                    placeholder="Type the incident title..."
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <>
                    <div className="relative">
                      <FaSearch
                        className="absolute left-3 top-3 text-gray-400"
                        size={14}
                      />
                      <input
                        type="text"
                        required
                        value={incidentSearch || incidentTitle}
                        onChange={(e) => {
                          setIncidentSearch(e.target.value);
                          setIncidentTitle(e.target.value);
                          setShowIncidentDropdown(true);
                        }}
                        onFocus={() => setShowIncidentDropdown(true)}
                        placeholder="Select or type an incident..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {showIncidentDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 border rounded-xl max-h-56 overflow-y-auto bg-white shadow-xl z-[110]">
                        {renderIncidentDropdown()}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Location / Address
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Specific street or purok"
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="relative" ref={reporterDropdownRef}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Reported By
                  </label>

                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="manualReporterToggle"
                      checked={isManualReporter}
                      onChange={(e) => {
                        setIsManualReporter(e.target.checked);
                        setSelectedReporter(null);
                        setReportedBySearch("");
                        setManualReporterName("");
                      }}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label
                      htmlFor="manualReporterToggle"
                      className="text-xs text-gray-600 cursor-pointer"
                    >
                      Manual Input (Not registered)
                    </label>
                  </div>

                  {isManualReporter ? (
                    <input
                      type="text"
                      required
                      value={manualReporterName}
                      onChange={(e) => setManualReporterName(e.target.value)}
                      placeholder="Enter reporter name"
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : selectedReporter ? (
                    <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                          {getResidentName(selectedReporter)?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">
                            {getResidentName(selectedReporter)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedReporter.resident_id || "—"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearReporter}
                        className="text-emerald-700 hover:text-emerald-900 text-xs font-medium"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <FaSearch
                          className="absolute left-3 top-3 text-gray-400"
                          size={14}
                        />
                        <input
                          type="text"
                          value={reportedBySearch}
                          onChange={(e) => {
                            setReportedBySearch(e.target.value);
                            setShowReporterDropdown(true);
                          }}
                          onFocus={() => setShowReporterDropdown(true)}
                          placeholder="Search resident from Master Record..."
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {showReporterDropdown &&
                        filteredResidentsForReporter.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 border rounded-xl max-h-48 overflow-y-auto bg-white shadow-xl z-[110]">
                            {filteredResidentsForReporter
                              .slice(0, 20)
                              .map((res) => (
                                <button
                                  type="button"
                                  key={res.id}
                                  onClick={() => handleSelectReporter(res)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                                      {getResidentName(res)?.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm text-gray-800">
                                        {getResidentName(res)}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {res.resident_id || "—"}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}

                      {showReporterDropdown &&
                        reportedBySearch.trim() &&
                        filteredResidentsForReporter.length === 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 border rounded-xl bg-white shadow-xl z-[110] p-3 text-center text-sm text-gray-500">
                            No resident found. Enable "Manual Input" to enter
                            manually.
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Date Reported
                  </label>
                  <input
                    type="date"
                    required
                    value={dateReported}
                    onChange={(e) => setDateReported(e.target.value)}
                    max={getTodayDate()}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Investigating">Investigating</option>
                    <option value="Action Taken">Action Taken</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Description / Action Plan
                </label>
                <textarea
                  rows="3"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about what happened and action taken..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all text-sm cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : modalMode === "add"
                    ? "Save Report"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showViewModal && viewingReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Incident Details
                </h2>
                <p className="text-xs text-gray-500">
                  {viewingReport.report_id}
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Incident Title</p>
                <p className="font-semibold text-gray-800">
                  {viewingReport.incident_title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="font-medium text-gray-800">
                    {viewingReport.location || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reported By</p>
                  <p className="font-medium text-gray-800">
                    {viewingReport.reported_by || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date Reported</p>
                  <p className="font-medium text-gray-800">
                    {viewingReport.date_reported}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  {getStatusBadge(viewingReport.status)}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {viewingReport.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && deletingReport && canDeleteIncident && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <FaTrash size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Delete Incident Report?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deletingReport.report_id}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentReports;