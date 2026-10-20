// src/admin/CertificateIssuance.jsx
// ✅ IMBAKAN / ARCHIVE — View ONLY (walang Print)
import React, { useEffect, useMemo, useState } from "react";
import {
  FaFileAlt, FaSearch, FaTimes, FaSpinner,
  FaExclamationTriangle, FaInfoCircle, FaSyncAlt,
  FaEye, FaCheckCircle, FaFilter, FaArchive,
  FaUser, FaCalendarAlt, FaMoneyBillWave,
} from "react-icons/fa";
import { api } from "../api/client";
import { usePermission } from "../hooks/usePermission";

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

const getStatusClass = (status) => {
  switch (status) {
    case "Released": return "bg-blue-100 text-blue-700";
    case "Approved": return "bg-emerald-100 text-emerald-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const getStatusIcon = () => <FaCheckCircle size={10} />;

export default function CertificateIssuance() {
  const { canView } = usePermission();
  const hasAccess = canView("certificateIssuance", "certificates");

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [certTypeFilter, setCertTypeFilter] = useState("All");

  const [viewCert, setViewCert] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message, title = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchCertificates = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const res = await api.getRequests();
      if (res.success) {
        const issued = (res.data || []).filter((r) => r.status === "Approved" || r.status === "Released");
        setCertificates(issued);
      } else {
        showToast("error", res.message || "Failed to load certificates.", "Load Failed");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load certificates.", "Connection Error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (hasAccess) fetchCertificates(); }, [hasAccess]);

  const certTypes = useMemo(() => {
    const unique = new Set(certificates.map((c) => c.certificate_name || c.certificate_type).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [certificates]);

  const filtered = useMemo(() => {
    return certificates.filter((c) => {
      const k = search.toLowerCase();
      const certName = c.certificate_name || c.certificate_type || "";
      const matchSearch = !search ||
        String(c.reference_no || "").toLowerCase().includes(k) ||
        String(c.resident_name || "").toLowerCase().includes(k) ||
        String(certName).toLowerCase().includes(k) ||
        String(c.purpose || "").toLowerCase().includes(k);
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      const matchCert = certTypeFilter === "All" || certName === certTypeFilter;
      return matchSearch && matchStatus && matchCert;
    });
  }, [certificates, search, statusFilter, certTypeFilter]);

  const stats = useMemo(() => ({
    total: certificates.length,
    approved: certificates.filter((c) => c.status === "Approved").length,
    released: certificates.filter((c) => c.status === "Released").length,
  }), [certificates]);

  if (!hasAccess) {
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
        {toasts.map((t) => <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />)}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><FaArchive size={20} /></div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Certificate Issuance</h1>
            <p className="text-gray-500 text-sm mt-0.5">Imbakan ng lahat ng Approved at Released certificates.</p>
          </div>
        </div>
        <button onClick={() => fetchCertificates(true)} disabled={refreshing} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium disabled:opacity-50 shadow-sm">
          <FaSyncAlt className={refreshing ? "animate-spin" : ""} size={12} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Issued" value={stats.total} color="blue" Icon={FaFileAlt} />
        <StatCard label="Approved" value={stats.approved} color="emerald" Icon={FaCheckCircle} />
        <StatCard label="Released" value={stats.released} color="indigo" Icon={FaCheckCircle} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reference #, resident, certificate, purpose..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={11} />
            <select value={certTypeFilter} onChange={(e) => setCertTypeFilter(e.target.value)} className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer min-w-[200px]">
              {certTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {["All", "Approved", "Released"].map((s) => {
            const count = s === "All" ? certificates.length : certificates.filter((c) => c.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${statusFilter === s ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {s} <span className="opacity-75 ml-1">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400"><FaSpinner className="animate-spin inline mr-2" /> Loading certificates...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FaArchive className="mx-auto text-gray-300 text-4xl mb-3" />
            <p className="text-gray-500 text-sm font-medium">Walang certificates na naka-imbak.</p>
            <p className="text-gray-400 text-xs mt-1">Ang mga approved at released certificates ay lalabas dito.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reference #</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Certificate</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Resident</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Purpose</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-xs text-gray-700 font-semibold">{cert.reference_no}</td>
                    <td className="px-5 py-4 text-sm text-gray-800 font-medium">{cert.certificate_name || cert.certificate_type}</td>
                    <td className="px-5 py-4 text-sm text-gray-800">{cert.resident_name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate" title={cert.purpose}>{cert.purpose}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {cert.created_at ? new Date(cert.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusClass(cert.status)}`}>
                        {getStatusIcon(cert.status)}{cert.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* ✅ VIEW ONLY */}
                        <button onClick={() => setViewCert(cert)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center" title="View Details">
                          <FaEye size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            Showing <strong className="text-gray-700">{filtered.length}</strong> of <strong className="text-gray-700">{certificates.length}</strong> issued certificates
          </div>
        )}
      </div>

      {viewCert && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewCert(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-emerald-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center"><FaFileAlt size={16} /></div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Certificate Details</h3>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">{viewCert.reference_no}</p>
                </div>
              </div>
              <button onClick={() => setViewCert(null)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 shadow-sm"><FaTimes size={14} /></button>
            </div>

            <div className="p-6 space-y-4">
              <Field label="Certificate" value={viewCert.certificate_name || viewCert.certificate_type} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Resident" value={viewCert.resident_name} icon={<FaUser size={11} />} />
                <Field label="Date Issued" value={viewCert.created_at ? new Date(viewCert.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "—"} icon={<FaCalendarAlt size={11} />} />
              </div>
              <Field label="Purpose" value={viewCert.purpose} multiline />
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <Field label="Amount" value={`₱${Number(viewCert.certificate_fee || viewCert.amount || 0).toFixed(2)}`} icon={<FaMoneyBillWave size={11} />} />
                <Field label="Payment Status" value={viewCert.payment_status || "Unpaid"} />
              </div>
              {viewCert.or_number && <Field label="OR Number" value={viewCert.or_number} />}
              {viewCert.remarks && <Field label="Remarks" value={viewCert.remarks} multiline />}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1.5">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold ${getStatusClass(viewCert.status)}`}>
                  {getStatusIcon(viewCert.status)}{viewCert.status}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button onClick={() => setViewCert(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const StatCard = ({ label, value, color, Icon }) => {
  const colorMap = { blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600", indigo: "bg-indigo-50 text-indigo-600" };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.blue}`}><Icon size={18} /></div>
    </div>
  );
};

const Field = ({ label, value, icon, multiline }) => (
  <div>
    <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1.5">
      {icon && <span>{icon}</span>}
      {label}
    </p>
    <p className={`font-medium text-gray-800 ${multiline ? "leading-relaxed" : ""}`}>{value || "—"}</p>
  </div>
);