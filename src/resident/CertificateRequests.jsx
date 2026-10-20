// src/resident/CertificateRequests.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaPlus, FaSearch, FaEye, FaTimes, FaSpinner,
  FaCheckCircle, FaExclamationTriangle, FaClock, FaBan,
  FaFileAlt, FaFilter, FaPrint, FaTrash,
  FaBoxOpen, FaClipboardCheck,
} from "react-icons/fa";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

// =====================================================
// TOAST
// =====================================================
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", text: "text-emerald-800", Icon: FaCheckCircle },
    error: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", text: "text-red-800", Icon: FaExclamationTriangle },
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
// STATUS CONFIG
// ✅ Ready for Pickup = VIOLET
// ✅ Completed = TEAL
// =====================================================
const getStatusConfig = (status) => {
  switch (status) {
    case "Approved":
      return { class: "bg-emerald-100 text-emerald-700", Icon: FaCheckCircle };
    case "Ready for Pickup":
      return { class: "bg-purple-100 text-purple-700", Icon: FaBoxOpen };   // ✅ VIOLET
    case "Completed":
      return { class: "bg-teal-100 text-teal-700", Icon: FaClipboardCheck };
    case "Rejected":
      return { class: "bg-red-100 text-red-700", Icon: FaBan };
    case "Processing":
      return { class: "bg-blue-100 text-blue-700", Icon: FaSpinner };
    case "Pending":
    default:
      return { class: "bg-yellow-100 text-yellow-700", Icon: FaClock };
  }
};

// =====================================================
// MAIN
// =====================================================
export default function CertificateRequests() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [certificateTypes, setCertificateTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [formError, setFormError] = useState("");

  const [viewRequest, setViewRequest] = useState(null);

  const [cancelRequest, setCancelRequest] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [toasts, setToasts] = useState([]);

  const showToast = (type, message, title = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // =====================================================
  // FETCH DATA
  // =====================================================
  const fetchData = async () => {
    try {
      setLoading(true);
      const residentId = user?.id;

      const [certRes, reqRes] = await Promise.all([
        api.getCertificateTypes(),
        api.getMyServiceRequests(residentId),
      ]);
      if (certRes.success) setCertificateTypes(certRes.data || []);
      if (reqRes.success) setRequests(reqRes.data || []);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load data.", "Connection Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const openCreateModal = () => {
    setSelectedCert(null);
    setPurpose("");
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCert(null);
    setPurpose("");
    setFormError("");
  };

  // =====================================================
  // SUBMIT REQUEST
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!selectedCert) return setFormError("Please select a certificate.");
    if (!purpose.trim()) return setFormError("Purpose is required.");

    const fullName = [
      user?.firstName,
      user?.middleName,
      user?.lastName,
      user?.suffix,
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!fullName) {
      return setFormError("Resident name is missing. Please contact admin.");
    }

    const fullAddress =
      [
        user?.houseNumber,
        user?.street,
        user?.purok,
        user?.barangay,
        user?.city,
        user?.province,
      ]
        .filter(Boolean)
        .join(", ") || "Barangay Central Bicutan";

    setSubmitting(true);
    try {
      const payload = {
        certificate_type_id: selectedCert.id,
        resident_id: user?.id || null,
        resident_name: fullName,
        resident_address: fullAddress,
        purpose: purpose.trim(),
      };

      const res = await api.createServiceRequest(payload);
      if (!res.success) throw new Error(res.message || "Failed to submit request.");

      showToast(
        "success",
        `Reference #: ${res.data.reference_no} — Pending approval.`,
        "Request Submitted"
      );
      closeModal();
      await fetchData();
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // CANCEL REQUEST
  // =====================================================
  const handleCancelClick = (request) => {
    setCancelRequest(request);
  };

  const confirmCancel = async () => {
    if (!cancelRequest) return;
    setCancelling(true);

    try {
      const res = await api.deleteRequest(cancelRequest.id);
      if (!res.success) throw new Error(res.message || "Failed to cancel request.");

      showToast(
        "success",
        `Request ${cancelRequest.reference_no} cancelled.`,
        "Request Cancelled"
      );
      setCancelRequest(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to cancel request.", "Error");
    } finally {
      setCancelling(false);
    }
  };

  // =====================================================
  // STATS
  // =====================================================
  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === "Pending").length,
    approved: requests.filter((r) => r.status === "Approved").length,
    completed: requests.filter((r) => r.status === "Completed").length,
  }), [requests]);

  // =====================================================
  // FILTER
  // =====================================================
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const k = search.toLowerCase();
      const matchSearch =
        !search ||
        String(r.reference_no || "").toLowerCase().includes(k) ||
        String(r.certificate_name || "").toLowerCase().includes(k) ||
        String(r.purpose || "").toLowerCase().includes(k);
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  // =====================================================
  // PRINT — pwede lang kapag "Completed"
  // =====================================================
  const handlePrint = (request) => {
    if (request.status !== "Completed") {
      showToast(
        "error",
        "Hindi pa pwedeng i-print. Hintayin munang maging Completed ang request.",
        "Hindi Pa Pwede I-print"
      );
      return;
    }
    window.open(`/print/certificate/${request.id}`, "_blank");
  };

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="fixed top-6 right-6 z-[100] space-y-3">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Certificate Requests
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Request certificates and track their status.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <FaPlus size={12} /> Create Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={stats.total} color="blue" />
        <StatCard label="Pending" value={stats.pending} color="yellow" />
        <StatCard label="Approved" value={stats.approved} color="emerald" />
        <StatCard label="Completed" value={stats.completed} color="teal" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference no. or certificate..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={11} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer min-w-[150px]"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Approved</option>
            <option>Ready for Pickup</option>
            <option>Completed</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">My Requests</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {filtered.length} request{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <FaSpinner className="animate-spin inline mr-2" /> Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FaFileAlt className="mx-auto text-gray-300 text-4xl mb-3" />
            <p className="text-gray-500 text-sm">Wala pang requests.</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Create your first request
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((req) => {
              const { class: statusClass, Icon: StatusIcon } = getStatusConfig(req.status);
              const canCancel = req.status === "Pending";
              const canPrint = req.status === "Completed";

              return (
                <div key={req.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FaFileAlt size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-800">
                          {req.certificate_name || "Certificate"}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusClass}`}>
                          <StatusIcon size={9} />
                          {req.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mt-2">
                        <div>
                          <p className="text-gray-400">Reference No.</p>
                          <p className="font-mono font-semibold text-blue-700">
                            {req.reference_no}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Date Requested</p>
                          <p className="font-semibold text-gray-700">
                            {req.created_at
                              ? new Date(req.created_at).toLocaleDateString("en-PH", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Amount</p>
                          <p className="font-semibold text-gray-700">
                            ₱{Number(req.certificate_fee || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {req.purpose && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                          <span className="text-gray-400">Purpose:</span> {req.purpose}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setViewRequest(req)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-medium"
                      >
                        <FaEye size={11} /> View
                      </button>

                      {canPrint && (
                        <button
                          onClick={() => handlePrint(req)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-xs font-medium"
                        >
                          <FaPrint size={11} /> Print
                        </button>
                      )}

                      {canCancel && (
                        <button
                          onClick={() => handleCancelClick(req)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-medium"
                          title="Cancel Request"
                        >
                          <FaTrash size={11} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE REQUEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Create Request</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a certificate and provide your purpose.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Certificate <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCert?.id || ""}
                  onChange={(e) => {
                    const cert = certificateTypes.find(
                      (c) => String(c.id) === e.target.value
                    );
                    setSelectedCert(cert || null);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a certificate</option>
                  {certificateTypes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{" "}
                      {Number(c.fee) > 0 ? `— ₱${Number(c.fee).toFixed(2)}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="4"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Enter the purpose of your request..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {formError}
                </div>
              )}
            </form>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-100 text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-60 shadow-md"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" size={12} /> Submitting...
                  </>
                ) : (
                  <>Submit Request</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewRequest && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewRequest(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-blue-50 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Request Details</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  {viewRequest.reference_no}
                </p>
              </div>
              <button
                onClick={() => setViewRequest(null)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 shadow-sm"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="p-6 space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Certificate</p>
                <p className="font-semibold text-gray-800">
                  {viewRequest.certificate_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Purpose</p>
                <p className="text-gray-800">{viewRequest.purpose}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Status</p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    getStatusConfig(viewRequest.status).class
                  }`}
                >
                  {React.createElement(getStatusConfig(viewRequest.status).Icon, {
                    size: 9,
                  })}
                  {viewRequest.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date Requested</p>
                  <p className="font-semibold text-gray-800">
                    {viewRequest.created_at
                      ? new Date(viewRequest.created_at).toLocaleDateString(
                          "en-PH",
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                  <p className="font-semibold text-gray-800">
                    ₱{Number(viewRequest.certificate_fee || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              {viewRequest.status === "Completed" && (
                <button
                  onClick={() => handlePrint(viewRequest)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm flex items-center gap-2 font-medium"
                >
                  <FaPrint /> Print Certificate
                </button>
              )}
              <button
                onClick={() => setViewRequest(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRM MODAL */}
      {cancelRequest && (
        <div
          className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !cancelling && setCancelRequest(null)}
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
                  <h3 className="text-lg font-bold text-gray-800">
                    Cancel Request?
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-red-800">
                  You are about to cancel the request for{" "}
                  <span className="font-bold">
                    {cancelRequest.certificate_name}
                  </span>
                  .
                </p>
                <div className="text-xs text-red-700 pt-2 border-t border-red-200">
                  <p>
                    <span className="font-semibold">Reference No.:</span>{" "}
                    {cancelRequest.reference_no}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                💡 Pwede ka ulit gumawa ng bagong request kahit kailan.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setCancelRequest(null)}
                disabled={cancelling}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 text-sm"
              >
                Keep Request
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-60 text-sm font-semibold"
              >
                {cancelling ? (
                  <>
                    <FaSpinner className="animate-spin" size={12} /> Cancelling...
                  </>
                ) : (
                  <>
                    <FaTrash size={12} /> Cancel Request
                  </>
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
// STAT CARD
// =====================================================
const StatCard = ({ label, value, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    emerald: "bg-emerald-50 text-emerald-600",
    teal: "bg-teal-50 text-teal-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          colorMap[color] || colorMap.blue
        }`}
      >
        <FaFileAlt size={16} />
      </div>
    </div>
  );
};