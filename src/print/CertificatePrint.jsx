// src/print/CertificatePrint.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const API_BASE = "http://localhost/barangay-api/api";

export default function CertificatePrint() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const printed = useRef(false);

  // =====================================================
  // FETCH REQUEST DETAILS
  // =====================================================
  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/service_requests.php?id=${id}`);
        const data = await res.json();

        if (!data.success || !data.data) {
          throw new Error(data.message || "Request not found.");
        }

        setRequest(data.data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load certificate.");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadRequest();
  }, [id]);

  // =====================================================
  // AUTO-PRINT PAGKA-LOAD
  // =====================================================
  useEffect(() => {
    if (!loading && request && !printed.current) {
      printed.current = true;
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, request]);

  // =====================================================
  // LOADING STATE
  // =====================================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-600">
        <FaSpinner className="animate-spin text-3xl mb-3" />
        <p>Loading certificate...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================
  if (error || !request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-red-600">
        <FaExclamationTriangle className="text-4xl mb-3" />
        <p className="font-semibold">{error || "Certificate not found."}</p>
      </div>
    );
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================
  const issuedDate = request.created_at
    ? new Date(request.created_at).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const certificateName = request.certificate_name || request.certificate_type || "CERTIFICATE";

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="certificate-print-page bg-white">
      <style>{`
        @page {
          size: letter;
          margin: 0.5in;
        }

        @media print {
          html, body {
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .no-print {
            display: none !important;
          }
          .certificate-container {
            border: 2px solid #111827 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }

        body {
          font-family: 'Times New Roman', Times, serif;
          background: #f3f4f6;
          margin: 0;
          padding: 20px;
        }

        .certificate-container {
          max-width: 850px;
          margin: 20px auto;
          background: #fff;
          border: 2px solid #111827;
          padding: 60px 70px;
          min-height: 950px;
          position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .cert-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px double #111827;
        }

        .cert-header p {
          margin: 4px 0;
          font-size: 14px;
          letter-spacing: 1px;
        }

        .cert-header h1 {
          margin: 18px 0 5px;
          font-size: 26px;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: bold;
        }

        .cert-header h2 {
          margin: 0;
          font-size: 18px;
          letter-spacing: 2px;
        }

        .cert-title {
          text-align: center;
          font-weight: bold;
          font-size: 30px;
          margin: 50px 0 40px;
          text-transform: uppercase;
          letter-spacing: 4px;
        }

        .cert-content {
          line-height: 2;
          font-size: 17px;
          text-align: justify;
          color: #111827;
        }

        .cert-content p {
          margin: 15px 0;
        }

        .cert-content .indent {
          text-indent: 60px;
        }

        .cert-content strong {
          text-transform: uppercase;
          font-weight: bold;
        }

        .cert-details {
          margin: 30px 0;
          padding: 20px;
          background: #f9fafb;
          border-left: 4px solid #111827;
        }

        .cert-details .row {
          margin-bottom: 10px;
          font-size: 15px;
        }

        .cert-details .label {
          font-weight: bold;
          display: inline-block;
          width: 180px;
        }

        .cert-footer {
          margin-top: 90px;
          display: flex;
          justify-content: flex-end;
        }

        .cert-signature {
          text-align: center;
          width: 300px;
        }

        .cert-signature-line {
          border-top: 1px solid #111827;
          margin-top: 60px;
          padding-top: 8px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .cert-signature-role {
          font-size: 14px;
          margin-top: 4px;
        }

        .cert-ref-no {
          position: absolute;
          bottom: 20px;
          left: 70px;
          font-size: 11px;
          color: #6b7280;
          font-family: 'Courier New', monospace;
        }

        .print-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #059669;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(5,150,105,0.3);
          z-index: 100;
          font-family: -apple-system, sans-serif;
        }

        .print-btn:hover {
          background: #047857;
        }
      `}</style>

      {/* Print button (hidden pag nag-print) */}
      <button className="print-btn no-print" onClick={() => window.print()}>
        🖨️ Print
      </button>

      {/* Certificate */}
      <div className="certificate-container">
        {/* Header */}
        <div className="cert-header">
          <p>REPUBLIC OF THE PHILIPPINES</p>
          <p>METRO MANILA</p>
          <p>CITY OF TAGUIG</p>
          <h1>BARANGAY CENTRAL BICUTAN</h1>
          <h2>OFFICE OF THE PUNONG BARANGAY</h2>
        </div>

        {/* Title */}
        <div className="cert-title">{certificateName}</div>

        {/* Body */}
        <div className="cert-content">
          <p>
            <strong>TO WHOM IT MAY CONCERN:</strong>
          </p>

          <p className="indent">
            This is to certify that{" "}
            <strong>{request.resident_name || "___________________"}</strong>,
            of legal age, Filipino citizen, and a bona fide resident of{" "}
            <strong>{request.resident_address || "Barangay Central Bicutan"}</strong>,
            is a resident of this Barangay.
          </p>

          <p className="indent">
            This certification is issued upon the request of the above-named
            person for <strong>{request.purpose || "___________________"}</strong>.
          </p>

          {/* Details */}
          <div className="cert-details">
            <div className="row">
              <span className="label">Reference No.:</span>
              <span>{request.reference_no || "—"}</span>
            </div>
            <div className="row">
              <span className="label">Date Issued:</span>
              <span>{issuedDate}</span>
            </div>
            {request.or_number && (
              <div className="row">
                <span className="label">OR Number:</span>
                <span>{request.or_number}</span>
              </div>
            )}
            {Number(request.certificate_fee) > 0 && (
              <div className="row">
                <span className="label">Fee Paid:</span>
                <span>₱{Number(request.certificate_fee).toFixed(2)}</span>
              </div>
            )}
          </div>

          <p className="indent">
            Issued this <strong>{issuedDate}</strong> at Barangay Central Bicutan, Taguig City.
          </p>
        </div>

        {/* Signature */}
        <div className="cert-footer">
          <div className="cert-signature">
            <div className="cert-signature-line">HON. JUAN DELA CRUZ</div>
            <div className="cert-signature-role">Punong Barangay</div>
          </div>
        </div>

        {/* Ref no sa bottom */}
        <div className="cert-ref-no">
          Reference No.: {request.reference_no || "—"}
        </div>
      </div>
    </div>
  );
}