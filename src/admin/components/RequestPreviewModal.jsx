import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FaTimes, FaFilePdf, FaSpinner, FaUser, FaCalendar, FaTag } from "react-icons/fa";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// =====================================================
// PDFJS WORKER
// =====================================================
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// =====================================================
// BASE URL
// =====================================================
const BASE_URL = "http://localhost/barangay-api/";

// =====================================================
// COMPONENT
// =====================================================
const RequestPreviewModal = ({ requestData, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!requestData) return null;

  const { template, resident, request } = requestData;

  // =====================================================
  // PDF URL
  // =====================================================
  const pdfUrl = template?.pdf_path
    ? `${BASE_URL}${template.pdf_path.replace(/^\/?/, "")}`
    : null;

  const overlays = template?.template_layout?.overlays || [];

  // =====================================================
  // RESOLVE FIELD VALUE
  // =====================================================
  const getFieldValue = (fieldKey) => {
    if (!fieldKey) return "";

    // 1. Resident fields
    if (resident && resident[fieldKey] !== undefined) {
      return resident[fieldKey] || "";
    }

    // 2. Request field_values
    if (request?.field_values && request.field_values[fieldKey] !== undefined) {
      return request.field_values[fieldKey] || "";
    }

    // 3. Special fields
    if (fieldKey === "date_today" || fieldKey === "date_issued") {
      return new Date().toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    if (fieldKey === "reference_no") return request?.reference_no || "";

    if (fieldKey === "date_expired") {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return `{${fieldKey}}`;
  };

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">

        {/* =================================================
            HEADER
        ================================================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Certificate Preview
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {request?.reference_no} — {template?.name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* =================================================
            PDF PREVIEW BODY
        ================================================= */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {!pdfUrl ? (
            <div className="text-center py-16 text-gray-400">
              <FaFilePdf size={48} className="mx-auto mb-3" />
              <p className="text-sm font-medium">
                No PDF template uploaded for this certificate.
              </p>
              <p className="text-xs mt-1">
                Upload a PDF template from Certificate Issuance.
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative inline-block shadow-xl bg-white">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={({ numPages }) => {
                    setNumPages(numPages);
                    setLoading(false);
                  }}
                  loading={
                    <div className="p-12 text-center text-gray-500">
                      <FaSpinner className="animate-spin inline mr-2" />
                      Loading PDF...
                    </div>
                  }
                  error={
                    <div className="p-12 text-center text-red-500 text-sm">
                      Failed to load PDF template.
                    </div>
                  }
                >
                  {Array.from({ length: numPages || 1 }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <div key={pageNum} className="relative">
                        <Page
                          pageNumber={pageNum}
                          width={700}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />

                        {/* OVERLAYS */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                          {overlays
                            .filter((o) => (o.page || 1) === pageNum)
                            .map((overlay) => {
                              const value = overlay.isStatic
                                ? overlay.text
                                : getFieldValue(overlay.fieldKey);

                              return (
                                <div
                                  key={overlay.id}
                                  style={{
                                    position: "absolute",
                                    left: `${overlay.x}px`,
                                    top: `${overlay.y}px`,
                                    width: `${overlay.width}px`,
                                    height: `${overlay.height}px`,
                                    fontSize: `${overlay.fontSize}px`,
                                    fontFamily: overlay.fontFamily,
                                    fontWeight: overlay.fontWeight,
                                    fontStyle: overlay.fontStyle,
                                    color: overlay.color,
                                    textAlign: overlay.textAlign,
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "2px 4px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                  }}
                                >
                                  {value}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )
                  )}
                </Document>
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            FOOTER — REQUEST DETAILS
        ================================================= */}
        <div className="px-6 py-5 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* RESIDENT */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <FaUser size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Resident</p>
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {resident?.full_name || "N/A"}
                </p>
              </div>
            </div>

            {/* PURPOSE */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <FaTag size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Purpose</p>
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {request?.field_values?.purpose || "N/A"}
                </p>
              </div>
            </div>

            {/* DATE REQUESTED */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <FaCalendar size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Date Requested</p>
                <p className="font-semibold text-gray-800 text-sm">
                  {request?.requested_at
                    ? new Date(request.requested_at).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>

          </div>

          {/* STATUS + PAYMENT BADGES */}
          <div className="flex items-center gap-3 mt-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                request?.status === "Released"
                  ? "bg-emerald-100 text-emerald-700"
                  : request?.status === "Processing"
                  ? "bg-blue-100 text-blue-700"
                  : request?.status === "Rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {request?.status || "Pending"}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                request?.payment_status === "Paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : request?.payment_status === "Waived"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {request?.payment_status || "Unpaid"}
            </span>

            <span className="text-xs text-gray-500 ml-auto">
              Fee: ₱{Number(template?.certificate_fee || 0).toFixed(2)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RequestPreviewModal;