// src/admin/Reports.jsx
import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaRedo,
  FaPrint,
  FaSpinner,
  FaExclamationTriangle,
  FaUsers,
  FaUserCheck,
  FaWheelchair,
  FaUserClock,
  FaTimes,
  FaFileAlt,
  FaClipboardList,
  FaHome,
  FaSyringe,
  FaBriefcase,
  FaIdCard,
  FaHeartbeat,
  FaHandHoldingHeart,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaBoxOpen,
  FaClipboardCheck,
  FaHourglassHalf,
} from "react-icons/fa";
import { api } from "../api/client";
import { usePermission } from "../hooks/usePermission";

// =====================================================
// FILTER OPTIONS
// =====================================================
const VOTER_OPTIONS = ["All", "Yes", "No"];
const STATUS_OPTIONS = ["All", "Active", "Inactive"];
const PWD_OPTIONS = ["All", "Yes", "No"];
const SINGLE_PARENT_OPTIONS = ["All", "Yes", "No"];
const SENIOR_OPTIONS = ["All", "Yes", "No"];

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

const getFullName = (r) => {
  return [
    r.first_name,
    r.middle_name ? r.middle_name.charAt(0) + "." : "",
    r.last_name,
    r.suffix || "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
};

// =====================================================
// ICON MAP PARA SA DOCUMENT TYPE
// =====================================================
const getDocumentIcon = (name) => {
  const n = String(name || "").toLowerCase();
  if (n.includes("clearance")) return <FaFileAlt />;
  if (n.includes("residency")) return <FaHome />;
  if (n.includes("indigency")) return <FaHandHoldingHeart />;
  if (n.includes("business")) return <FaBriefcase />;
  if (n.includes("id")) return <FaIdCard />;
  if (n.includes("health")) return <FaHeartbeat />;
  if (n.includes("social")) return <FaSyringe />;
  return <FaFileAlt />;
};

// =====================================================
// ICON MAP PARA SA STATUS
// =====================================================
const getStatusIcon = (status) => {
  switch (status) {
    case "Pending":
      return { icon: <FaClock />, color: "bg-amber-500", bgColor: "bg-amber-100", textColor: "text-amber-700" };
    case "Processing":
      return { icon: <FaHourglassHalf />, color: "bg-blue-500", bgColor: "bg-blue-100", textColor: "text-blue-700" };
    case "Approved":
      return { icon: <FaCheckCircle />, color: "bg-emerald-500", bgColor: "bg-emerald-100", textColor: "text-emerald-700" };
    case "Ready for Pickup":
      return { icon: <FaBoxOpen />, color: "bg-purple-500", bgColor: "bg-purple-100", textColor: "text-purple-700" };
    case "Completed":
      return { icon: <FaClipboardCheck />, color: "bg-teal-500", bgColor: "bg-teal-100", textColor: "text-teal-700" };
    case "Rejected":
      return { icon: <FaBan />, color: "bg-red-500", bgColor: "bg-red-100", textColor: "text-red-700" };
    default:
      return { icon: <FaClock />, color: "bg-gray-500", bgColor: "bg-gray-100", textColor: "text-gray-700" };
  }
};

// =====================================================
// MAIN
// =====================================================
export default function Reports() {
  const { canView } = usePermission();
  const hasAccess = canView("reportsModule", "reports");

  const [residents, setResidents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [voterFilter, setVoterFilter] = useState("All");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pwdFilter, setPwdFilter] = useState("All");
  const [singleParentFilter, setSingleParentFilter] = useState("All");
  const [seniorFilter, setSeniorFilter] = useState("All");

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    voterFilter: "All",
    ageMin: "",
    ageMax: "",
    statusFilter: "All",
    pwdFilter: "All",
    singleParentFilter: "All",
    seniorFilter: "All",
  });

  // =====================================================
  // FETCH RESIDENTS + REQUESTS
  // =====================================================
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [resRes, reqRes] = await Promise.all([
        api.getResidents(),
        api.getRequests(),
      ]);

      if (resRes.success) setResidents(resRes.data || []);
      else setError(resRes.message || "Failed to load residents.");

      if (reqRes.success) setRequests(reqRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // APPLY FILTERS
  // =====================================================
  const handleApplyFilters = () => {
    setAppliedFilters({
      search: search.trim().toLowerCase(),
      voterFilter,
      ageMin,
      ageMax,
      statusFilter,
      pwdFilter,
      singleParentFilter,
      seniorFilter,
    });
  };

  const handleReset = () => {
    setSearch("");
    setVoterFilter("All");
    setAgeMin("");
    setAgeMax("");
    setStatusFilter("All");
    setPwdFilter("All");
    setSingleParentFilter("All");
    setSeniorFilter("All");
    setAppliedFilters({
      search: "",
      voterFilter: "All",
      ageMin: "",
      ageMax: "",
      statusFilter: "All",
      pwdFilter: "All",
      singleParentFilter: "All",
      seniorFilter: "All",
    });
  };

  // =====================================================
  // FILTERED RESIDENTS
  // =====================================================
  const filteredResidents = residents.filter((r) => {
    const fullName = getFullName(r).toLowerCase();
    const matchSearch =
      !appliedFilters.search ||
      fullName.includes(appliedFilters.search) ||
      String(r.resident_id || "").toLowerCase().includes(appliedFilters.search);

    const matchVoter =
      appliedFilters.voterFilter === "All" ||
      String(r.voter_status || "").trim().toLowerCase() ===
        appliedFilters.voterFilter.toLowerCase();

    const matchStatus =
      appliedFilters.statusFilter === "All" ||
      String(r.status || "").trim().toLowerCase() ===
        appliedFilters.statusFilter.toLowerCase();

    const isPwd = Number(r.is_pwd) === 1;
    const matchPwd =
      appliedFilters.pwdFilter === "All" ||
      (appliedFilters.pwdFilter === "Yes" && isPwd) ||
      (appliedFilters.pwdFilter === "No" && !isPwd);

    const isSingleParent = Number(r.is_single_parent) === 1;
    const matchSingleParent =
      appliedFilters.singleParentFilter === "All" ||
      (appliedFilters.singleParentFilter === "Yes" && isSingleParent) ||
      (appliedFilters.singleParentFilter === "No" && !isSingleParent);

    const age = computeAge(r.date_of_birth);
    const isSenior = typeof age === "number" && age >= 60;
    const matchSenior =
      appliedFilters.seniorFilter === "All" ||
      (appliedFilters.seniorFilter === "Yes" && isSenior) ||
      (appliedFilters.seniorFilter === "No" && !isSenior);

    let matchAge = true;
    if (appliedFilters.ageMin !== "" || appliedFilters.ageMax !== "") {
      if (typeof age !== "number") matchAge = false;
      else {
        if (appliedFilters.ageMin !== "" && age < Number(appliedFilters.ageMin)) matchAge = false;
        if (appliedFilters.ageMax !== "" && age > Number(appliedFilters.ageMax)) matchAge = false;
      }
    }

    return matchSearch && matchVoter && matchStatus && matchPwd && matchSingleParent && matchSenior && matchAge;
  });

  // =====================================================
  // STATS PARA SA REQUESTS
  // =====================================================
  const requestsByType = (() => {
    const typeCounts = {};
    requests.forEach((r) => {
      const type = r.certificate_name || r.certificate_type || "Unknown";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    return Object.entries(typeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  })();

  const requestsByStatus = (() => {
    const statusOrder = ["Pending", "Processing", "Approved", "Ready for Pickup", "Completed", "Rejected"];
    const statusCounts = {};
    statusOrder.forEach((s) => (statusCounts[s] = 0));
    requests.forEach((r) => {
      const status = r.status || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return statusOrder
      .filter((s) => statusCounts[s] > 0)
      .map((status) => ({ status, count: statusCounts[status] }));
  })();

  const maxTypeCount = Math.max(...requestsByType.map((r) => r.count), 1);
  const maxStatusCount = Math.max(...requestsByStatus.map((r) => r.count), 1);

  // =====================================================
  // PRINT
  // =====================================================
  const handlePrintClick = () => {
    if (filteredResidents.length === 0) return;
    setShowPrintPreview(true);
  };

  const handleConfirmPrint = () => {
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // ACCESS DENIED
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
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print { display: none !important; }
          #print-header { display: block !important; }
          #print-area table { font-size: 11px; }
          #print-area thead th {
            background-color: #047857 !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #print-area tbody td { padding: 6px 8px; }
        }
        @media screen {
          #print-header { display: none; }
        }
      `}</style>

      <div className="p-6 bg-gray-50 min-h-screen">

        {/* ============================================ */}
        {/* SECTION 1: REPORTS TITLE */}
        {/* ============================================ */}
        <div className="mb-6 no-print">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Reports
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate filtered reports for barangay residents.
          </p>
        </div>

        {/* PRINT HEADER */}
        <div id="print-header" className="mb-4 text-center">
          <h1 className="text-xl font-bold">Barangay Central Bicutan</h1>
          <p className="text-sm">Resident Report</p>
          <p className="text-xs text-gray-600 mt-1">
            Generated: {new Date().toLocaleString("en-PH")}
          </p>
          <hr className="my-3" />
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 no-print">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Filters
            </h2>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute top-3 left-3 text-gray-400" size={13} />
              <input
                type="text"
                placeholder="Search by name or resident ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FilterSelect label="Voters" value={voterFilter} onChange={setVoterFilter} options={VOTER_OPTIONS} />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Age Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                  min="0"
                  max="150"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  min="0"
                  max="150"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
            <FilterSelect label="PWD" value={pwdFilter} onChange={setPwdFilter} options={PWD_OPTIONS} />
            <FilterSelect label="Single Parent" value={singleParentFilter} onChange={setSingleParentFilter} options={SINGLE_PARENT_OPTIONS} />
            <FilterSelect label="Senior" value={seniorFilter} onChange={setSeniorFilter} options={SENIOR_OPTIONS} />
          </div>

          <div className="flex items-center gap-3 mt-5 justify-center">
            <button
              onClick={handleApplyFilters}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer text-sm"
            >
              <FaFilter size={12} /> FILTER
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer text-sm"
            >
              <FaRedo size={12} /> RESET
            </button>
          </div>
        </div>

        {/* PRINT BUTTON */}
        <div className="mb-4 no-print">
          <button
            onClick={handlePrintClick}
            disabled={filteredResidents.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPrint size={12} /> PRINT ({filteredResidents.length})
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 no-print">
          <SummaryCard label="Total Results" value={filteredResidents.length} icon={<FaUsers />} color="bg-blue-500" />
          <SummaryCard
            label="Voters"
            value={filteredResidents.filter((r) => String(r.voter_status || "").toLowerCase() === "yes").length}
            icon={<FaUserCheck />}
            color="bg-emerald-500"
          />
          <SummaryCard
            label="PWD"
            value={filteredResidents.filter((r) => Number(r.is_pwd) === 1).length}
            icon={<FaWheelchair />}
            color="bg-purple-500"
          />
          <SummaryCard
            label="Seniors"
            value={filteredResidents.filter((r) => {
              const age = computeAge(r.date_of_birth);
              return typeof age === "number" && age >= 60;
            }).length}
            icon={<FaUserClock />}
            color="bg-amber-500"
          />
        </div>

        {/* TABLE */}
        <div id="print-area" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <FaSpinner className="animate-spin inline mr-2" size={16} />
              Loading residents...
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">
              <FaExclamationTriangle className="inline mr-2" />
              {error}
            </div>
          ) : filteredResidents.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FaUsers size={40} className="inline opacity-30 mb-2" />
              <p>No residents match the filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-emerald-700 text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-semibold">#</th>
                    <th className="p-3 font-semibold">Name</th>
                    <th className="p-3 font-semibold text-center">Age</th>
                    <th className="p-3 font-semibold">PWD</th>
                    <th className="p-3 font-semibold text-center">Single Parent</th>
                    <th className="p-3 font-semibold text-center">Voter</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-center">Senior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {filteredResidents.map((r, idx) => {
                    const age = computeAge(r.date_of_birth);
                    const isSenior = typeof age === "number" && age >= 60;
                    const isPwd = Number(r.is_pwd) === 1;
                    const isSingleParent = Number(r.is_single_parent) === 1;
                    const isVoter = String(r.voter_status || "").trim().toLowerCase() === "yes";

                    return (
                      <tr key={r.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="p-3 text-xs text-gray-400">{idx + 1}</td>
                        <td className="p-3 font-medium text-gray-900">{getFullName(r)}</td>
                        <td className="p-3 text-center font-semibold text-gray-800">{age}</td>
                        <td className="p-3">
                          {isPwd ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-bold uppercase">
                                <FaWheelchair size={9} /> PWD
                              </span>
                              {r.disability_type && (
                                <span className="text-xs text-gray-500 italic">{r.disability_type}</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isSingleParent ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-pink-100 text-pink-700 text-[10px] font-bold uppercase">YES</span>
                          ) : (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-bold uppercase">NO</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isVoter ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">YES</span>
                          ) : (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-bold uppercase">NO</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            r.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                            {String(r.status || "Unknown").toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {isSenior ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">YES</span>
                          ) : (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-bold uppercase">NO</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
              Showing <strong className="text-gray-700">{filteredResidents.length}</strong> of{" "}
              <strong className="text-gray-700">{residents.length}</strong> residents
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 2: 2 HORIZONTAL BAR CHARTS — SA BABA */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">

          {/* ===== CHART 1: Requests by Document Type (GREEN THEME) ===== */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start gap-3 mb-5 pb-4 border-b border-gray-100">
              {/* ✅ GREEN header icon */}
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <FaClipboardList size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  Requests by Document Type
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Total: {requests.length} request{requests.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-400">
                <FaSpinner className="animate-spin inline mr-2" /> Loading...
              </div>
            ) : requestsByType.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No document requests found.
              </div>
            ) : (
              <div className="space-y-4">
                {requestsByType.map((item, idx) => {
                  const percentage = (item.count / maxTypeCount) * 100;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      {/* ✅ GREEN document icon */}
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                        {getDocumentIcon(item.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-gray-800 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          {/* ✅ GREEN bar */}
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      {/* ✅ GREEN count badge */}
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {item.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===== CHART 2: Requests by Status (GREEN HEADER + multi-color bars) ===== */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start gap-3 mb-5 pb-4 border-b border-gray-100">
              {/* ✅ GREEN header icon */}
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <FaClipboardList size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  Requests by Status
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Total: {requests.length} request{requests.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-400">
                <FaSpinner className="animate-spin inline mr-2" /> Loading...
              </div>
            ) : requestsByStatus.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No status data available.
              </div>
            ) : (
              <div className="space-y-4">
                {requestsByStatus.map((item, idx) => {
                  const percentage = (item.count / maxStatusCount) * 100;
                  const cfg = getStatusIcon(item.status);

                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${cfg.bgColor} ${cfg.textColor} flex items-center justify-center shrink-0`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-gray-800">
                            {item.status}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${cfg.color} rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full ${cfg.color} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                        {item.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINT PREVIEW MODAL */}
      {showPrintPreview && (
        <div
          className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 no-print"
          onClick={() => setShowPrintPreview(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-emerald-50">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FaPrint className="text-emerald-600" />
                  Print Preview
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {filteredResidents.length} resident{filteredResidents.length !== 1 ? "s" : ""} will be printed
                </p>
              </div>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 shadow-sm cursor-pointer"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
                <div className="text-center mb-4">
                  <h1 className="text-xl font-bold">Barangay Central Bicutan</h1>
                  <p className="text-sm">Resident Report</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Generated: {new Date().toLocaleString("en-PH")}
                  </p>
                  <hr className="my-3" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-emerald-700 text-white">
                      <tr>
                        <th className="p-2 font-semibold">#</th>
                        <th className="p-2 font-semibold">Name</th>
                        <th className="p-2 font-semibold text-center">Age</th>
                        <th className="p-2 font-semibold">PWD</th>
                        <th className="p-2 font-semibold text-center">Single Parent</th>
                        <th className="p-2 font-semibold text-center">Voter</th>
                        <th className="p-2 font-semibold">Status</th>
                        <th className="p-2 font-semibold text-center">Senior</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {filteredResidents.map((r, idx) => {
                        const age = computeAge(r.date_of_birth);
                        const isSenior = typeof age === "number" && age >= 60;
                        const isPwd = Number(r.is_pwd) === 1;
                        const isSingleParent = Number(r.is_single_parent) === 1;
                        const isVoter = String(r.voter_status || "").trim().toLowerCase() === "yes";

                        return (
                          <tr key={r.id}>
                            <td className="p-2 text-gray-400">{idx + 1}</td>
                            <td className="p-2 font-medium">{getFullName(r)}</td>
                            <td className="p-2 text-center">{age}</td>
                            <td className="p-2">{isPwd ? r.disability_type || "Yes" : "—"}</td>
                            <td className="p-2 text-center">{isSingleParent ? "YES" : "NO"}</td>
                            <td className="p-2 text-center">{isVoter ? "YES" : "NO"}</td>
                            <td className="p-2">{String(r.status || "").toUpperCase()}</td>
                            <td className="p-2 text-center">{isSenior ? "YES" : "NO"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 pt-4 border-t text-xs text-gray-500 text-center">
                  <p>Total: {filteredResidents.length} residents</p>
                  <p className="mt-1 italic">
                    This is a system-generated report from Barangay Central Bicutan.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-100 text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPrint}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-md"
              >
                <FaPrint size={12} /> Confirm Print
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// =====================================================
// COMPONENTS
// =====================================================
const FilterSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt === "All" ? `-- Select ${label} --` : opt}
        </option>
      ))}
    </select>
  </div>
);

const SummaryCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
    <div>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
    </div>
    <div className={`${color} text-white p-2.5 rounded-full`}>{icon}</div>
  </div>
);