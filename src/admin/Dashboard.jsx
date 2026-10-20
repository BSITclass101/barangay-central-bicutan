// src/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaHome,
  FaFileAlt,
  FaClipboardList,
  FaGavel,
  FaExclamationTriangle,
  FaSyncAlt,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaTimesCircle,
  FaVoteYea,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API_URL = "http://localhost/barangay-api/api/dashboard.php";
const RESIDENTS_API_URL = "http://localhost/barangay-api/api/residents.php";
const BLOTTER_API_URL = "http://localhost/barangay-api/api/blotter.php";

const Dashboard = () => {
  const [counts, setCounts] = useState({
    total_residents: 0,
    total_households: 0,
    certificates_issued: 0,
    service_requests: 0,
    blotter_records: 0,
    incident_reports: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [residents, setResidents] = useState([]);
  const [blotterRecords, setBlotterRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===================================================
  // FETCH DASHBOARD DATA
  // ===================================================
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL);
      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load dashboard.");
      }

      setCounts(result.data.counts || {});
      setRecentActivity(result.data.recent_activity || []);
    } catch (err) {
      console.error("DASHBOARD FETCH ERROR:", err);
      setError(err.message || "Unable to load dashboard data.");
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
      if (Array.isArray(result)) list = result;
      else if (result.success && Array.isArray(result.data)) list = result.data;
      else if (Array.isArray(result.data)) list = result.data;

      setResidents(list);
    } catch (err) {
      console.error("RESIDENTS FETCH ERROR:", err);
    }
  };

  // ===================================================
  // FETCH BLOTTER RECORDS
  // ===================================================
  const fetchBlotterRecords = async () => {
    try {
      const res = await fetch(BLOTTER_API_URL);
      const result = await res.json();

      let list = [];
      if (Array.isArray(result)) list = result;
      else if (result.success && Array.isArray(result.data)) list = result.data;
      else if (Array.isArray(result.data)) list = result.data;

      setBlotterRecords(list);
    } catch (err) {
      console.error("BLOTTER FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchResidents();
    fetchBlotterRecords();
  }, []);

  const handleRefresh = () => {
    fetchDashboard();
    fetchResidents();
    fetchBlotterRecords();
  };

  // ===================================================
  // GENDER DATA
  // ===================================================
  const maleCount = residents.filter(
    (r) => String(r.sex || "").trim().toLowerCase() === "male"
  ).length;

  const femaleCount = residents.filter(
    (r) => String(r.sex || "").trim().toLowerCase() === "female"
  ).length;

  const genderData = [
    { name: "Male", value: maleCount, color: "#3B82F6" },
    { name: "Female", value: femaleCount, color: "#EC4899" },
  ].filter((item) => item.value > 0);

  const totalResidents = maleCount + femaleCount;

  // ===================================================
  // VOTERS DATA
  // ===================================================
  const voterCount = residents.filter(
    (r) => String(r.voter_status || "").trim().toLowerCase() === "yes"
  ).length;

  // ===================================================
  // BLOTTER YEARLY DATA
  // ===================================================
  const currentYear = new Date().getFullYear();

  const blotterYearlyData = (() => {
    const yearCounts = {};

    blotterRecords.forEach((record) => {
      const dateStr =
        record.date_reported ||
        record.dateReported ||
        record.created_at ||
        null;
      if (!dateStr) return;

      const year = new Date(dateStr).getFullYear();
      if (Number.isNaN(year)) return;

      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    const years = [];
    for (let i = 4; i >= 0; i--) {
      years.push(currentYear - i);
    }

    return years.map((year) => ({
      year: String(year),
      count: yearCounts[year] || 0,
    }));
  })();

  // ===================================================
  // CARDS — ✅ may bagong Voters card
  // ===================================================
  const cards = [
    {
      title: "Total Residents",
      value: counts.total_residents,
      icon: <FaUsers size={28} />,
      color: "bg-blue-500",
    },
    {
      title: "Community Household",
      value: counts.total_households,
      icon: <FaHome size={28} />,
      color: "bg-green-500",
    },
    {
      title: "Certificates Issued",
      value: counts.certificates_issued,
      icon: <FaFileAlt size={28} />,
      color: "bg-yellow-500",
    },
    {
      title: "Service Requests",
      value: counts.service_requests,
      icon: <FaClipboardList size={28} />,
      color: "bg-purple-500",
    },
    {
      title: "Blotter Records",
      value: counts.blotter_records,
      icon: <FaGavel size={28} />,
      color: "bg-red-500",
    },
    {
      title: "Incident Reports",
      value: counts.incident_reports,
      icon: <FaExclamationTriangle size={28} />,
      color: "bg-orange-500",
    },
    // ✅ BAGONG VOTERS CARD — kagaya ng ibang cards
    {
      title: "Registered Voters",
      value: voterCount,
      icon: <FaVoteYea size={28} />,
      color: "bg-emerald-500",
    },
  ];

  // ===================================================
  // STATUS BADGE
  // ===================================================
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
            <FaClock size={10} /> Pending
          </span>
        );
      case "Processing":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
            <FaSpinner size={10} /> Processing
          </span>
        );
      case "Released":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
            <FaCheckCircle size={10} /> Released
          </span>
        );
      case "Rejected":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
            <FaTimesCircle size={10} /> Rejected
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
            {status || "Unknown"}
          </span>
        );
    }
  };

  // ===================================================
  // FORMAT DATE
  // ===================================================
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm">
          <FaExclamationTriangle />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* MAIN CARDS — kasama na ang Voters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between hover:shadow-lg transition"
          >
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>

              <h2 className="text-3xl font-bold mt-2">
                {loading ? (
                  <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </h2>
            </div>

            <div className={`${card.color} text-white p-4 rounded-full`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ CHARTS ROW — Gender Pie + Blotter Line */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ===== GENDER PIE CHART ===== */}
        <div className="bg-white rounded-xl shadow-md px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                Gender Distribution
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Total: {totalResidents}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-5">
            <div style={{ width: 120, height: 120 }}>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <FaSpinner className="animate-spin" size={14} />
                </div>
              ) : genderData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] text-center">
                  No data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        fontSize: "11px",
                        padding: "6px 10px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-none">
                    Male
                  </p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">
                    {maleCount}
                    <span className="text-[10px] text-gray-400 font-normal ml-1">
                      ({totalResidents > 0 ? ((maleCount / totalResidents) * 100).toFixed(0) : 0}%)
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-none">
                    Female
                  </p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">
                    {femaleCount}
                    <span className="text-[10px] text-gray-400 font-normal ml-1">
                      ({totalResidents > 0 ? ((femaleCount / totalResidents) * 100).toFixed(0) : 0}%)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== BLOTTER YEARLY LINE CHART ===== */}
        <div className="bg-white rounded-xl shadow-md px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                Blotter Records Yearly
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Last 5 years trend
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                This year
              </p>
              <p className="text-lg font-bold text-emerald-600 leading-tight">
                {blotterYearlyData.find(
                  (d) => d.year === String(currentYear)
                )?.count || 0}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
              <FaSpinner className="animate-spin mr-2" /> Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart
                data={blotterYearlyData}
                margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  allowDecimals={false}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "11px",
                    padding: "6px 10px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  }}
                  formatter={(value) => [`${value} records`, "Blotter"]}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{
                    fill: "#10B981",
                    stroke: "#fff",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    fill: "#059669",
                    stroke: "#fff",
                    strokeWidth: 3,
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <span className="text-xs text-gray-400">
            Latest 10 service requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Resident
                </th>
                <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-8 text-center text-gray-400 text-sm"
                  >
                    <FaSpinner className="animate-spin inline mr-2" />
                    Loading recent activity...
                  </td>
                </tr>
              ) : recentActivity.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-8 text-center text-gray-400 text-sm"
                  >
                    No recent activity found.
                  </td>
                </tr>
              ) : (
                recentActivity.map((activity, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {activity.resident_name
                            ? activity.resident_name
                                .charAt(0)
                                .toUpperCase()
                            : "?"}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">
                          {activity.resident_name || "Unknown"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 text-sm text-gray-600">
                      {activity.activity || "-"}
                    </td>

                    <td className="py-3 text-sm text-gray-500">
                      {formatDate(activity.date)}
                    </td>

                    <td className="py-3">
                      {getStatusBadge(activity.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;