import React, { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, RefreshCw, Search, X } from "lucide-react";

// =====================================================
// API
// =====================================================

const API_URL =
  "http://localhost/barangay-api/api/residents.php";

// =====================================================
// COMPONENT
// =====================================================

const ResidentUsers = () => {
  // ---------------------------------------------------
  // DATA
  // ---------------------------------------------------

  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------------------------------------------
  // SEARCH
  // ---------------------------------------------------

  const [searchTerm, setSearchTerm] = useState("");

  // ---------------------------------------------------
  // SECURITY MODAL
  // ---------------------------------------------------

  const [isSecurityModalOpen, setIsSecurityModalOpen] =
    useState(false);

  const [selectedResident, setSelectedResident] =
    useState(null);

  const [securityForm, setSecurityForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [saveError, setSaveError] = useState("");

  // ===================================================
  // FETCH RESIDENTS
  // ===================================================

  const fetchResidents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          "Failed to fetch residents from database."
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to retrieve residents."
        );
      }

      setResidents(
        Array.isArray(result.data)
          ? result.data
          : []
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong while loading residents."
      );

    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchResidents();
  }, []);

  // ===================================================
  // FULL NAME
  // ===================================================

  const getFullName = (resident) => {
    const parts = [
      resident.first_name,
      resident.middle_name,
      resident.last_name,
      resident.suffix,
    ];

    return parts
      .filter(
        (part) =>
          part !== null &&
          part !== undefined &&
          String(part).trim() !== ""
      )
      .join(" ");
  };

  // ===================================================
  // SEARCH FILTER
  // ===================================================

  const filteredResidents = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return residents;
    }

    return residents.filter((resident) => {
      const fullName =
        getFullName(resident).toLowerCase();

      const residentId =
        String(
          resident.resident_id || ""
        ).toLowerCase();

      const username =
        residentId;

      return (
        fullName.includes(search) ||
        residentId.includes(search) ||
        username.includes(search)
      );
    });
  }, [residents, searchTerm]);

  // ===================================================
  // OPEN SECURITY MODAL
  // ===================================================

  const handleOpenSecurity = (resident) => {
    setSelectedResident(resident);

    setSecurityForm({
      username:
        resident.resident_id || "",
      password: "",
      confirmPassword: "",
    });

    setShowPassword(false);
    setShowConfirmPassword(false);
    setSaveError("");

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

    setSecurityForm({
      username: "",
      password: "",
      confirmPassword: "",
    });

    setShowPassword(false);
    setShowConfirmPassword(false);
    setSaveError("");
  };

  // ===================================================
  // FORM CHANGE
  // ===================================================

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;

    setSecurityForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaveError("");
  };

  // ===================================================
  // PASSWORD RULES
  // ===================================================

  const passwordRules = {
    length:
      securityForm.password.length >= 8 &&
      securityForm.password.length <= 15,

    number:
      /[0-9]/.test(
        securityForm.password
      ),

    lowercase:
      /[a-z]/.test(
        securityForm.password
      ),

    uppercase:
      /[A-Z]/.test(
        securityForm.password
      ),

    special:
      /[^A-Za-z0-9]/.test(
        securityForm.password
      ),
  };

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.number &&
    passwordRules.lowercase &&
    passwordRules.uppercase &&
    passwordRules.special;

  const passwordsMatch =
    securityForm.password !== "" &&
    securityForm.password ===
      securityForm.confirmPassword;

  // ===================================================
  // SAVE PASSWORD
  // ===================================================

  const handleSaveSecurity = async (e) => {
    e.preventDefault();

    if (!selectedResident) {
      return;
    }

    setSaveError("");

    // -----------------------------------------------
    // Validate password
    // -----------------------------------------------

    if (!isPasswordValid) {
      setSaveError(
        "Please make sure the password follows all password requirements."
      );

      return;
    }

    // -----------------------------------------------
    // Confirm password
    // -----------------------------------------------

    if (!passwordsMatch) {
      setSaveError(
        "Password and Confirm Password do not match."
      );

      return;
    }

    try {
      setSavingPassword(true);

      const response = await fetch(
        `${API_URL}?id=${selectedResident.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            password:
              securityForm.password,

            account_status: "Active",
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to save resident security."
        );
      }

      // ---------------------------------------------
      // Update local resident data
      // ---------------------------------------------

      setResidents((prev) =>
        prev.map((resident) =>
          resident.id ===
          selectedResident.id
            ? {
                ...resident,
                account_status:
                  "Active",
              }
            : resident
        )
      );

      alert(
        "Resident account password saved successfully."
      );

      handleCloseSecurity();

    } catch (err) {
      console.error(err);

      setSaveError(
        err.message ||
          "Failed to save resident password."
      );

    } finally {
      setSavingPassword(false);
    }
  };

  // ===================================================
  // PASSWORD RULE COMPONENT
  // ===================================================

  const PasswordRule = ({
    valid,
    children,
  }) => {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
            valid
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {valid ? "✓" : "×"}
        </span>

        <span
          className={
            valid
              ? "text-gray-700"
              : "text-gray-500"
          }
        >
          {children}
        </span>
      </div>
    );
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>
      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Resident User's
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Manage resident login accounts and security.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchResidents}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="relative w-full sm:w-96">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Search by ID or name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />

            </div>

            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {filteredResidents.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {residents.length}
              </span>{" "}
              residents
            </div>

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse">

              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">

                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>

                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Resident ID
                  </th>

                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Username
                  </th>

                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {/* LOADING */}

                {loading && (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-12 text-center text-gray-500"
                    >
                      Loading resident users...
                    </td>
                  </tr>
                )}

                {/* ERROR */}

                {!loading && error && (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-12 text-center"
                    >
                      <div className="text-red-600 font-medium">
                        {error}
                      </div>

                      <button
                        onClick={fetchResidents}
                        className="mt-3 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
                      >
                        Try Again
                      </button>
                    </td>
                  </tr>
                )}

                {/* EMPTY */}

                {!loading &&
                  !error &&
                  filteredResidents.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-gray-500"
                      >
                        {residents.length === 0
                          ? "No resident records found."
                          : "No residents match your search."}
                      </td>
                    </tr>
                  )}

                {/* DATA */}

                {!loading &&
                  !error &&
                  filteredResidents.map(
                    (resident) => (
                      <tr
                        key={resident.id}
                        className="hover:bg-gray-50 transition-colors"
                      >

                        <td className="py-4 px-6">

                          <div className="font-medium text-gray-900">
                            {getFullName(
                              resident
                            )}
                          </div>

                        </td>

                        <td className="py-4 px-6">

                          <span className="font-medium text-gray-700">
                            {
                              resident.resident_id
                            }
                          </span>

                        </td>

                        <td className="py-4 px-6">

                          <span className="text-gray-700">
                            {
                              resident.resident_id
                            }
                          </span>

                        </td>

                        <td className="py-4 px-6 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenSecurity(
                                resident
                              )
                            }
                            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium transition-colors"
                          >
                            Action
                          </button>

                        </td>

                      </tr>
                    )
                  )}

              </tbody>

            </table>

          </div>

          {/* TABLE FOOTER */}

          {!loading &&
            !error &&
            residents.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">

                <div className="text-sm text-gray-600">
                  Total Residents:{" "}
                  <span className="font-semibold text-gray-900">
                    {residents.length.toLocaleString()}
                  </span>
                </div>

              </div>
            )}

        </div>

      </div>

      {/* ===================================================
          RESIDENT SECURITY MODAL
      =================================================== */}

      {isSecurityModalOpen &&
        selectedResident && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget
              ) {
                handleCloseSecurity();
              }
            }}
          >

            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

              {/* -------------------------------------------
                  MODAL HEADER
              ------------------------------------------- */}

              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">

                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Resident Security
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Set login credentials for this resident.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseSecurity
                  }
                  disabled={savingPassword}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
                >
                  <X size={20} />
                </button>

              </div>

              {/* -------------------------------------------
                  MODAL FORM
              ------------------------------------------- */}

              <form
                onSubmit={
                  handleSaveSecurity
                }
                className="p-6 space-y-5"
              >

                {/* USERNAME */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={
                      securityForm.username
                    }
                    readOnly
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed focus:outline-none"
                  />

                  <p className="mt-1.5 text-xs text-gray-500">
                    Username is automatically based on the Resident ID.
                  </p>

                </div>

                {/* PASSWORD */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={
                        securityForm.password
                      }
                      onChange={
                        handleSecurityChange
                      }
                      placeholder="Enter password"
                      autoComplete="new-password"
                      className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>

                  </div>

                </div>

                {/* CONFIRM PASSWORD */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={
                        securityForm.confirmPassword
                      }
                      onChange={
                        handleSecurityChange
                      }
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>

                  </div>

                </div>

                {/* PASSWORD REQUIREMENTS */}

                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">

                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    Password requirements
                  </p>

                  <div className="space-y-2">

                    <PasswordRule
                      valid={
                        passwordRules.length
                      }
                    >
                      8–15 characters
                    </PasswordRule>

                    <PasswordRule
                      valid={
                        passwordRules.number
                      }
                    >
                      At least one number
                    </PasswordRule>

                    <PasswordRule
                      valid={
                        passwordRules.lowercase
                      }
                    >
                      At least one lowercase letter
                    </PasswordRule>

                    <PasswordRule
                      valid={
                        passwordRules.uppercase
                      }
                    >
                      At least one uppercase letter
                    </PasswordRule>

                    <PasswordRule
                      valid={
                        passwordRules.special
                      }
                    >
                      At least one special character
                    </PasswordRule>

                  </div>

                </div>

                {/* ERROR */}

                {saveError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {saveError}
                  </div>
                )}

                {/* BUTTONS */}

                <div className="flex justify-end gap-3 pt-2">

                  <button
                    type="button"
                    onClick={
                      handleCloseSecurity
                    }
                    disabled={savingPassword}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      savingPassword ||
                      !isPasswordValid ||
                      !passwordsMatch
                    }
                    className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingPassword
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </>
  );
};

export default ResidentUsers;