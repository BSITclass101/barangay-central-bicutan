// src/admin/ServiceRequests.jsx
import React, { useState, useEffect } from "react";
import {
  FaSearch, FaFilter, FaCheckCircle, FaClock, FaTimesCircle,
  FaSpinner, FaEdit, FaTimes, FaFileAlt, FaFilePdf, FaDownload,
  FaUser, FaMoneyBillWave, FaExclamationTriangle, FaTrash,
  FaInfoCircle, FaEye, FaPrint, FaClipboardCheck, FaBoxOpen,
} from "react-icons/fa";
import { api } from "../api/client";
import RequestPreviewModal from "./components/RequestPreviewModal";
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

const ServiceRequests = () => {
  const { canView, canEdit, canDelete } = usePermission();
  const hasRequestsAccess = canView("serviceRequests", "requests");
  const canProcess = canEdit("serviceRequests", "requests");
  const canDeleteRequest = canDelete("serviceRequests", "requests");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("Unpaid");
  const [adminRemarks, setAdminRemarks] = useState("");

  const [previewData, setPreviewData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message, title = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.getRequests();
      if (res.success) setRequests(res.data || []);
      else showToast("error", res.message || "Failed to load requests.", "Load Failed");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load requests.", "Connection Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasRequestsAccess) fetchRequests();
  }, [hasRequestsAccess]);

  const handlePreview = async (request) => {
    try {
      const res = await fetch(`http://localhost/barangay-api/api/get_request_preview.php?request_id=${request.id}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load preview.");
      setPreviewData(data.data);
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to load preview.", "Preview Error");
    }
  };

  const handlePrint = (request) => {
    if (request.pdf_path) {
      const pdfUrl = `http://localhost/barangay-api/${request.pdf_path.replace(/^\/?/, "")}`;
      window.open(pdfUrl, "_blank");
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      showToast("error", "Please allow pop-ups to print.", "Pop-up Blocked");
      return;
    }

    const issuedDate = request.issued_date || request.created_at || new Date();
    const certName = request.certificate_name || request.certificate_type || "Certificate";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${certName}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 40px; font-family: 'Times New Roman', Times, serif; color: #111827; background: white; }
          .certificate { max-width: 850px; margin: auto; border: 2px solid #111827; padding: 50px; min-height: 700px; }
          .header { text-align: center; margin-bottom: 40px; }
          .header p { margin: 5px 0; font-size: 14px; }
          .header h1 { margin: 18px 0 5px; font-size: 25px; text-transform: uppercase; }
          .header h2 { margin: 0; font-size: 18px; }
          .content { margin-top: 30px; line-height: 1.8; font-size: 16px; text-align: justify; }
          .title { text-align: center; font-weight: bold; font-size: 24px; margin-bottom: 35px; text-transform: uppercase; letter-spacing: 3px; }
          .details { margin-top: 25px; }
          .row { margin-bottom: 12px; }
          .label { font-weight: bold; }
          .footer { margin-top: 70px; display: flex; justify-content: flex-end; }
          .signature { text-align: center; width: 280px; }
          .signature-line { border-top: 1px solid #111827; margin-top: 55px; padding-top: 8px; font-weight: bold; text-transform: uppercase; }
          .certificate-no { margin-top: 35px; font-size: 12px; text-align: center; }
          @media print { body { padding: 0; } @page { size: letter; margin: 0.5in; } }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <p>REPUBLIC OF THE PHILIPPINES</p>
            <p>METRO MANILA</p>
            <p>BARANGAY CENTRAL BICUTAN</p>
            <h1>OFFICE OF THE BARANGAY</h1>
            <h2>BARANGAY CENTRAL BICUTAN</h2>
          </div>

          <div class="title">${certName}</div>

          <div class="content">
            <p><strong>TO WHOM IT MAY CONCERN:</strong></p>
            <p>This is to certify that <strong>${request.resident_name || "________"}</strong>, of legal age, Filipino citizen, and a bona fide resident of Barangay Central Bicutan, is hereby granted this certificate.</p>

            <div class="details">
              <div class="row"><span class="label">Reference No.:</span> ${request.reference_no || "N/A"}</div>
              <div class="row"><span class="label">Purpose:</span> ${request.purpose || "N/A"}</div>
              <div class="row"><span class="label">Date Issued:</span> ${new Date(issuedDate).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</div>
              ${request.or_number ? `<div class="row"><span class="label">OR Number:</span> ${request.or_number}</div>` : ""}
            </div>

            <p style="margin-top: 35px;">This certificate is issued upon the request of the concerned resident for whatever legal purpose it may serve.</p>
          </div>

          <div class="footer">
            <div class="signature">
              <div class="signature-line">AUTHORIZED BARANGAY OFFICIAL</div>
              <div>Barangay Central Bicutan</div>
            </div>
          </div>

          <div class="certificate-no">Reference No.: ${request.reference_no || "N/A"}</div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totalRequests = requests.length;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const processingCount = requests.filter((r) => r.status === "Processing").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const readyForPickupCount = requests.filter((r) => r.status === "Ready for Pickup").length;
  const completedCount = requests.filter((r) => r.status === "Completed").length;

  const filteredRequests = requests.filter((req) => {
    const keyword = search.toLowerCase();
    const matchesSearch =
      String(req.reference_no || "").toLowerCase().includes(keyword) ||
      String(req.resident_name || "").toLowerCase().includes(keyword) ||
      String(req.certificate_name || "").toLowerCase().includes(keyword) ||
      String(req.purpose || "").toLowerCase().includes(keyword);
    const matchesStatus = statusFilter === "All" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status || "Pending");
    setNewPaymentStatus(request.payment_status || "Unpaid");
    setAdminRemarks(request.remarks || "");
    setShowModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.updateRequest(selectedRequest.id, {
        status: newStatus,
        payment_status: newPaymentStatus,
        remarks: adminRemarks,
      });
      if (!res.success) throw new Error(res.message || "Failed to update.");
      showToast("success", `Request ${selectedRequest.reference_no} updated.`, "Request Updated");
      await fetchRequests();
      setTimeout(() => setShowModal(false), 800);
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to update request.", "Update Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsPaid = async (request) => {
    setActionLoading(true);
    try {
      const res = await api.updateRequest(request.id, {
        status: request.status,
        payment_status: "Paid",
        remarks: request.remarks,
      });
      if (!res.success) throw new Error(res.message || "Failed to mark as paid.");
      showToast("success", `${request.reference_no} marked as Paid.`, "Payment Updated");
      await fetchRequests();
      if (selectedRequest && selectedRequest.id === request.id) {
        setSelectedRequest({ ...selectedRequest, payment_status: "Paid" });
      }
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to mark as paid.", "Update Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReadyForPickup = async (request) => {
    setActionLoading(true);
    try {
      const res = await api.updateRequest(request.id, {
        status: "Ready for Pickup",
        payment_status: request.payment_status || "Unpaid",
        pdf_path: request.pdf_path,
        remarks: request.remarks,
      });
      if (!res.success) throw new Error(res.message || "Failed to update.");
      showToast("success", `${request.reference_no} is now Ready for Pickup.`, "Ready for Pickup");
      await fetchRequests();
      if (selectedRequest && selectedRequest.id === request.id) {
        setSelectedRequest({ ...selectedRequest, status: "Ready for Pickup" });
      }
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to update status.", "Update Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleted = async (request) => {
    setActionLoading(true);
    try {
      const res = await api.updateRequest(request.id, {
        status: "Completed",
        payment_status: request.payment_status || "Unpaid",
        pdf_path: request.pdf_path,
        remarks: request.remarks,
      });
      if (!res.success) throw new Error(res.message || "Failed to update.");
      showToast("success", `${request.reference_no} marked as Completed.`, "Completed");
      await fetchRequests();
      if (selectedRequest && selectedRequest.id === request.id) {
        setSelectedRequest({ ...selectedRequest, status: "Completed" });
      }
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to update status.", "Update Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGeneratePdf = async (request) => {
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost/barangay-api/api/generate_pdf.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: request.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to generate PDF.");
      showToast("success", `PDF generated for ${request.reference_no}.`, "PDF Generated");
      await api.updateRequest(request.id, {
        status: "Processing",
        payment_status: request.payment_status || "Unpaid",
        pdf_path: data.data.pdf_path,
        remarks: request.remarks,
      });
      await fetchRequests();
      if (selectedRequest && selectedRequest.id === request.id) {
        setSelectedRequest({ ...selectedRequest, status: "Processing", pdf_path: data.data.pdf_path });
      }
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to generate PDF.", "PDF Error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (request) => {
    setActionLoading(true);
    try {
      const res = await api.generateToken(request.id);
      if (!res.success) throw new Error(res.message || "Failed to generate download link.");
      const downloadUrl = `http://localhost/barangay-api${res.data.download_url.replace("/api", "")}`;
      window.open(downloadUrl, "_blank");
      showToast("success", "Download started. Link expires in 24 hours.", "Download Started");
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to download PDF.", "Download Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (request) => {
    setDeletingRequest(request);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingRequest) return;
    setActionLoading(true);
    try {
      const res = await api.deleteRequest(deletingRequest.id);
      if (!res.success) throw new Error(res.message || "Failed to delete request.");
      showToast("success", `Request ${deletingRequest.reference_no} deleted.`, "Request Deleted");
      await fetchRequests();
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Failed to delete request.", "Delete Failed");
    } finally {
      setShowDeleteModal(false);
      setDeletingRequest(null);
      setActionLoading(false);
    }
  };

  // ✅ STATUS BADGE — may Ready for Pickup at Completed
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max"><FaClock size={10} /> Pending</span>;
      case "Processing":
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max"><FaSpinner className="animate-spin" size={10} /> Processing</span>;
      case "Approved":
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max"><FaCheckCircle size={10} /> Approved</span>;
      case "Ready for Pickup":
        return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max"><FaBoxOpen size={10} /> Ready for Pickup</span>;
      case "Completed":
        return <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max"><FaClipboardCheck size={10} /> Completed</span>;
      case "Rejected":
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max"><FaTimesCircle size={10} /> Rejected</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">{status || "Unknown"}</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "Paid": return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">Paid</span>;
      case "Unpaid": return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">Unpaid</span>;
      case "Waived": return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">Waived</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold">{status || "Unpaid"}</span>;
    }
  };

  if (!hasRequestsAccess) {
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
        {toasts.map((toast) => (<Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Service Requests Management</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor, process, and complete resident document requests.</p>
        </div>
        <button onClick={fetchRequests} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer text-sm disabled:opacity-60">
          {loading ? <><FaSpinner className="animate-spin" /> Loading...</> : <><FaFileAlt /> Refresh</>}
        </button>
      </div>

      {/* ✅ STATS — may Ready for Pickup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total" value={totalRequests} color="emerald" Icon={FaFileAlt} />
        <StatCard label="Pending" value={pendingCount} color="amber" Icon={FaClock} />
        <StatCard label="Approved" value={approvedCount} color="blue" Icon={FaCheckCircle} />
        <StatCard label="Ready for Pickup" value={readyForPickupCount} color="purple" Icon={FaBoxOpen} />
        <StatCard label="Completed" value={completedCount} color="teal" Icon={FaClipboardCheck} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute top-3.5 left-4 text-gray-400" />
          <input type="text" placeholder="Search by reference no., resident, or certificate..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all" />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <FaFilter className="text-gray-400 ml-1 mr-1" size={14} />
          {["All", "Pending", "Processing", "Approved", "Ready for Pickup", "Completed", "Rejected"].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${statusFilter === status ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-700 text-white text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Reference No.</th>
                <th className="p-4 font-semibold">Resident</th>
                <th className="p-4 font-semibold">Certificate</th>
                <th className="p-4 font-semibold">Payment</th>
                <th className="p-4 font-semibold">Fee</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {loading ? (
                <tr><td className="text-center py-12 text-gray-400" colSpan="7"><FaSpinner className="animate-spin inline mr-2" size={16} /> Loading service requests...</td></tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium">
                      <button onClick={() => handlePreview(req)} className="text-emerald-700 hover:text-emerald-900 hover:underline font-bold cursor-pointer" title="Click to preview certificate">{req.reference_no}</button>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">{req.resident_name ? req.resident_name.charAt(0) : "?"}</div>
                        {req.resident_name}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-emerald-800">{req.certificate_name || req.certificate_type || "-"}</td>
                    <td className="p-4">{getPaymentBadge(req.payment_status)}</td>
                    <td className="p-4 font-semibold">₱{Number(req.certificate_fee || req.amount || 0).toFixed(2)}</td>
                    <td className="p-4">{getStatusBadge(req.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handlePreview(req)} className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5" title="Preview Certificate">
                          <FaEye size={12} /> View
                        </button>
                        <button onClick={() => handlePrint(req)} className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5" title="Print Certificate">
                          <FaPrint size={12} /> Print
                        </button>
                        {canProcess && (
                          <button onClick={() => handleOpenModal(req)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5" title="Process Request">
                            <FaEdit size={12} /> Process
                          </button>
                        )}
                        {canDeleteRequest && (
                          <button onClick={() => handleDeleteClick(req)} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5" title="Delete Request">
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td className="text-center py-12 text-gray-400" colSpan="7">No service requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROCESS MODAL */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[92vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Process Request: <span className="text-emerald-600">{selectedRequest.reference_no}</span></h2>
                <p className="text-xs text-gray-500">Update status, manage payment, or complete certificate.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"><FaTimes size={16} /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800"><FaUser /> {selectedRequest.resident_name}</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="font-semibold text-gray-500">Certificate:</span> <span className="text-gray-800 font-bold">{selectedRequest.certificate_name || selectedRequest.certificate_type}</span></div>
                  <div><span className="font-semibold text-gray-500">Fee:</span> <span className="text-gray-800 font-bold">₱{Number(selectedRequest.certificate_fee || 0).toFixed(2)}</span></div>
                  <div><span className="font-semibold text-gray-500">Payment:</span> {getPaymentBadge(selectedRequest.payment_status)}</div>
                  <div><span className="font-semibold text-gray-500">Date:</span> <span className="text-gray-800">{selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleDateString() : "-"}</span></div>
                </div>
              </div>

              {selectedRequest.purpose && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm"><span className="font-semibold text-blue-700">Purpose:</span> <span className="text-blue-900">{selectedRequest.purpose}</span></div>
              )}

              {selectedRequest.pdf_path && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs flex items-center gap-2"><FaFilePdf className="text-emerald-600" /><span className="text-emerald-800 font-semibold">PDF Generated</span></div>
              )}

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Request Status</label>
                    {/* ✅ MAY READY FOR PICKUP */}
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Approved">Approved</option>
                      <option value="Ready for Pickup">Ready for Pickup</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Status</label>
                    <select value={newPaymentStatus} onChange={(e) => setNewPaymentStatus(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Waived">Waived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Admin Remarks</label>
                  <textarea rows="2" value={adminRemarks} onChange={(e) => setAdminRemarks(e.target.value)} placeholder="Optional notes..." className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
                </div>

                <button type="submit" disabled={actionLoading} className="w-full px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-all text-sm cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                  {actionLoading ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaCheckCircle /> Save Changes</>}
                </button>
              </form>

              {/* QUICK ACTIONS */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Actions</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRequest.payment_status !== "Paid" && (
                    <button onClick={() => handleMarkAsPaid(selectedRequest)} disabled={actionLoading} className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-all cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"><FaMoneyBillWave /> Mark as Paid</button>
                  )}
                  {!selectedRequest.pdf_path && (
                    <button onClick={() => handleGeneratePdf(selectedRequest)} disabled={actionLoading} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"><FaFilePdf /> Generate PDF</button>
                  )}
                  {/* ✅ READY FOR PICKUP button — lalabas kapag Approved */}
                  {selectedRequest.status === "Approved" && (
                    <button onClick={() => handleMarkReadyForPickup(selectedRequest)} disabled={actionLoading} className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"><FaBoxOpen /> Ready for Pickup</button>
                  )}
                  {/* ✅ COMPLETED button — lalabas kapag Ready for Pickup */}
                  {selectedRequest.status === "Ready for Pickup" && (
                    <button onClick={() => handleMarkCompleted(selectedRequest)} disabled={actionLoading} className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"><FaClipboardCheck /> Mark as Completed</button>
                  )}
                  {selectedRequest.pdf_path && (
                    <button onClick={() => handleDownload(selectedRequest)} disabled={actionLoading} className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"><FaDownload /> Download PDF</button>
                  )}
                  <button onClick={() => handlePrint(selectedRequest)} className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 col-span-full">
                    <FaPrint /> Print Certificate
                  </button>
                </div>
                {canDeleteRequest && (
                  <button onClick={() => { setShowModal(false); handleDeleteClick(selectedRequest); }} className="w-full px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 border border-red-200"><FaTrash /> Delete Request</button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-100 transition-colors text-sm cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showDeleteModal && deletingRequest && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"><FaTrash /></div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Delete Service Request?</h3>
                  <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">You are about to permanently delete <span className="font-bold">{deletingRequest.reference_no}</span>{deletingRequest.resident_name && <> for <span className="font-bold">{deletingRequest.resident_name}</span></>}. All associated data will be removed.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeletingRequest(null); }} disabled={actionLoading} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">Cancel</button>
              <button onClick={confirmDelete} disabled={actionLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-60">
                {actionLoading ? <><FaSpinner className="animate-spin" size={12} /> Deleting...</> : <><FaTrash size={12} /> Delete Permanently</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewData && <RequestPreviewModal requestData={previewData} onClose={() => setPreviewData(null)} />}
    </div>
  );
};

const StatCard = ({ label, value, color, Icon }) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    teal: "bg-teal-50 text-teal-600",
  };
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-extrabold mt-1 text-gray-800">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorMap[color] || colorMap.emerald}`}>
        <Icon />
      </div>
    </div>
  );
};

export default ServiceRequests