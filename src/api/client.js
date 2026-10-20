// src/api/client.js
// Central API helper — pure fetch, walang axios

const API_BASE = "http://localhost/barangay-api/api";

// =====================================================
// HELPER: Standard request handler
// =====================================================
async function request(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) {
      console.error("API Error:", data);
    }

    return data;
  } catch (err) {
    console.error("Network Error:", err);
    return {
      success: false,
      message: "Network error. Check if backend is running.",
      data: null,
    };
  }
}

// =====================================================
// HELPER: FormData request (para sa file upload)
// =====================================================
async function requestFormData(url, formData, method = "POST") {
  try {
    // Kung PUT, gamitin ang _method override (para gumana sa PHP)
    if (method === "PUT") {
      formData.append("_method", "PUT");
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) console.error("API Error:", data);
      return data;
    }

    const res = await fetch(url, {
      method,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) console.error("API Error:", data);
    return data;
  } catch (err) {
    console.error("Network Error:", err);
    return {
      success: false,
      message: "Network error. Check if backend is running.",
      data: null,
    };
  }
}

// =====================================================
// API METHODS
// =====================================================

export const api = {
  // ----------------------------------------
  // CERTIFICATE TYPES (para sa dropdown ng residents)
  // ----------------------------------------
  getCertificateTypes: () =>
    request(`${API_BASE}/certificate_types.php`),

  // ----------------------------------------
  // CERTIFICATES (Templates — existing API)
  // ----------------------------------------
  getCertificates: () => request(`${API_BASE}/certificate_issuance.php`),

  getCertificate: (id) =>
    request(`${API_BASE}/certificate_issuance.php?id=${id}`),

  createCertificate: (data) =>
    request(`${API_BASE}/certificate_issuance.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  updateCertificate: (id, data) =>
    request(`${API_BASE}/certificate_issuance.php?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  deleteCertificate: (id) =>
    request(`${API_BASE}/certificate_issuance.php?id=${id}`, {
      method: "DELETE",
    }),

  // ----------------------------------------
  // SERVICE REQUESTS (residents gumagawa, admin nag-aapprove)
  // ----------------------------------------
  getRequests: () => request(`${API_BASE}/service_requests.php`),

  getServiceRequest: (id) =>
    request(`${API_BASE}/service_requests.php?id=${id}`),

  createServiceRequest: (data) =>
    request(`${API_BASE}/service_requests.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  updateRequest: (id, data) =>
    request(`${API_BASE}/service_requests.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    }),

  deleteRequest: (id) =>
    request(`${API_BASE}/service_requests.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),

  getMyServiceRequests: (residentId) =>
    request(`${API_BASE}/service_requests.php?mine=1&resident_id=${residentId}`),

  // ----------------------------------------
  // ✅ BARANGAY SETTINGS (para sa footer at admin profile)
  // ----------------------------------------
  getSettings: () => request(`${API_BASE}/settings.php`),

  updateSettings: (data) =>
    request(`${API_BASE}/settings.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  // ----------------------------------------
  // PDF UPLOAD (Admin — template PDF)
  // ----------------------------------------
  uploadPdf: (certificateId, file) => {
    if (!certificateId) {
      return Promise.resolve({
        success: false,
        message: "Certificate ID is required.",
        data: null,
      });
    }

    if (!file) {
      return Promise.resolve({
        success: false,
        message: "PDF file is required.",
        data: null,
      });
    }

    const formData = new FormData();
    formData.append("certificate_id", String(certificateId));
    formData.append("pdf", file);

    return request(`${API_BASE}/upload_pdf.php`, {
      method: "POST",
      body: formData,
    });
  },

  // ----------------------------------------
  // DOWNLOAD TOKEN (Resident — secure PDF download)
  // ----------------------------------------
  generateToken: (requestId) =>
    request(`${API_BASE}/generate_token.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId }),
    }),

  // ----------------------------------------
  // RESIDENTS
  // ----------------------------------------
  getResidents: () => request(`${API_BASE}/residents.php`),

  getResident: (id) => request(`${API_BASE}/residents.php?id=${id}`),

  createResident: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return requestFormData(`${API_BASE}/residents.php`, formData, "POST");
  },

  updateResident: (id, data) => {
    const formData = new FormData();
    formData.append("id", id);
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return requestFormData(
      `${API_BASE}/residents.php?id=${id}`,
      formData,
      "PUT"
    );
  },

  deleteResident: (id) =>
    request(`${API_BASE}/residents.php?id=${id}`, {
      method: "DELETE",
    }),

  // ----------------------------------------
  // ✅ SSE — Real-time updates (BAGO)
  // ----------------------------------------
  subscribeToUpdates: (onUpdate) => {
    const eventSource = new EventSource(`${API_BASE}/stream.php`);

    eventSource.addEventListener("update", (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    });

    eventSource.addEventListener("connected", () => {
      console.log("✅ SSE connected");
    });

    eventSource.onerror = (err) => {
      console.error("❌ SSE error:", err);
    };

    return eventSource;
  },
};