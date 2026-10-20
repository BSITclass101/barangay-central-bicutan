import React, { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Eye,
  Printer,
  Download,
  CheckCircle,
  Calendar,
  Hash,
  Loader2,
  X,
  FileCheck,
} from "lucide-react";

const API_URL = "http://localhost/barangay-api/api/certificate_issuance.php";

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);

      const storedResident = localStorage.getItem("user");

      if (!storedResident) {
        setLoading(false);
        return;
      }

      const resident = JSON.parse(storedResident);
      const residentId = resident.id || resident.userId || resident.resident_id;

      if (!residentId) {
        setLoading(false);
        return;
      }

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to retrieve certificates.");
      }

      const allCertificates = data.data || [];

      const myReleasedCertificates = allCertificates.filter(
        (certificate) =>
          String(certificate.resident_id) === String(residentId) &&
          certificate.status === "Released" &&
          Number(certificate.is_template) === 0
      );

      setCertificates(myReleasedCertificates);
    } catch (error) {
      console.error("Error loading certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter((certificate) => {
    const searchText = search.toLowerCase();
    return (
      String(certificate.certificate_no || "").toLowerCase().includes(searchText) ||
      String(certificate.certificate_type || "").toLowerCase().includes(searchText) ||
      String(certificate.purpose || "").toLowerCase().includes(searchText)
    );
  });

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePrint = (certificate) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Please allow pop-ups in your browser to print the certificate.");
      return;
    }

    const issuedDate = certificate.issued_date || certificate.created_at;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${certificate.certificate_type || "Certificate"}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 40px; font-family: Arial, Helvetica, sans-serif; color: #111827; background: white; }
          .certificate { max-width: 850px; margin: auto; border: 2px solid #111827; padding: 50px; min-height: 700px; }
          .header { text-align: center; margin-bottom: 40px; }
          .header p { margin: 5px 0; font-size: 14px; }
          .header h1 { margin: 18px 0 5px; font-size: 25px; text-transform: uppercase; }
          .header h2 { margin: 0; font-size: 18px; }
          .content { margin-top: 30px; line-height: 1.8; font-size: 16px; }
          .title { text-align: center; font-weight: bold; font-size: 22px; margin-bottom: 35px; text-transform: uppercase; }
          .details { margin-top: 25px; }
          .row { margin-bottom: 12px; }
          .label { font-weight: bold; }
          .footer { margin-top: 70px; display: flex; justify-content: space-between; }
          .signature { text-align: center; width: 250px; }
          .signature-line { border-top: 1px solid #111827; margin-top: 55px; padding-top: 8px; }
          .certificate-no { margin-top: 35px; font-size: 12px; }
          @media print { body { padding: 0; } .certificate { border: 2px solid #111827; page-break-inside: avoid; } }
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

          <div class="title">${certificate.certificate_type || "CERTIFICATE"}</div>

          <div class="content">
            <p><strong>TO WHOM IT MAY CONCERN:</strong></p>
            <p>This is to certify that the certificate indicated below has been officially issued by the Barangay Central Bicutan.</p>

            <div class="details">
              <div class="row"><span class="label">Certificate No.:</span> ${certificate.certificate_no || "N/A"}</div>
              <div class="row"><span class="label">Purpose:</span> ${certificate.purpose || "N/A"}</div>
              <div class="row"><span class="label">Date Issued:</span> ${formatDate(issuedDate)}</div>
              ${certificate.or_number ? `<div class="row"><span class="label">OR Number:</span> ${certificate.or_number}</div>` : ""}
            </div>

            <p style="margin-top: 35px;">This certificate is issued upon the request of the concerned resident for whatever legal purpose it may serve.</p>
          </div>

          <div class="footer">
            <div></div>
            <div class="signature">
              <div class="signature-line">AUTHORIZED BARANGAY OFFICIAL</div>
              <div>Barangay Central Bicutan</div>
            </div>
          </div>

          <div class="certificate-no">Certificate No.: ${certificate.certificate_no || "N/A"}</div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    alert("PDF download will be available once the server-side certificate PDF generation is connected.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading your certificates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">My Certificates</h1>
        <p className="text-sm text-slate-500 mt-1">View your certificates that have been released.</p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Released Certificates</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{certificates.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Latest Certificate</p>
                <p className="text-sm font-bold text-slate-800 mt-2">
                  {certificates.length > 0 ? certificates[0].certificate_type : "None"}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <p className="text-sm font-bold text-green-600 mt-2">All Released</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search certificate number, type, or purpose..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">Released Certificates</h2>
            <p className="text-xs text-slate-500 mt-1">Certificates officially released to you.</p>
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700">No released certificates</h3>
              <p className="text-sm text-slate-500 mt-1">Your released certificates will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCertificates.map((certificate) => (
                <div key={certificate.id} className="p-5 md:px-6 hover:bg-slate-50 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                      <FileCheck className="w-7 h-7 text-green-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-bold text-slate-800">{certificate.certificate_type}</h3>
                        <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Released
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                        <div>
                          <p className="text-xs text-slate-400">Certificate No.</p>
                          <p className="text-sm font-semibold text-slate-700">{certificate.certificate_no || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Date Issued</p>
                          <p className="text-sm font-medium text-slate-700">
                            {formatDate(certificate.issued_date || certificate.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Purpose</p>
                          <p className="text-sm font-medium text-slate-700">{certificate.purpose || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCertificate(certificate)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handlePrint(certificate)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedCertificate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg text-slate-800">Certificate Details</h2>
                <p className="text-xs text-slate-500 mt-1">Official certificate information</p>
              </div>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center p-5 bg-green-50 border border-green-100 rounded-2xl mb-6">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                  <FileCheck className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-bold text-green-800">{selectedCertificate.certificate_type}</h3>
                <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Released
                </span>
              </div>

              <div className="space-y-5">
                <DetailRow icon={<Hash className="w-4 h-4" />} label="Certificate Number" value={selectedCertificate.certificate_no} />
                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Date Issued"
                  value={formatDate(selectedCertificate.issued_date || selectedCertificate.created_at)}
                />
                <DetailRow label="Purpose" value={selectedCertificate.purpose} />
                <DetailRow
                  label="Amount"
                  value={
                    selectedCertificate.amount
                      ? `₱${Number(selectedCertificate.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                      : "₱0.00"
                  }
                />
                <DetailRow label="Payment Status" value={selectedCertificate.payment_status || "Paid"} />
                <DetailRow label="OR Number" value={selectedCertificate.or_number || "N/A"} />
                <DetailRow label="Remarks" value={selectedCertificate.remarks || "No remarks"} />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-7">
                <button
                  onClick={() => handlePrint(selectedCertificate)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={() => handleDownload(selectedCertificate)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    {icon && (
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
        {icon}
      </div>
    )}
    <div className="flex-1">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-700 break-words">{value || "N/A"}</p>
    </div>
  </div>
);

export default MyCertificates;