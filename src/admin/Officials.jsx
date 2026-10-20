// src/admin/Officials.jsx
import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaSpinner,
  FaTrash,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { usePermission } from "../hooks/usePermission";

// =====================================================
// API
// =====================================================
const API_URL = "http://localhost/barangay-api/api/users.php";
const ROLES_API_URL = "http://localhost/barangay-api/api/roles.php";

// =====================================================
// TOAST COMPONENT
// =====================================================
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "text-emerald-600",
      text: "text-emerald-800",
      Icon: FaCheckCircle,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      text: "text-red-800",
      Icon: FaExclamationTriangle,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      text: "text-blue-800",
      Icon: FaInfoCircle,
    },
  }[toast.type] || {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    text: "text-emerald-800",
    Icon: FaCheckCircle,
  };

  const Icon = config.Icon;

  return (
    <div className="animate-slide-in">
      <div
        className={`flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg border ${config.bg} ${config.border} min-w-[320px] max-w-md`}
      >
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.icon}`} />
        <div className="flex-1">
          {toast.title && (
            <p className={`font-semibold text-sm ${config.text}`}>
              {toast.title}
            </p>
          )}
          <p className={`text-sm ${config.text} opacity-90 mt-0.5`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg hover:bg-black/5 ${config.text} shrink-0`}
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// =====================================================
// COMPONENT
// =====================================================
const Officials = () => {
  const { canView, canCreate, canEdit, canDelete } = usePermission();

  const hasOfficialsAccess = canView("userManagement", "officials");
  const canCreateOfficial = canCreate("userManagement", "officials");
  const canEditOfficial = canEdit("userManagement", "officials");
  const canDeleteOfficial = canDelete("userManagement", "officials");

  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [roleOptions, setRoleOptions] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // 🔑 TOASTS
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message, title = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [modalError, setModalError] = useState("");

  // CREATE MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);

  // EDIT MODAL
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // 🔑 DELETE MODAL
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // ✅ PASSWORD VISIBILITY STATES
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState("Male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState("");
  const [status, setStatus] = useState("Active");

  // =====================================================
  // VALIDATION
  // =====================================================
  const nameRegex = /^[\p{L}\s.'-]+$/u;
  const usernameRegex = /^[A-Za-z0-9_]{4,30}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phMobileRegex = /^(09\d{9}|\+639\d{9})$/;

  const isValidName = (value) => {
    const cleanValue = String(value || "").trim();
    return (
      cleanValue.length >= 2 &&
      cleanValue.length <= 50 &&
      nameRegex.test(cleanValue)
    );
  };

  const isValidUsername = (value) => {
    return usernameRegex.test(String(value || "").trim());
  };

  const isValidEmail = (value) => {
    const cleanValue = String(value || "").trim();
    return !cleanValue || emailRegex.test(cleanValue);
  };

  const normalizeMobileNumber = (value) => {
    return String(value || "").trim().replace(/[\s-]/g, "");
  };

  const isValidMobileNumber = (value) => {
    const cleanValue = normalizeMobileNumber(value);
    return !cleanValue || phMobileRegex.test(cleanValue);
  };

  const isValidDateOfBirth = (value) => {
    if (!value) return false;
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  };

  const isStrongPassword = (value) => {
    const passwordValue = String(value || "");
    return (
      passwordValue.length >= 8 &&
      passwordValue.length <= 100 &&
      /[A-Z]/.test(passwordValue) &&
      /[a-z]/.test(passwordValue) &&
      /\d/.test(passwordValue)
    );
  };

  const isDuplicateUsername = (value, excludeUserId = null) => {
    const normalizedUsername = String(value || "").trim().toLowerCase();
    if (!normalizedUsername) return false;

    return officials.some((official) => {
      if (
        excludeUserId !== null &&
        String(official?.id) === String(excludeUserId)
      ) {
        return false;
      }
      return (
        String(official?.username || "").trim().toLowerCase() ===
        normalizedUsername
      );
    });
  };

  const isDuplicateEmail = (value, excludeUserId = null) => {
    const normalizedEmail = String(value || "").trim().toLowerCase();
    if (!normalizedEmail) return false;

    return officials.some((official) => {
      if (
        excludeUserId !== null &&
        String(official?.id) === String(excludeUserId)
      ) {
        return false;
      }
      return (
        String(official?.emailAddress || official?.email || "")
          .trim()
          .toLowerCase() === normalizedEmail
      );
    });
  };

  const validateCreateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!firstName.trim()) return "First Name is required.";
      if (!isValidName(firstName))
        return "First Name must contain letters, spaces, apostrophes, or hyphens only.";
      if (!lastName.trim()) return "Last Name is required.";
      if (!isValidName(lastName))
        return "Last Name must contain letters, spaces, apostrophes, or hyphens only.";
      if (!dateOfBirth) return "Date of Birth is required.";
      if (!isValidDateOfBirth(dateOfBirth))
        return "Date of Birth must be a valid date and cannot be in the future.";
      if (!isValidEmail(emailAddress))
        return "Please enter a valid email address.";
      if (isDuplicateEmail(emailAddress))
        return "Email address already exists. Please use another email address.";
      if (!isValidMobileNumber(mobileNumber))
        return "Please enter a valid Philippine mobile number (e.g. 09123456789).";
    }

    if (currentStep === 2) {
      if (!username.trim()) return "Username is required.";
      if (!isValidUsername(username))
        return "Username must be 4–30 characters and may contain letters, numbers, and underscores only.";
      if (isDuplicateUsername(username))
        return "Username already exists. Please choose another username.";
      if (!password) return "Password is required.";
      if (!isStrongPassword(password))
        return "Password must be 8–100 characters and contain at least one uppercase letter, one lowercase letter, and one number.";
    }

    if (currentStep === 3) {
      if (!roles) return "Please select a user role.";
      const selectedRole = getRoleByName(roles);
      if (!selectedRole) return "Invalid role selected.";
      if (!["Active", "Inactive"].includes(status))
        return "Invalid account status.";
    }

    return "";
  };

  // =====================================================
  // FETCH USERS
  // =====================================================
  const fetchOfficials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error(
          "Users API did not return JSON. Check users.php and CORS."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users.");
      }

      let users = [];
      if (Array.isArray(data)) users = data;
      else if (data.data && Array.isArray(data.data)) users = data.data;
      else if (data.users && Array.isArray(data.users)) users = data.users;

      setOfficials(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      setOfficials([]);
      showToast(
        "error",
        error.message || "Unable to load users from database.",
        "Load Failed"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // FETCH ROLES
  // =====================================================
  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const response = await fetch(ROLES_API_URL);

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error(
          "Roles API did not return JSON. Check roles.php and CORS."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch roles.");
      }

      if (data.success && Array.isArray(data.data)) {
        setRoleOptions(data.data);
      } else if (Array.isArray(data.data)) {
        setRoleOptions(data.data);
      } else if (Array.isArray(data.roles)) {
        setRoleOptions(data.roles);
      } else if (Array.isArray(data)) {
        setRoleOptions(data);
      } else {
        setRoleOptions([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoleOptions([]);
      showToast(
        "error",
        error.message || "Unable to load roles from database.",
        "Load Failed"
      );
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfficials();
    fetchRoles();
  }, [fetchOfficials, fetchRoles]);

  // =====================================================
  // HELPERS
  // =====================================================
  const getRoleByName = (roleName) => {
    if (!roleName) return null;
    return roleOptions.find(
      (role) =>
        String(role.name || "").trim().toLowerCase() ===
        String(roleName || "").trim().toLowerCase()
    );
  };

  const getRoleName = (roleName) => {
    const roleData = getRoleByName(roleName);
    return roleData?.name || roleName || "";
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setSex("Male");
    setDateOfBirth("");
    setEmailAddress("");
    setMobileNumber("");
    setUsername("");
    setPassword("");
    setRoles("");
    setStatus("Active");
    setModalError("");
    setStep(1);
    setEditingUserId(null);
    // ✅ Reset password visibility
    setShowCreatePassword(false);
    setShowEditPassword(false);
  };

  // =====================================================
  // OPEN/CLOSE CREATE MODAL
  // =====================================================
  const openCreateModal = async () => {
    resetForm();
    await fetchRoles();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    resetForm();
  };

  // =====================================================
  // CREATE USER
  // =====================================================
  const handleAddOfficial = async (e) => {
    e.preventDefault();
    setModalError("");

    for (const currentStep of [1, 2, 3]) {
      const validationError = validateCreateStep(currentStep);
      if (validationError) {
        setModalError(validationError);
        setStep(currentStep);
        return;
      }
    }

    const selectedRole = getRoleByName(roles);
    if (!selectedRole) {
      setModalError("Invalid role selected.");
      setStep(3);
      return;
    }

    const newUserData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      sex,
      dateOfBirth,
      emailAddress: emailAddress.trim(),
      mobileNumber: normalizeMobileNumber(mobileNumber),
      username: username.trim(),
      password,
      role: selectedRole.name,
      status,
    };

    try {
      setSaving(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Users API did not return JSON.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create user.");
      }

      showToast("success", "User created successfully!", "User Created");
      await fetchOfficials();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding user:", error);
      setModalError(error.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT USER — OPEN
  // =====================================================
  const handleEditOfficial = async (official) => {
    if (!official?.id) {
      showToast("error", "Invalid user ID.", "Error");
      return;
    }

    setEditingUserId(official.id);
    setFirstName(official.firstName || "");
    setLastName(official.lastName || "");
    setSex(official.sex || "Male");
    setDateOfBirth(official.dateOfBirth || "");
    setEmailAddress(official.emailAddress || "");
    setMobileNumber(official.mobileNumber || "");
    setUsername(official.username || "");
    setPassword("");

    const matchedRole = getRoleByName(official.role);
    setRoles(matchedRole ? matchedRole.name : official.role || "");
    setStatus(official.status || "Active");
    setModalError("");
    // ✅ Reset password visibility sa edit
    setShowEditPassword(false);

    await fetchRoles();
    setIsEditModalOpen(true);
  };

  // =====================================================
  // UPDATE USER
  // =====================================================
  const handleUpdateOfficial = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!firstName.trim()) {
      setModalError("First Name is required.");
      return;
    }
    if (!isValidName(firstName)) {
      setModalError(
        "First Name must contain letters, spaces, apostrophes, or hyphens only."
      );
      return;
    }
    if (!lastName.trim()) {
      setModalError("Last Name is required.");
      return;
    }
    if (!isValidName(lastName)) {
      setModalError(
        "Last Name must contain letters, spaces, apostrophes, or hyphens only."
      );
      return;
    }
    if (dateOfBirth && !isValidDateOfBirth(dateOfBirth)) {
      setModalError(
        "Date of Birth must be a valid date and cannot be in the future."
      );
      return;
    }
    if (!isValidEmail(emailAddress)) {
      setModalError("Please enter a valid email address.");
      return;
    }
    if (isDuplicateEmail(emailAddress, editingUserId)) {
      setModalError(
        "Email address already exists. Please use another email address."
      );
      return;
    }
    if (!isValidMobileNumber(mobileNumber)) {
      setModalError(
        "Please enter a valid Philippine mobile number (e.g. 09123456789)."
      );
      return;
    }
    if (!username.trim()) {
      setModalError("Username is required.");
      return;
    }
    if (!isValidUsername(username)) {
      setModalError(
        "Username must be 4–30 characters and may contain letters, numbers, and underscores only."
      );
      return;
    }
    if (isDuplicateUsername(username, editingUserId)) {
      setModalError("Username already exists. Please choose another username.");
      return;
    }
    if (!roles) {
      setModalError("Please select a user role.");
      return;
    }

    const selectedRole = getRoleByName(roles);
    if (!selectedRole) {
      setModalError("Invalid role selected.");
      return;
    }
    if (!["Active", "Inactive"].includes(status)) {
      setModalError("Invalid account status.");
      return;
    }
    if (password.trim() && !isStrongPassword(password)) {
      setModalError(
        "New password must be 8–100 characters and contain at least one uppercase letter, one lowercase letter, and one number."
      );
      return;
    }

    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      sex,
      dateOfBirth,
      emailAddress: emailAddress.trim(),
      mobileNumber: normalizeMobileNumber(mobileNumber),
      username: username.trim(),
      role: selectedRole.name,
      status,
    };

    if (password.trim()) {
      updateData.password = password;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_URL}?id=${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Users API did not return JSON.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user.");
      }

      showToast("success", "User updated successfully!", "User Updated");
      await fetchOfficials();
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating user:", error);
      setModalError(error.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const closeEditModal = () => {
    if (saving) return;
    setIsEditModalOpen(false);
    resetForm();
  };

  // =====================================================
  // 🔑 DELETE — Custom Modal
  // =====================================================
  const handleDeleteOfficial = (id) => {
    if (!id) {
      showToast("error", "Invalid user ID.", "Error");
      return;
    }

    const user = officials.find(
      (o) => String(o.id) === String(id)
    );

    if (user) {
      setDeleteModalUser(user);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModalUser) return;

    const user = deleteModalUser;
    setDeleteModalUser(null);
    setDeleting(true);

    try {
      const response = await fetch(`${API_URL}?id=${user.id}`, {
        method: "DELETE",
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Users API did not return JSON.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user.");
      }

      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

      showToast(
        "success",
        `${fullName || "User"} has been deleted.`,
        "User Deleted"
      );

      setOfficials((prev) =>
        prev.filter((u) => String(u.id) !== String(user.id))
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast(
        "error",
        error.message || "Failed to delete user.",
        "Delete Failed"
      );
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================
  const filteredOfficials = officials.filter((official) => {
    const fullName = `${official?.firstName || ""} ${
      official?.lastName || ""
    }`.toLowerCase();
    const uname = (official?.username || "").toLowerCase();
    const role = (official?.role || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    return (
      fullName.includes(query) ||
      uname.includes(query) ||
      role.includes(query)
    );
  });

  // =====================================================
  // ROLE STYLE
  // =====================================================
  const getRoleStyle = (roleValue) => {
    const roleData = getRoleByName(roleValue);
    const color = roleData?.color || "#6B7280";

    return {
      backgroundColor: `${color}15`,
      color: color,
      borderColor: `${color}40`,
    };
  };

  const handleNextStep = () => {
    setModalError("");
    const validationError = validateCreateStep(step);
    if (validationError) {
      setModalError(validationError);
      return;
    }
    setStep((prev) => prev + 1);
  };

  // =====================================================
  // ✅ ACCESS DENIED
  // =====================================================
  if (!hasOfficialsAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <FaExclamationTriangle className="text-red-500 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-2">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="space-y-6 relative">
      {/* 🔑 TOASTS */}
      <div className="fixed top-6 right-6 z-[9999] space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>

        <div className="flex flex-wrap items-center gap-3">
          {canCreateOfficial && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              + Create User
            </button>
          )}

          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 pl-9 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0"
              />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                &times;
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchOfficials}
            title="Refresh List"
            className="inline-flex items-center justify-center p-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
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
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="py-3 px-6 font-semibold">Full Name</th>
                <th className="py-3 px-6 font-semibold">Username</th>
                <th className="py-3 px-6 font-semibold">Role</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                {(canEditOfficial || canDeleteOfficial) && (
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={canEditOfficial || canDeleteOfficial ? 5 : 4}
                    className="py-6 text-center text-gray-400"
                  >
                    <FaSpinner className="animate-spin inline mr-2" />
                    Loading users...
                  </td>
                </tr>
              ) : filteredOfficials.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEditOfficial || canDeleteOfficial ? 5 : 4}
                    className="py-6 text-center text-gray-400"
                  >
                    No user records found.
                  </td>
                </tr>
              ) : (
                filteredOfficials.map((official, index) => {
                  const key = official?.id
                    ? String(official.id)
                    : `row-${index}`;

                  const initials =
                    `${official?.firstName?.[0] || ""}${
                      official?.lastName?.[0] || ""
                    }`.toUpperCase() || "U";

                  const roleName =
                    getRoleName(official?.role) || official?.role || "-";

                  return (
                    <tr
                      key={key}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {initials}
                          </div>
                          <span className="font-medium text-gray-900">
                            {official?.firstName || ""} {official?.lastName || ""}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                        {official?.username || "-"}
                      </td>

                      <td className="py-4 px-6">
                        {roleName !== "-" ? (
                          <span
                            className="px-2 py-0.5 text-xs font-medium rounded border"
                            style={getRoleStyle(official?.role)}
                          >
                            {roleName}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            official?.status === "Inactive"
                              ? "bg-rose-50 text-rose-600 border border-rose-100"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}
                        >
                          {official?.status || "Active"}
                        </span>
                      </td>

                      {(canEditOfficial || canDeleteOfficial) && (
                        <td className="py-4 px-6 text-right space-x-2">
                          {canEditOfficial && (
                            <button
                              type="button"
                              onClick={() => handleEditOfficial(official)}
                              className="text-emerald-600 hover:text-emerald-900 font-medium text-xs bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                          )}

                          {canDeleteOfficial && (
                            <button
                              type="button"
                              onClick={() => handleDeleteOfficial(official?.id)}
                              className="text-red-600 hover:text-red-900 font-medium text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          )}

                          {!canEditOfficial && !canDeleteOfficial && (
                            <span className="text-gray-400 text-xs italic">
                              View Only
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
              <h3 className="font-bold text-lg text-gray-800">Add New User</h3>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light disabled:opacity-50 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="px-8 py-6 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 z-0"></div>

                {[
                  { num: 1, label: "General Information" },
                  { num: 2, label: "Security" },
                  { num: 3, label: "Roles" },
                  { num: 4, label: "Overview" },
                ].map((s) => (
                  <div
                    key={s.num}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        step === s.num
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                          : step > s.num
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-gray-500 border border-gray-300"
                      }`}
                    >
                      {step > s.num ? "✓" : s.num}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        step === s.num
                          ? "text-emerald-700 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {modalError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-center justify-between">
                  <span>{modalError}</span>
                  <button
                    type="button"
                    onClick={() => setModalError("")}
                    className="text-rose-500 hover:text-rose-800 font-bold ml-2 text-base"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Personal Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                        Sex
                      </label>
                      <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        required
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">
                      Contact Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                        placeholder="Email Address"
                      />
                      <div className="relative">
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 flex items-center gap-1.5 px-3 border-r border-gray-300 bg-gray-50 rounded-l-lg text-sm font-medium text-gray-700 pointer-events-none">
                            <span className="text-base" role="img" aria-label="Philippines flag">
                              🇵🇭
                            </span>
                          </div>
                          <input
                            type="tel"
                            value={mobileNumber}
                            onChange={(e) =>
                              setMobileNumber(
                                e.target.value.replace(/[^0-9+\s-]/g, "")
                              )
                            }
                            className="w-full pl-12 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="09123456789"
                            maxLength={13}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 uppercase">
                    Account Credentials
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                      placeholder="Enter username"
                    />
                  </div>

                  {/* ✅ PASSWORD WITH EYE TOGGLE */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCreatePassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        tabIndex={-1}
                        title={showCreatePassword ? "Hide password" : "Show password"}
                      >
                        {showCreatePassword ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 uppercase">
                    Assign Role & Permissions
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Role
                    </label>
                    <select
                      required
                      value={roles}
                      onChange={(e) => setRoles(e.target.value)}
                      disabled={rolesLoading}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {rolesLoading ? "Loading roles..." : "Select Role"}
                      </option>
                      {!rolesLoading && roleOptions.length === 0 && (
                        <option value="" disabled>
                          No roles available
                        </option>
                      )}
                      {roleOptions.map((role) => (
                        <option key={role.id} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-gray-500">
                    Select an appropriate system role.
                  </p>

                  {roles && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <p className="text-xs text-emerald-700">
                        Selected role:{" "}
                        <span className="font-semibold">{getRoleName(roles)}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 uppercase">
                    Review Summary
                  </h4>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2 gap-4">
                      <span className="text-gray-500">Full Name:</span>
                      <span className="font-medium text-gray-800">
                        {firstName} {lastName}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2 gap-4">
                      <span className="text-gray-500">Sex / DOB:</span>
                      <span className="font-medium text-gray-800">
                        {sex} / {dateOfBirth || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2 gap-4">
                      <span className="text-gray-500">Contact:</span>
                      <span className="font-medium text-gray-800">
                        {emailAddress || "-"} | {mobileNumber || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2 gap-4">
                      <span className="text-gray-500">Username:</span>
                      <span className="font-medium text-gray-800">
                        {username}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2 gap-4">
                      <span className="text-gray-500">Role:</span>
                      <span
                        className="font-medium px-2 py-0.5 rounded border"
                        style={getRoleStyle(roles)}
                      >
                        {getRoleName(roles) || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium text-gray-800">{status}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setModalError("");
                    setStep((prev) => prev - 1);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleAddOfficial}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" size={12} />
                      Saving...
                    </>
                  ) : (
                    "Submit User"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
              <h3 className="font-bold text-lg text-gray-800">Edit User</h3>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light disabled:opacity-50 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={handleUpdateOfficial}
              className="p-6 space-y-5 overflow-y-auto flex-1"
            >
              {modalError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-center justify-between">
                  <span>{modalError}</span>
                  <button
                    type="button"
                    onClick={() => setModalError("")}
                    className="text-rose-500 hover:text-rose-800 font-bold ml-2 text-base"
                  >
                    &times;
                  </button>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                  Personal Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Sex
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth || ""}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">
                  Contact Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailAddress || ""}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center gap-1.5 px-3 border-r border-gray-300 bg-gray-50 rounded-l-lg text-sm font-medium text-gray-700 pointer-events-none">
                        <span className="text-base" role="img" aria-label="Philippines flag">
                          🇵🇭
                        </span>
                      </div>
                      <input
                        type="tel"
                        value={mobileNumber || ""}
                        onChange={(e) =>
                          setMobileNumber(
                            e.target.value.replace(/[^0-9+\s-]/g, "")
                          )
                        }
                        placeholder="09123456789"
                        className="w-full pl-12 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        maxLength={13}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">
                  Account Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  {/* ✅ NEW PASSWORD WITH EYE TOGGLE */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                        className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        tabIndex={-1}
                        title={showEditPassword ? "Hide password" : "Show password"}
                      >
                        {showEditPassword ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Leave blank if you don't want to change the password.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Role
                </label>
                <select
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                  disabled={rolesLoading}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100"
                >
                  <option value="">
                    {rolesLoading ? "Loading roles..." : "Select Role"}
                  </option>
                  {roleOptions.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>

                {roles && (
                  <div className="mt-2">
                    <span
                      className="inline-block px-2.5 py-1 text-xs font-medium rounded border"
                      style={getRoleStyle(roles)}
                    >
                      {getRoleName(roles) || "-"}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" size={12} />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteModalUser && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeleteModalUser(null)}
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
                    Delete User?
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  You are about to permanently delete the user{" "}
                  <span className="font-bold">
                    {deleteModalUser.firstName}{" "}
                    {deleteModalUser.lastName}
                  </span>
                  {deleteModalUser.username && (
                    <>
                      {" "}
                      (<span className="font-mono">{deleteModalUser.username}</span>)
                    </>
                  )}
                  . All associated data will be removed.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalUser(null)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <FaSpinner className="animate-spin" size={12} /> Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash size={12} /> Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Officials;