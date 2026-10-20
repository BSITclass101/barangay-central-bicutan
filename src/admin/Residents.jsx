import React, { useState, useEffect, useMemo } from "react";

// =====================================================
// API
// =====================================================
const API_URL = "http://localhost/barangay-api/api/residents.php";

// =====================================================
// PASSWORD RULES
// =====================================================
const passwordRules = [
  {
    key: "length",
    label: "8–15 characters",
    test: (password) => password.length >= 8 && password.length <= 15,
  },
  {
    key: "number",
    label: "At least one number",
    test: (password) => /\d/.test(password),
  },
  {
    key: "lowercase",
    label: "At least one lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    key: "uppercase",
    label: "At least one uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    key: "special",
    label: "At least one special character",
    test: (password) => /[^A-Za-z0-9\s]/.test(password),
  },
];

// =====================================================
// COMPONENT
// =====================================================
const Residents = () => {
  // ---------------------------------------------------
  // RESIDENTS
  // ---------------------------------------------------
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------------------------------------------
  // SEARCH
  // ---------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");

  // ---------------------------------------------------
  // SECURITY MODAL
  // ---------------------------------------------------
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // ===================================================
  // FETCH RESIDENTS
  // ===================================================
  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch residents. HTTP ${response.status}`
        );
      }

      const result = await response.json();

      console.log("Residents API response:", result);

      /*
       * Your residents.php returns:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: [...]
       * }
       */

      if (Array.isArray(result)) {
        setResidents(result);
      } else if (Array.isArray(result.data)) {
        setResidents(result.data);
      } else {
        setResidents([]);
      }
    } catch (err) {
      console.error("Error fetching residents:", err);
      setError(
        "Unable to load resident accounts. Please check your API connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // FULL NAME
  // ===================================================
  const getFullName = (resident) => {
    const parts = [
      resident.first_name || resident.firstName || "",
      resident.middle_name || resident.middleName || "",
      resident.last_name || resident.lastName || "",
      resident.suffix || "",
    ];

    return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  };

  // ===================================================
  // RESIDENT ID
  // ===================================================
  const getResidentId = (resident) => {
    return (
      resident.resident_id ||
      resident.residentId ||
      resident.id ||
      ""
    );
  };

  // ===================================================
  // FILTER
  // ===================================================
  const filteredResidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return residents;
    }

    return residents.filter((resident) => {
      const fullName = getFullName(resident).toLowerCase();

      const residentId = String(
        getResidentId(resident)
      ).toLowerCase();

      return (
        fullName.includes(query) ||
        residentId.includes(query)
      );
    });
  }, [residents, searchQuery]);

  // ===================================================
  // OPEN SECURITY MODAL
  // ===================================================
  const handleOpenSecurity = (resident) => {
    setSelectedResident(resident);

    setPassword("");
    setConfirmPassword("");

    setPasswordError("");

    setShowPassword(false);
    setShowConfirmPassword(false);

    setIsSecurityModalOpen(true);
  };

  // ===================================================
  // CLOSE SECURITY MODAL
  // ===================================================
  const handleCloseSecurity = () => {
    if (savingPassword) {
      return;
    }

    setIsSecurityModalOpen(false);

    setSelectedResident(null);

    setPassword("");
    setConfirmPassword("");

    setPasswordError("");

    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // ===================================================
  // PASSWORD VALIDATION
  // ===================================================
  const validatePassword = () => {
    if (!password) {
      setPasswordError("Please enter a password.");
      return false;
    }

    const failedRule = passwordRules.find(
      (rule) => !rule.test(password)
    );

    if (failedRule) {
      setPasswordError(
        `Password must meet this requirement: ${failedRule.label}.`
      );

      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return false;
    }

    return true;
  };

  // ===================================================
  // SAVE PASSWORD
  // ===================================================
  const handleSavePassword = async () => {
    if (!selectedResident) {
      return;
    }

    setPasswordError("");

    const isValid = validatePassword();

    if (!isValid) {
      return;
    }

    try {
      setSavingPassword(true);

      const databaseId = selectedResident.id;

      /*
       * IMPORTANT:
       * residents.php PUT expects:
       *
       * /residents.php?id=DATABASE_ID
       *
       * It will hash the password using PHP password_hash().
       */

      const response = await fetch(
        `${API_URL}?id=${encodeURIComponent(databaseId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: password,
            account_status: "Active",
          }),
        }
      );

      const result = await response.json();

      console.log("Save password response:", result);

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Failed to save password."
        );
      }

      // -------------------------------------------------
      // Update local list
      // -------------------------------------------------
      setResidents((prevResidents) =>
        prevResidents.map((resident) => {
          if (resident.id === selectedResident.id) {
            return {
              ...resident,
              account_status: "Active",
            };
          }

          return resident;
        })
      );

      // -------------------------------------------------
      // Close modal
      // -------------------------------------------------
      setIsSecurityModalOpen(false);
      setSelectedResident(null);

      setPassword("");
      setConfirmPassword("");

      setPasswordError("");

      setShowPassword(false);
      setShowConfirmPassword(false);

      alert("Resident account password saved successfully.");
    } catch (err) {
      console.error("Error saving resident password:", err);

      setPasswordError(
        err.message ||
          "Failed to save password. Please try again."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  // ===================================================
  // DELETE
  // ===================================================
  const handleDeleteResident = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resident record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Failed to delete resident."
        );
      }

      setResidents((prevResidents) =>
        prevResidents.filter(
          (resident) => resident.id !== id
        )
      );

      alert("Resident record deleted successfully.");
    } catch (err) {
      console.error("Error deleting resident:", err);

      alert(
        err.message ||
          "Failed to delete resident record."
      );
    }
  };

  // ===================================================
  // PASSWORD RULE STATUS
  // ===================================================
  const getPasswordRuleStatus = (rule) => {
    return rule.test(password);
  };

  // ===================================================
  // EYE ICON
  // ===================================================
  const EyeIcon = ({ visible }) => {
    if (visible) {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 3l18 18"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10.584 10.587a2 2 0 002.829 2.829"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9.88 5.09A10.94 10.94 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.96 10.96 0 01-4.132 5.411"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6.228 6.228A10.96 10.96 0 002.458 12c1.274 4.057 5.065 7 9.542 7 1.61 0 3.13-.346 4.503-.967"
        />
      </svg>
    );
  };

  // ===================================================
  // CHECK ICON
  // ===================================================
  const CheckIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  // ===================================================
  // X ICON
  // ===================================================
  const XIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  // ===================================================
  // SEARCH ICON
  // ===================================================
  const SearchIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  // ===================================================
  // REFRESH ICON
  // ===================================================
  const RefreshIcon = () => (
    <svg
      className={`w-4 h-4 ${
        loading ? "animate-spin text-emerald-600" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );

  // ===================================================
  // RETURN
  // ===================================================
  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Resident User's
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage resident accounts and security settings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* SEARCH */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by ID or name..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full px-3.5 py-2.5 pl-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />

            <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
              <SearchIcon />
            </div>
          </div>

          {/* REFRESH */}
          <button
            onClick={fetchResidents}
            title="Refresh List"
            className="inline-flex items-center justify-center p-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors shadow-sm"
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="py-3.5 px-6 font-semibold">
                  Full Name
                </th>

                <th className="py-3.5 px-6 font-semibold">
                  Resident ID
                </th>

                <th className="py-3.5 px-6 font-semibold">
                  Username
                </th>

                <th className="py-3.5 px-6 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {/* LOADING */}
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg
                        className="w-6 h-6 animate-spin text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>

                      <span>
                        Loading resident accounts...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                /* EMPTY */
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center text-gray-400"
                  >
                    {searchQuery
                      ? "No resident accounts match your search."
                      : "No resident records found."}
                  </td>
                </tr>
              ) : (
                /* RESIDENTS */
                filteredResidents.map((resident) => {
                  const residentId =
                    getResidentId(resident);

                  const fullName =
                    getFullName(resident);

                  return (
                    <tr
                      key={resident.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* FULL NAME */}
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {fullName || "N/A"}
                        </div>
                      </td>

                      {/* RESIDENT ID */}
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
                          {residentId || "N/A"}
                        </span>
                      </td>

                      {/* USERNAME */}
                      <td className="py-4 px-6">
                        <span className="text-gray-700">
                          {residentId || "N/A"}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() =>
                            handleOpenSecurity(resident)
                          }
                          className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Security
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            TABLE FOOTER
        ================================================= */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            Total residents:{" "}
            <span className="font-semibold text-gray-700">
              {filteredResidents.length}
            </span>
          </p>
        </div>
      </div>

      {/* =================================================
          RESIDENT SECURITY MODAL
      ================================================= */}
      {isSecurityModalOpen && selectedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseSecurity}
          />

          {/* MODAL */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Resident Security
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Set or update the resident's login password.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseSecurity}
                  disabled={savingPassword}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="px-6 py-6 space-y-5">
              {/* USERNAME */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>

                <input
                  type="text"
                  value={getResidentId(
                    selectedResident
                  )}
                  readOnly
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-sm cursor-not-allowed"
                />

                <p className="text-xs text-gray-400 mt-1.5">
                  Username is automatically based on the Resident ID.
                </p>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Enter password"
                    maxLength={15}
                    className="w-full px-3.5 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <EyeIcon
                      visible={showPassword}
                    />
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(
                        e.target.value
                      );
                      setPasswordError("");
                    }}
                    placeholder="Confirm password"
                    maxLength={15}
                    className="w-full px-3.5 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <EyeIcon
                      visible={
                        showConfirmPassword
                      }
                    />
                  </button>
                </div>
              </div>

              {/* PASSWORD REQUIREMENTS */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Password must contain:
                </p>

                <div className="space-y-2">
                  {passwordRules.map((rule) => {
                    const passed =
                      getPasswordRuleStatus(
                        rule
                      );

                    return (
                      <div
                        key={rule.key}
                        className={`flex items-center gap-2 text-sm ${
                          passed
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            passed
                              ? "bg-emerald-100"
                              : "bg-red-100"
                          }`}
                        >
                          {passed ? (
                            <CheckIcon />
                          ) : (
                            <XIcon />
                          )}
                        </span>

                        <span>{rule.label}</span>
                      </div>
                    );
                  })}

                  {/* MATCH RULE */}
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      password &&
                      confirmPassword &&
                      password === confirmPassword
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        password &&
                        confirmPassword &&
                        password === confirmPassword
                          ? "bg-emerald-100"
                          : "bg-red-100"
                      }`}
                    >
                      {password &&
                      confirmPassword &&
                      password === confirmPassword ? (
                        <CheckIcon />
                      ) : (
                        <XIcon />
                      )}
                    </span>

                    <span>
                      Passwords match
                    </span>
                  </div>
                </div>
              </div>

              {/* ERROR */}
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3.5 py-3 text-sm">
                  {passwordError}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseSecurity}
                disabled={savingPassword}
                className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePassword}
                disabled={savingPassword}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingPassword ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>

                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Residents;