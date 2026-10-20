// src/admin/BlotterRecords.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaEllipsisV,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaUser,
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaEye,
  FaEdit,
  FaArchive,
  FaTrashAlt,
  FaInfoCircle,
  FaChevronDown,
} from "react-icons/fa";
import { usePermission } from "../hooks/usePermission";

const API_URL = "http://localhost/barangay-api/api/blotter.php";
const RESIDENTS_API_URL = "http://localhost/barangay-api/api/residents.php";

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
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

// ✅ MOVED OUTSIDE BlotterRecords
const PersonCard = ({
  person,
  index,
  type,
  onRemove,
  canRemove,
  residentSearches,
  residentsLoading,
  residentsError,
  getResidentSearchResults,
  setResidentSearch,
  selectResident,
  clearResidentSelection,
  toggleManualMode,
  updateManualField,
  getResidentName,
}) => {
  const searchKey = `${type}-${person.id}`;
  const searchValue = residentSearches[searchKey] || "";
  const results = getResidentSearchResults(type, person.id);

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><FaUser /></div>
          <div>
            <h4 className="font-semibold text-gray-800">{type} {index + 1}</h4>
            <p className="text-xs text-gray-500">Select a resident or enter manually</p>
          </div>
        </div>
        {canRemove && <button type="button" onClick={() => onRemove(person.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id={`manual-${type}-${person.id}`}
          checked={person.isManual}
          onChange={(e) => toggleManualMode(type, person.id, e.target.checked)}
          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
        />
        <label htmlFor={`manual-${type}-${person.id}`} className="text-sm text-gray-700 cursor-pointer select-none">
          Manual Input (Not registered)
        </label>
      </div>

      {!person.isManual ? (
        <div>
          {!person.residentDbId ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Resident</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setResidentSearch(type, person.id, e.target.value)}
                  placeholder="Search by name or Resident ID"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {residentsLoading && <p className="text-xs text-gray-500 mt-2">Loading...</p>}
              {residentsError && <p className="text-xs text-red-500 mt-2">{residentsError}</p>}
              {searchValue.trim() && !residentsLoading && !residentsError && (
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  {results.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No resident found.</div>
                  ) : (
                    results.map((resident) => (
                      <button type="button" key={resident.id} onClick={() => selectResident(type, person.id, resident)} className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-gray-100 last:border-b-0">
                        <div className="font-medium text-gray-800">{getResidentName(resident)}</div>
                        <div className="text-xs text-gray-500 mt-1">Resident ID: {resident.resident_id || "—"}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-emerald-600 font-medium uppercase">Selected Resident</p>
                  <p className="font-semibold text-gray-800 mt-1">{person.name}</p>
                  <p className="text-sm text-gray-600 mt-1">Resident ID: {person.residentId || "—"}</p>
                </div>
                <button type="button" onClick={() => clearResidentSelection(type, person.id)} className="text-sm text-emerald-700 hover:text-emerald-900 font-medium">Change</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={person.name}
              onChange={(e) => updateManualField(type, person.id, "name", e.target.value)}
              placeholder="Enter full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barangay ID</label>
              <input
                type="text"
                value={person.barangayId}
                onChange={(e) => updateManualField(type, person.id, "barangayId", e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="text"
                value={person.mobile}
                onChange={(e) => updateManualField(type, person.id, "mobile", e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={person.address}
              onChange={(e) => updateManualField(type, person.id, "address", e.target.value)}
              placeholder="Optional"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const BlotterRecords = () => {
  const { canView, canCreate, canEdit, canDelete } = usePermission();
  const hasBlotterAccess = canView("blotterRecords", "blotter");
  const canCreateBlotter = canCreate("blotterRecords", "blotter");
  const canEditBlotter = canEdit("blotterRecords", "blotter");
  const canDeleteBlotter = canDelete("blotterRecords", "blotter");

  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);

  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);

  const [viewModalRecord, setViewModalRecord] = useState(null);
  const [viewModalLoading, setViewModalLoading] = useState(false);
  const [deleteModalRecord, setDeleteModalRecord] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message, title = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [residents, setResidents] = useState([]);
  const [residentsLoading, setResidentsLoading] = useState(false);
  const [residentsError, setResidentsError] = useState("");
  const [residentSearches, setResidentSearches] = useState({});

  const [recordStatus, setRecordStatus] = useState("Pending");
  const [dateReported, setDateReported] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [incidentDate, setIncidentDate] = useState("");

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  const [complainants, setComplainants] = useState([{ id: Date.now(), residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]);
  const [victims, setVictims] = useState([{ id: Date.now() + 1, residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]);
  const [respondents, setRespondents] = useState([{ id: Date.now() + 2, residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]);
  const [witnesses, setWitnesses] = useState([{ id: Date.now() + 3, residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]);

  const [incidentType, setIncidentType] = useState("");
  const [incidentLocation, setIncidentLocation] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [resolution, setResolution] = useState("");
  const [remarks, setRemarks] = useState("");

  const resetForm = () => {
    setRecordStatus("Pending");
    const now = new Date();
    setDateReported(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
    setIncidentDate("");
    setSaveError("");
    setResidentSearches({});
    setEditingRecord(null);
    setComplainants([{ id: Date.now(), residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]);
    setVictims([{ id: Date.now() + 1, residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]);
    setRespondents([{ id: Date.now() + 2, residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]);
    setWitnesses([{ id: Date.now() + 3, residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]);
    setIncidentType("");
    setIncidentLocation("");
    setIncidentDescription("");
    setActionTaken("");
    setResolution("");
    setRemarks("");
    setCurrentStep(1);
  };

  const openCreateModal = () => {
    if (!canCreateBlotter) return;
    resetForm();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCurrentStep(1);
    setSaveError("");
    setEditingRecord(null);
  };

  const addComplainant = () => setComplainants((prev) => [...prev, { id: Date.now() + Math.random(), residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]);
  const removeComplainant = (id) => { if (complainants.length === 1) return; setComplainants((prev) => prev.filter((p) => p.id !== id)); };
  const addVictim = () => setVictims((prev) => [...prev, { id: Date.now() + Math.random(), residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]);
  const removeVictim = (id) => { if (victims.length === 1) return; setVictims((prev) => prev.filter((p) => p.id !== id)); };
  const addRespondent = () => setRespondents((prev) => [...prev, { id: Date.now() + Math.random(), residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]);
  const removeRespondent = (id) => { if (respondents.length === 1) return; setRespondents((prev) => prev.filter((p) => p.id !== id)); };
  const addWitness = () => setWitnesses((prev) => [...prev, { id: Date.now() + Math.random(), residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]);
  const removeWitness = (id) => { if (witnesses.length === 1) return; setWitnesses((prev) => prev.filter((p) => p.id !== id)); };

  const usedPersonIds = useMemo(() => [...complainants, ...victims].map((p) => p.residentId).filter(Boolean), [complainants, victims]);
  const isResidentAlreadyUsed = (residentId) => { if (!residentId) return false; return usedPersonIds.includes(residentId); };

  const statuses = ["All", "Pending", "Resolved", "Under Investigation", "Dismissed"];
  const statusOptions = ["Pending", "Under Investigation", "Resolved", "Dismissed"];

  const getStatusClass = (status) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-700";
      case "Under Investigation": return "bg-emerald-100 text-emerald-700";
      case "Dismissed": return "bg-gray-100 text-gray-700";
      case "Pending":
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Resolved": return <FaCheckCircle />;
      case "Under Investigation": return <FaEye />;
      case "Dismissed": return <FaBan />;
      case "Pending":
      default: return <FaClock />;
    }
  };

  const fetchRecords = async () => {
    setLoadingRecords(true);
    setRecordsError("");
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to load blotter records.");
      const apiRecords = Array.isArray(result.data) ? result.data : [];
      setRecords(apiRecords.map((record) => ({
        id: record.id,
        recordNumber: record.record_number,
        dateReported: record.date_reported,
        status: record.status,
        complainants: Number(record.complainant_count || 0),
        respondents: Number(record.respondent_count || 0),
        incidentType: record.incident_type,
        incidentDate: record.incident_date,
        incidentTime: record.incident_time,
      })));
    } catch (error) {
      console.error("BLOTTER GET ERROR:", error);
      setRecordsError(error.message || "Unable to load blotter records.");
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => { if (hasBlotterAccess) fetchRecords(); }, [hasBlotterAccess]);

  useEffect(() => {
    if (!showCreateModal || residents.length > 0) return;
    const loadResidents = async () => {
      setResidentsLoading(true);
      setResidentsError("");
      try {
        const response = await fetch(RESIDENTS_API_URL);
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Failed to load residents.");
        setResidents(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("RESIDENTS API ERROR:", error);
        setResidentsError("Unable to load Residents Master Record.");
      } finally {
        setResidentsLoading(false);
      }
    };
    loadResidents();
  }, [showCreateModal, residents.length]);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (
        e.target.closest(".action-dropdown") ||
        e.target.closest(".status-dropdown")
      ) {
        return;
      }
      if (openActionMenu !== null) setOpenActionMenu(null);
      if (openStatusDropdown !== null) setOpenStatusDropdown(null);
    };
    if (openActionMenu === null && openStatusDropdown === null) return undefined;
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [openActionMenu, openStatusDropdown]);

  const getResidentName = useCallback((resident) => [resident.first_name, resident.middle_name, resident.last_name, resident.suffix].filter(Boolean).join(" ").replace(/\s+/g, " ").trim(), []);

  const getResidentSearchResults = useCallback((type, personId) => {
    const query = String(residentSearches[`${type}-${personId}`] || "").trim().toLowerCase();
    if (!query) return [];
    const selectedIds = new Set([...complainants, ...victims].map((p) => Number(p.residentDbId)).filter(Boolean));
    return residents.filter((resident) => {
      const name = getResidentName(resident).toLowerCase();
      const residentId = String(resident.resident_id || "").toLowerCase();
      return name.includes(query) || residentId.includes(query);
    }).filter((resident) => { if (type !== "Respondent") return true; return !selectedIds.has(Number(resident.id)); }).slice(0, 8);
  }, [residentSearches, residents, complainants, victims, getResidentName]);

  const setResidentSearch = useCallback((type, personId, value) => {
    setResidentSearches((prev) => ({ ...prev, [`${type}-${personId}`]: value }));
  }, []);

  const selectResident = useCallback((type, personId, resident) => {
    const fullName = getResidentName(resident);
    const updateMap = { Complainant: setComplainants, Victim: setVictims, Respondent: setRespondents, Witness: setWitnesses };
    const setter = updateMap[type];
    if (!setter) return;
    if (type === "Respondent" && isResidentAlreadyUsed(String(resident.id))) {
      showToast("error", "This resident is already listed as a Complainant or Victim.", "Duplicate Resident");
      return;
    }
    setter((prev) => prev.map((p) => p.id === personId ? { ...p, residentDbId: resident.id, residentId: resident.resident_id || "", name: fullName, isManual: false } : p));
    setResidentSearches((prev) => ({ ...prev, [`${type}-${personId}`]: "" }));
  }, [getResidentName, isResidentAlreadyUsed, showToast]);

  const clearResidentSelection = useCallback((type, personId) => {
    const updateMap = { Complainant: setComplainants, Victim: setVictims, Respondent: setRespondents, Witness: setWitnesses };
    const setter = updateMap[type];
    if (!setter) return;
    setter((prev) => prev.map((p) => p.id === personId ? { ...p, residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false } : p));
    setResidentSearches((prev) => ({ ...prev, [`${type}-${personId}`]: "" }));
  }, []);

  const toggleManualMode = useCallback((type, personId, isManual) => {
    const updateMap = { Complainant: setComplainants, Victim: setVictims, Respondent: setRespondents, Witness: setWitnesses };
    const setter = updateMap[type];
    if (!setter) return;
    setter((prev) => prev.map((p) => p.id === personId ? { ...p, isManual, residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "" } : p));
    setResidentSearches((prev) => ({ ...prev, [`${type}-${personId}`]: "" }));
  }, []);

  const updateManualField = useCallback((type, personId, field, value) => {
    const updateMap = { Complainant: setComplainants, Victim: setVictims, Respondent: setRespondents, Witness: setWitnesses };
    const setter = updateMap[type];
    if (!setter) return;
    setter((prev) => prev.map((p) => p.id === personId ? { ...p, [field]: value } : p));
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesStatus = statusFilter === "All" || record.status === statusFilter;
      const searchText = search.toLowerCase();
      const matchesSearch = !search ||
        String(record.recordNumber || "").toLowerCase().includes(searchText) ||
        String(record.incidentType || "").toLowerCase().includes(searchText);
      return matchesStatus && matchesSearch;
    });
  }, [records, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / recordsPerPage));
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const getStatusCount = (status) => {
    if (status === "All") return records.length;
    return records.filter((r) => r.status === status).length;
  };

  const handleRefresh = async () => { setCurrentPage(1); setOpenActionMenu(null); setOpenStatusDropdown(null); await fetchRecords(); };
  const toggleActionMenu = (recordId) => { setOpenStatusDropdown(null); setOpenActionMenu((prev) => (prev === recordId ? null : recordId)); };
  const closeActionMenus = () => { setOpenActionMenu(null); setOpenStatusDropdown(null); };
  const toggleStatusDropdown = (recordId) => { setOpenActionMenu(null); setOpenStatusDropdown((prev) => (prev === recordId ? null : recordId)); };

  const handleViewDetails = async (record) => {
    closeActionMenus();
    setViewModalLoading(true);
    setViewModalRecord(record);
    try {
      const response = await fetch(`${API_URL}?id=${record.id}`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to load record details.");
      setViewModalRecord({ ...record, ...result.data });
    } catch (error) {
      console.error("BLOTTER VIEW ERROR:", error);
      showToast("error", error.message || "Unable to load full details.", "Error");
    } finally {
      setViewModalLoading(false);
    }
  };

  const handleEditRecord = async (record) => {
    if (!canEditBlotter) return;
    closeActionMenus();
    setSaveError("");

    try {
      const response = await fetch(`${API_URL}?id=${record.id}`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to load record for editing.");
      const data = result.data;

      setEditingRecord(record);
      setRecordStatus(data.status || "Pending");
      setDateReported(data.date_reported || todayStr);
      setIncidentDate(
        data.incident_date
          ? `${data.incident_date}T${(data.incident_time || "00:00:00").slice(0, 5)}`
          : ""
      );
      setIncidentType(data.incident_type || "");
      setIncidentLocation(data.incident_location || "");
      setIncidentDescription(data.incident_description || "");
      setActionTaken(data.action_taken || "");
      setResolution(data.resolution || "");
      setRemarks(data.remarks || "");

      const mapPerson = (p, idx) => ({
        id: Date.now() + idx + Math.random(),
        residentDbId: p.resident_db_id || "",
        residentId: p.resident_id || "",
        name: p.name || "",
        barangayId: p.barangay_id || "",
        mobile: p.mobile || "",
        address: p.address || "",
        isManual: !p.resident_db_id,
      });

      setComplainants(
        data.complainants && data.complainants.length > 0
          ? data.complainants.map(mapPerson)
          : [{ id: Date.now(), residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]
      );
      setVictims(
        data.victims && data.victims.length > 0
          ? data.victims.map(mapPerson)
          : [{ id: Date.now() + 1, residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]
      );
      setRespondents(
        data.respondents && data.respondents.length > 0
          ? data.respondents.map(mapPerson)
          : [{ id: Date.now() + 2, residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]
      );
      setWitnesses(
        data.witnesses && data.witnesses.length > 0
          ? data.witnesses.map(mapPerson)
          : [{ id: Date.now() + 3, residentDbId: "", residentId: "", name: "", barangayId: "", mobile: "", address: "", isManual: false }]
      );

      setCurrentStep(1);
      setShowCreateModal(true);
    } catch (error) {
      console.error("BLOTTER EDIT ERROR:", error);
      showToast("error", error.message || "Unable to load record for editing.", "Error");
    }
  };

  const handleStatusAction = async (recordId, status) => {
    if (!canEditBlotter) return;
    setOpenStatusDropdown(null);
    setOpenActionMenu(null);

    const currentRecord = records.find((r) => Number(r.id) === Number(recordId));
    if (currentRecord && currentRecord.status === status) return;

    setUpdatingStatusId(recordId);

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: recordId, status }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update blotter status.");
      }

      setRecords((prev) =>
        prev.map((r) =>
          Number(r.id) === Number(recordId) ? { ...r, status } : r
        )
      );

      showToast("success", `Status changed to "${status}".`, "Blotter Updated");
    } catch (error) {
      console.error("BLOTTER STATUS UPDATE ERROR:", error);
      showToast("error", error.message || "Unable to update status.", "Error");
      await fetchRecords();
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleArchiveRecord = (record) => {
    if (!canEditBlotter) return;
    closeActionMenus();
    showToast("info", "Archive functionality will be available soon.", `Archiving ${record.recordNumber}`);
  };

  const handleDeleteRecord = (record) => {
    if (!canDeleteBlotter) return;
    closeActionMenus();
    setDeleteModalRecord(record);
  };

  const confirmDelete = async () => {
    if (!deleteModalRecord) return;
    if (!canDeleteBlotter) return;

    const record = deleteModalRecord;
    setDeleteModalRecord(null);
    try {
      const response = await fetch(API_URL, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: record.id }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to delete record.");
      await fetchRecords();
      showToast("success", `${record.recordNumber} has been deleted permanently.`, "Record Deleted");
    } catch (error) {
      console.error("BLOTTER DELETE ERROR:", error);
      showToast("error", error.message || "Unable to delete record.", "Error");
    }
  };

  const nextStep = () => { if (currentStep < 4) setCurrentStep((prev) => prev + 1); };
  const previousStep = () => { if (currentStep > 1) setCurrentStep((prev) => prev - 1); };

  const handleSave = async () => {
    const isEditing = !!editingRecord;
    if (isEditing && !canEditBlotter) return;
    if (!isEditing && !canCreateBlotter) return;

    setSaveError("");
    if (!dateReported) { setSaveError("Date reported is required."); setCurrentStep(1); return; }
    if (!incidentDate) { setSaveError("Incident date and time are required."); setCurrentStep(1); return; }

    if (dateReported > todayStr) {
      setSaveError("Date reported cannot be a future date.");
      setCurrentStep(1);
      return;
    }
    if (incidentDate.split("T")[0] > todayStr) {
      setSaveError("Incident date cannot be a future date.");
      setCurrentStep(1);
      return;
    }

    if (!incidentType.trim()) { setSaveError("Incident type is required."); setCurrentStep(4); return; }
    if (!incidentLocation.trim()) { setSaveError("Incident location is required."); setCurrentStep(4); return; }
    if (!incidentDescription.trim()) { setSaveError("Incident description is required."); setCurrentStep(4); return; }

    const selectedComplainants = complainants.filter((p) => p.residentDbId || (p.isManual && p.name.trim()));
    const selectedVictims = victims.filter((p) => p.residentDbId || (p.isManual && p.name.trim()));
    const selectedRespondents = respondents.filter((p) => p.residentDbId || (p.isManual && p.name.trim()));
    const selectedWitnesses = witnesses.filter((p) => p.residentDbId || (p.isManual && p.name.trim()));

    if (selectedComplainants.length === 0) { setSaveError("Please select at least one Complainant."); setCurrentStep(2); return; }

    const incidentDateValue = incidentDate.split("T")[0];
    const incidentTimePart = incidentDate.split("T")[1] || "";
    const incidentTimeValue = incidentTimePart ? `${incidentTimePart}:00` : null;

    const payload = {
      ...(isEditing ? { id: editingRecord.id } : {}),
      dateReported, status: recordStatus, incidentType: incidentType.trim(),
      incidentDate: incidentDateValue, incidentTime: incidentTimeValue,
      incidentLocation: incidentLocation.trim(), incidentDescription: incidentDescription.trim(),
      actionTaken: actionTaken.trim(), resolution: resolution.trim(),
      resolutionDate: recordStatus === "Resolved" ? new Date().toISOString().slice(0, 10) : null,
      complainants: selectedComplainants.map((p) => ({ residentDbId: p.residentDbId, residentId: p.residentId, name: p.name, barangayId: p.barangayId, mobile: p.mobile, address: p.address, isManual: p.isManual })),
      victims: selectedVictims.map((p) => ({ residentDbId: p.residentDbId, residentId: p.residentId, name: p.name, barangayId: p.barangayId, mobile: p.mobile, address: p.address, isManual: p.isManual })),
      respondents: selectedRespondents.map((p) => ({ residentDbId: p.residentDbId, residentId: p.residentId, name: p.name, barangayId: p.barangayId, mobile: p.mobile, address: p.address, isManual: p.isManual })),
      witnesses: selectedWitnesses.map((p) => ({ residentDbId: p.residentDbId, residentId: p.residentId, name: p.name, barangayId: p.barangayId, mobile: p.mobile, address: p.address, isManual: p.isManual })),
    };

    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to save blotter record.");
      await fetchRecords();
      resetForm();
      setShowCreateModal(false);
      showToast(
        "success",
        isEditing ? "Blotter record updated successfully." : "Blotter record saved successfully.",
        isEditing ? "Record Updated" : "Record Created"
      );
    } catch (error) {
      console.error("BLOTTER SAVE ERROR:", error);
      setSaveError(error.message || "Unable to save blotter record.");
    } finally {
      setSaving(false);
    }
  };

  if (!hasBlotterAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <FaExclamationTriangle className="text-red-500 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-2">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="fixed top-6 right-6 z-[100] space-y-3">
        {toasts.map((toast) => <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />)}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blotter Records</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage official barangay blotter entries.</p>
        </div>
        {canCreateBlotter && (
          <button type="button" onClick={openCreateModal} className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            <FaPlus /> Create Record
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search record number, complainant, respondent..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="button" onClick={handleRefresh} disabled={loadingRecords} className="px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50">
            <FaSyncAlt className={loadingRecords ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {statuses.map((status) => (
            <button key={status} type="button" onClick={() => { setStatusFilter(status); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === status ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {status}<span className="ml-2 opacity-80">({getStatusCount(status)})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-visible">
        <div className="overflow-visible">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Record #</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date Reported</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Complainants</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Respondents</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Incident Type</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Incident Date</th>
                {(canEditBlotter || canDeleteBlotter) && (
                  <th className="px-5 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loadingRecords ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-sm text-gray-500">Loading blotter records...</td></tr>
              ) : recordsError ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center"><p className="text-sm text-red-600">{recordsError}</p></td></tr>
              ) : paginatedRecords.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl mb-4"><FaExclamationTriangle /></div>
                    <h3 className="text-lg font-semibold text-gray-700">No blotter records found</h3>
                    {canCreateBlotter && <button type="button" onClick={openCreateModal} className="mt-5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Create First Record</button>}
                  </div>
                </td></tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">{record.recordNumber}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{record.dateReported}</td>
                    <td className="px-5 py-4">
                      <div className="relative inline-block status-dropdown">
                        {canEditBlotter ? (
                          <>
                            <button type="button" onClick={(e) => { e.stopPropagation(); toggleStatusDropdown(record.id); }} disabled={updatingStatusId === record.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer hover:shadow-md disabled:opacity-50 ${getStatusClass(record.status)}`} title="Click to change status">
                              {updatingStatusId === record.id ? <FaSyncAlt className="animate-spin" /> : getStatusIcon(record.status)}
                              {record.status}<FaChevronDown className="text-[8px] opacity-70" />
                            </button>
                            {openStatusDropdown === record.id && (
                              <div className="absolute left-0 top-full mt-1 z-[80] w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-left" onClick={(e) => e.stopPropagation()}>
                                {statusOptions.map((status) => {
                                  const isCurrent = record.status === status;
                                  return (
                                    <button key={status} type="button" disabled={updatingStatusId === record.id} onClick={() => handleStatusAction(record.id, status)} className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center justify-between ${isCurrent ? "font-semibold text-emerald-600 bg-emerald-50" : "text-gray-700"}`}>
                                      <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${status === "Resolved" ? "bg-green-500" : status === "Under Investigation" ? "bg-emerald-500" : status === "Dismissed" ? "bg-gray-500" : "bg-yellow-500"}`} />
                                        <span>{status}</span>
                                      </div>
                                      {isCurrent && <FaCheckCircle className="text-emerald-500 text-xs" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusClass(record.status)}`}>
                            {getStatusIcon(record.status)}{record.status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{record.complainants}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{record.respondents}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{record.incidentType}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{record.incidentDate}</td>

                    {(canEditBlotter || canDeleteBlotter) && (
                      <td className="px-5 py-4 text-center">
                        <div className="relative inline-block text-left action-dropdown">
                          <button type="button" onClick={(e) => { e.stopPropagation(); toggleActionMenu(record.id); }} className={`p-2 rounded-lg transition ${openActionMenu === record.id ? "bg-gray-100 text-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>
                            <FaEllipsisV />
                          </button>
                          {openActionMenu === record.id && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-left" onClick={(e) => e.stopPropagation()}>
                              <button type="button" onClick={() => handleViewDetails(record)} className="w-full px-3 py-2.5 flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50">
                                <FaEye className="w-3.5 text-gray-500" /><span>View Details</span>
                              </button>

                              {canEditBlotter && (
                                <button type="button" onClick={() => handleEditRecord(record)} className="w-full px-3 py-2.5 flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50">
                                  <FaEdit className="w-3.5 text-gray-500" /><span>Edit</span>
                                </button>
                              )}

                              {canEditBlotter && (
                                <>
                                  <div className="my-1 border-t border-gray-100" />
                                  <button type="button" onClick={() => handleArchiveRecord(record)} className="w-full px-3 py-2.5 flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50">
                                    <FaArchive className="w-3.5 text-gray-500" /><span>Archive</span>
                                  </button>
                                </>
                              )}

                              {canDeleteBlotter && (
                                <button type="button" onClick={() => handleDeleteRecord(record)} className="w-full px-3 py-2.5 flex items-center gap-3 text-sm text-red-600 hover:bg-red-50">
                                  <FaTrashAlt className="w-3.5" /><span>Delete Permanently</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {filteredRecords.length === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredRecords.length)} of {filteredRecords.length} records</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"><FaChevronLeft /></button>
            <span className="px-3 py-2 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"><FaChevronRight /></button>
          </div>
        </div>
      </div>

      {showCreateModal && (canCreateBlotter || (editingRecord && canEditBlotter)) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-xl flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingRecord ? "Edit Blotter Record" : "Create Blotter Record"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingRecord ? `Updating ${editingRecord.recordNumber}` : "Enter the details of the barangay blotter record."}
                </p>
              </div>
              <button type="button" onClick={closeCreateModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><FaTimes /></button>
            </div>

            <div className="px-6 py-5 border-b border-gray-200">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { number: 1, title: "Basic Info" },
                  { number: 2, title: "Complainants" },
                  { number: 3, title: "Parties" },
                  { number: 4, title: "Incident & Resolution" },
                ].map((step) => (
                  <button type="button" key={step.number} onClick={() => { if (step.number <= currentStep) setCurrentStep(step.number); }} className={`flex items-center gap-3 p-3 rounded-lg text-left ${currentStep === step.number ? "bg-emerald-50 text-emerald-700" : step.number < currentStep ? "text-green-600" : "text-gray-400"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === step.number ? "bg-emerald-600 text-white" : step.number < currentStep ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{step.number}</div>
                    <span className="text-sm font-medium">{step.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Basic Information</h3>
                    <p className="text-sm text-gray-500 mt-1">Provide the basic information.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Reported<span className="text-red-500 ml-1">*</span></label>
                      <input type="date" value={dateReported} max={todayStr} onChange={(e) => setDateReported(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Record Status</label>
                      <select value={recordStatus} onChange={(e) => setRecordStatus(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        {statusOptions.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Incident Date & Time</label>
                      <input type="datetime-local" value={incidentDate} max={`${todayStr}T23:59`} onChange={(e) => setIncidentDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2"><FaUsers className="text-emerald-600" /><h3 className="font-bold text-gray-800">Complainants</h3></div>
                      <button type="button" onClick={addComplainant} className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 flex items-center gap-2"><FaPlus /> Add</button>
                    </div>
                    <div className="space-y-4">
                      {complainants.map((person, index) => (
                        <PersonCard
                          key={person.id}
                          person={person}
                          index={index}
                          type="Complainant"
                          onRemove={removeComplainant}
                          canRemove={complainants.length > 1}
                          residentSearches={residentSearches}
                          residentsLoading={residentsLoading}
                          residentsError={residentsError}
                          getResidentSearchResults={getResidentSearchResults}
                          setResidentSearch={setResidentSearch}
                          selectResident={selectResident}
                          clearResidentSelection={clearResidentSelection}
                          toggleManualMode={toggleManualMode}
                          updateManualField={updateManualField}
                          getResidentName={getResidentName}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2"><FaUsers className="text-red-600" /><h3 className="font-bold text-gray-800">Victims</h3></div>
                      <button type="button" onClick={addVictim} className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 flex items-center gap-2"><FaPlus /> Add</button>
                    </div>
                    <div className="space-y-4">
                      {victims.map((person, index) => (
                        <PersonCard
                          key={person.id}
                          person={person}
                          index={index}
                          type="Victim"
                          onRemove={removeVictim}
                          canRemove={victims.length > 1}
                          residentSearches={residentSearches}
                          residentsLoading={residentsLoading}
                          residentsError={residentsError}
                          getResidentSearchResults={getResidentSearchResults}
                          setResidentSearch={setResidentSearch}
                          selectResident={selectResident}
                          clearResidentSelection={clearResidentSelection}
                          toggleManualMode={toggleManualMode}
                          updateManualField={updateManualField}
                          getResidentName={getResidentName}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div><h3 className="text-lg font-bold text-gray-800">Complainants & Victims</h3></div>
                  <div className="space-y-4">
                    {complainants.map((person, index) => (
                      <PersonCard
                        key={person.id}
                        person={person}
                        index={index}
                        type="Complainant"
                        onRemove={removeComplainant}
                        canRemove={complainants.length > 1}
                        residentSearches={residentSearches}
                        residentsLoading={residentsLoading}
                        residentsError={residentsError}
                        getResidentSearchResults={getResidentSearchResults}
                        setResidentSearch={setResidentSearch}
                        selectResident={selectResident}
                        clearResidentSelection={clearResidentSelection}
                        toggleManualMode={toggleManualMode}
                        updateManualField={updateManualField}
                        getResidentName={getResidentName}
                      />
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <div className="space-y-4">
                      {victims.map((person, index) => (
                        <PersonCard
                          key={person.id}
                          person={person}
                          index={index}
                          type="Victim"
                          onRemove={removeVictim}
                          canRemove={victims.length > 1}
                          residentSearches={residentSearches}
                          residentsLoading={residentsLoading}
                          residentsError={residentsError}
                          getResidentSearchResults={getResidentSearchResults}
                          setResidentSearch={setResidentSearch}
                          selectResident={selectResident}
                          clearResidentSelection={clearResidentSelection}
                          toggleManualMode={toggleManualMode}
                          updateManualField={updateManualField}
                          getResidentName={getResidentName}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div><h3 className="text-lg font-bold text-gray-800">Parties Involved</h3></div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h3 className="font-bold text-gray-800">Respondents</h3>
                      <button type="button" onClick={addRespondent} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"><FaPlus /> Add Respondent</button>
                    </div>
                    <div className="space-y-4">
                      {respondents.map((person, index) => (
                        <PersonCard
                          key={person.id}
                          person={person}
                          index={index}
                          type="Respondent"
                          onRemove={removeRespondent}
                          canRemove={respondents.length > 1}
                          residentSearches={residentSearches}
                          residentsLoading={residentsLoading}
                          residentsError={residentsError}
                          getResidentSearchResults={getResidentSearchResults}
                          setResidentSearch={setResidentSearch}
                          selectResident={selectResident}
                          clearResidentSelection={clearResidentSelection}
                          toggleManualMode={toggleManualMode}
                          updateManualField={updateManualField}
                          getResidentName={getResidentName}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-7">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h3 className="font-bold text-gray-800">Witnesses</h3>
                      <button type="button" onClick={addWitness} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"><FaPlus /> Add Witness</button>
                    </div>
                    <div className="space-y-4">
                      {witnesses.map((person, index) => (
                        <PersonCard
                          key={person.id}
                          person={person}
                          index={index}
                          type="Witness"
                          onRemove={removeWitness}
                          canRemove={witnesses.length > 1}
                          residentSearches={residentSearches}
                          residentsLoading={residentsLoading}
                          residentsError={residentsError}
                          getResidentSearchResults={getResidentSearchResults}
                          setResidentSearch={setResidentSearch}
                          selectResident={selectResident}
                          clearResidentSelection={clearResidentSelection}
                          toggleManualMode={toggleManualMode}
                          updateManualField={updateManualField}
                          getResidentName={getResidentName}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-7">
                  <div><h3 className="text-lg font-bold text-gray-800">Incident Details & Resolution</h3></div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type<span className="text-red-500 ml-1">*</span></label>
                      <input type="text" value={incidentType} onChange={(e) => setIncidentType(e.target.value)} placeholder="Example: Physical Injury, Theft..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Incident Location<span className="text-red-500 ml-1">*</span></label>
                      <input type="text" value={incidentLocation} onChange={(e) => setIncidentLocation(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Incident Description<span className="text-red-500 ml-1">*</span></label>
                      <textarea rows="6" value={incidentDescription} onChange={(e) => setIncidentDescription(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Actions Taken</label>
                      <textarea rows="4" value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
                      <textarea rows="4" value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {saveError && <div className="mx-6 mb-3 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{saveError}</div>}

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button type="button" onClick={previousStep} disabled={currentStep === 1} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 flex items-center gap-2 disabled:opacity-40 hover:bg-gray-50"><FaArrowLeft /> Previous</button>
              {currentStep < 4 ? (
                <button type="button" onClick={nextStep} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">Next <FaArrowRight /></button>
              ) : (
                <button type="button" onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-60">
                  <FaCheckCircle /> {saving ? "Saving..." : (editingRecord ? "Update Record" : "Save Record")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {viewModalRecord && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewModalRecord(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-emerald-50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Blotter Record Details</h3>
                <p className="text-xs text-gray-500 mt-0.5">{viewModalRecord.recordNumber}</p>
              </div>
              <button onClick={() => setViewModalRecord(null)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 shadow-sm cursor-pointer">
                <FaTimes size={14} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {viewModalLoading ? (
                <div className="text-center py-8 text-sm text-gray-500">Loading details...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Record Number</p>
                      <p className="font-semibold text-gray-800">{viewModalRecord.recordNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date Reported</p>
                      <p className="font-semibold text-gray-800">{viewModalRecord.dateReported}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusClass(viewModalRecord.status)}`}>
                        {getStatusIcon(viewModalRecord.status)}{viewModalRecord.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Incident Type</p>
                      <p className="font-semibold text-gray-800">{viewModalRecord.incidentType || viewModalRecord.incident_type || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Incident Date</p>
                      <p className="font-semibold text-gray-800">{viewModalRecord.incidentDate || viewModalRecord.incident_date || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Incident Time</p>
                      <p className="font-semibold text-gray-800">{viewModalRecord.incidentTime || viewModalRecord.incident_time || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Incident Location</p>
                      <p className="font-semibold text-gray-800">{viewModalRecord.incidentLocation || viewModalRecord.incident_location || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Incident Description</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{viewModalRecord.incidentDescription || viewModalRecord.incident_description || "—"}</p>
                    </div>
                    {viewModalRecord.actionTaken || viewModalRecord.action_taken ? (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Actions Taken</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{viewModalRecord.actionTaken || viewModalRecord.action_taken}</p>
                      </div>
                    ) : null}
                    {viewModalRecord.resolution ? (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Resolution</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{viewModalRecord.resolution}</p>
                      </div>
                    ) : null}
                  </div>

                  {viewModalRecord.complainants && Array.isArray(viewModalRecord.complainants) && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Complainants</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {viewModalRecord.complainants.map((p, i) => (
                          <li key={i}>{p.name || p} {p.isManual ? "(Manual)" : ""}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {viewModalRecord.victims && Array.isArray(viewModalRecord.victims) && viewModalRecord.victims.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Victims</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {viewModalRecord.victims.map((p, i) => (
                          <li key={i}>{p.name || p} {p.isManual ? "(Manual)" : ""}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {viewModalRecord.respondents && Array.isArray(viewModalRecord.respondents) && viewModalRecord.respondents.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Respondents</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {viewModalRecord.respondents.map((p, i) => (
                          <li key={i}>{p.name || p} {p.isManual ? "(Manual)" : ""}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {viewModalRecord.witnesses && Array.isArray(viewModalRecord.witnesses) && viewModalRecord.witnesses.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Witnesses</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {viewModalRecord.witnesses.map((p, i) => (
                          <li key={i}>{p.name || p} {p.isManual ? "(Manual)" : ""}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setViewModalRecord(null)} className="px-4 py-2 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-100 text-sm cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalRecord && canDeleteBlotter && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeleteModalRecord(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <FaTrashAlt />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Delete Blotter Record?</h3>
                  <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  You are about to permanently delete <span className="font-bold">{deleteModalRecord.recordNumber}</span>. All associated data will be removed.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setDeleteModalRecord(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm cursor-pointer">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm cursor-pointer">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlotterRecords;