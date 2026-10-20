// src/admin/Roles.jsx
import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";
import { usePermission } from "../hooks/usePermission";

// =====================================================
// API
// =====================================================
const API_URL = "http://localhost/barangay-api/api/roles.php";

// =====================================================
// DEFAULT PERMISSIONS
// =====================================================
const defaultPermissions = {
  userManagement: {
    officials: { create: false, view: false, edit: false, delete: false },
    residents: { create: false, view: false, edit: false, delete: false },
    roles: { create: false, view: false, edit: false, delete: false },
  },
  residentsRecord: {
    residentsList: { create: false, view: false, edit: false, delete: false },
  },
  communityHousehold: {
    households: { create: false, view: false, edit: false, delete: false },
  },
  certificateIssuance: {
    certificates: { create: false, view: false, edit: false, delete: false },
  },
  serviceRequests: {
    requests: { create: false, view: false, edit: false, delete: false },
  },
  blotterRecords: {
    blotter: { create: false, view: false, edit: false, delete: false },
  },
  incidentReports: {
    incidents: { create: false, view: false, edit: false, delete: false },
  },
  reportsModule: {
    reports: { create: false, view: false, edit: false, delete: false },
  },
  settingsModule: {
    settings: { create: false, view: false, edit: false, delete: false },
  },
};

// =====================================================
// COLOR OPTIONS
// =====================================================
const colorOptions = [
  { className: "bg-red-500", hex: "#EF4444", light: "#FEF2F2", text: "#DC2626" },
  { className: "bg-pink-500", hex: "#EC4899", light: "#FDF2F8", text: "#DB2777" },
  { className: "bg-purple-500", hex: "#A855F7", light: "#FAF5FF", text: "#9333EA" },
  { className: "bg-indigo-500", hex: "#6366F1", light: "#EEF2FF", text: "#4F46E5" },
  { className: "bg-blue-500", hex: "#3B82F6", light: "#EFF6FF", text: "#2563EB" },
  { className: "bg-cyan-500", hex: "#06B6D4", light: "#ECFEFF", text: "#0891B2" },
  { className: "bg-teal-500", hex: "#14B8A6", light: "#F0FDFA", text: "#0F766E" },
  { className: "bg-emerald-500", hex: "#10B981", light: "#ECFDF5", text: "#059669" },
  { className: "bg-green-500", hex: "#22C55E", light: "#F0FDF4", text: "#16A34A" },
  { className: "bg-lime-500", hex: "#84CC16", light: "#F7FEE7", text: "#65A30D" },
  { className: "bg-yellow-500", hex: "#EAB308", light: "#FEFCE8", text: "#CA8A04" },
  { className: "bg-amber-500", hex: "#F59E0B", light: "#FFFBEB", text: "#D97706" },
  { className: "bg-orange-500", hex: "#F97316", light: "#FFF7ED", text: "#EA580C" },
  { className: "bg-gray-500", hex: "#6B7280", light: "#F9FAFB", text: "#4B5563" },
];

// =====================================================
// GET COLOR INFO
// =====================================================
const getColorInfo = (color) => {
  if (!color) {
    return { hex: "#00A878", light: "#ECFDF5", text: "#059669" };
  }

  if (color.startsWith("#")) {
    return { hex: color, light: `${color}18`, text: color };
  }

  const found = colorOptions.find((item) => item.className === color);
  if (found) return found;

  return { hex: "#00A878", light: "#ECFDF5", text: "#059669" };
};

// =====================================================
// FIND COLOR CLASS BY HEX
// =====================================================
const findColorClassByHex = (hex) => {
  if (!hex) return "bg-emerald-500";

  const found = colorOptions.find(
    (item) => item.hex.toLowerCase() === String(hex).toLowerCase()
  );

  return found?.className || "bg-emerald-500";
};

// =====================================================
// TOAST
// =====================================================
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config =
    {
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
// ROLES COMPONENT
// =====================================================
const Roles = () => {
  // ✅ Permissions hook
  const { canView, canCreate, canEdit, canDelete } = usePermission();

  // ✅ Check kung may access sa Roles module
  const hasRolesAccess = canView("userManagement", "roles");
  const canCreateRole = canCreate("userManagement", "roles");
  const canEditRole = canEdit("userManagement", "roles");
  const canDeleteRole = canDelete("userManagement", "roles");

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);

  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-emerald-500");
  const [permissions, setPermissions] = useState(
    JSON.parse(JSON.stringify(defaultPermissions))
  );
  const [saving, setSaving] = useState(false);

  const [deleteModalRole, setDeleteModalRole] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toasts, setToasts] = useState([]);

  const showToast = (type, message, title = "") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const selectedColorInfo = getColorInfo(selectedColor);

  // =====================================================
  // FETCH ROLES
  // =====================================================
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Roles API Response:", result);

      if (result.success) {
        setRoles(result.data || []);
      } else {
        console.error("Failed to fetch roles:", result.message);
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
      showToast("error", "Failed to load roles.", "Connection Error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HANDLE CHECKBOX
  // =====================================================
  const handleCheckboxChange = (section, subModule, action) => {
    setPermissions((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subModule]: {
          ...prev[section][subModule],
          [action]: !prev[section][subModule][action],
        },
      },
    }));
  };

  // =====================================================
  // RESET FORM
  // =====================================================
  const resetForm = () => {
    setRoleName("");
    setRoleDescription("");
    setSelectedColor("bg-emerald-500");
    setPermissions(JSON.parse(JSON.stringify(defaultPermissions)));
    setSaving(false);
    setEditingRoleId(null);
  };

  // =====================================================
  // OPEN CREATE MODAL
  // =====================================================
  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================
  const handleEditRole = (role) => {
    setEditingRoleId(role.id);
    setRoleName(role.name || "");
    setRoleDescription(role.description || "");
    setSelectedColor(findColorClassByHex(role.color));

    const mergedPermissions = JSON.parse(JSON.stringify(defaultPermissions));
    const rolePerms = role.permissions || {};

    Object.keys(mergedPermissions).forEach((section) => {
      Object.keys(mergedPermissions[section]).forEach((module) => {
        if (rolePerms[section] && rolePerms[section][module]) {
          mergedPermissions[section][module] = {
            ...mergedPermissions[section][module],
            ...rolePerms[section][module],
          };
        }
      });
    });

    setPermissions(mergedPermissions);
    setIsModalOpen(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================
  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    resetForm();
  };

  // =====================================================
  // SAVE ROLE
  // =====================================================
  const handleSubmitRole = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      showToast("error", "Please enter a role name.", "Missing Field");
      return;
    }

    const selectedColorData = colorOptions.find(
      (item) => item.className === selectedColor
    );

    const colorToSave = selectedColorData?.hex || "#00A878";

    const roleData = {
      name: roleName.trim(),
      description: roleDescription.trim(),
      color: colorToSave,
      permissions: permissions,
    };

    try {
      setSaving(true);

      let response;
      if (editingRoleId) {
        response = await fetch(`${API_URL}?id=${editingRoleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roleData),
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roleData),
        });
      }

      const result = await response.json();

      if (response.ok && result.success) {
        showToast(
          "success",
          `Role "${roleName.trim()}" ${
            editingRoleId ? "updated" : "created"
          } successfully.`,
          editingRoleId ? "Role Updated" : "Role Created"
        );

        await fetchRoles();
        resetForm();
        setIsModalOpen(false);
      } else {
        showToast(
          "error",
          result.message || "Failed to save role.",
          "Save Failed"
        );
      }
    } catch (error) {
      console.error("Error saving role:", error);
      showToast(
        "error",
        "Unable to connect to the Roles API.",
        "Connection Error"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE ROLE
  // =====================================================
  const handleDeleteRole = (id) => {
    const roleToDelete = roles.find((role) => String(role.id) === String(id));
    if (roleToDelete) setDeleteModalRole(roleToDelete);
  };

  const confirmDelete = async () => {
    if (!deleteModalRole) return;

    const role = deleteModalRole;
    setDeleteModalRole(null);
    setDeleting(true);

    try {
      const response = await fetch(`${API_URL}?id=${role.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast(
          "success",
          `Role "${role.name}" deleted successfully.`,
          "Role Deleted"
        );
        await fetchRoles();
      } else {
        showToast(
          "error",
          result.message || "Failed to delete role.",
          "Delete Failed"
        );
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      showToast("error", "Unable to connect to Roles API.", "Connection Error");
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // PERMISSION GROUPS
  // =====================================================
  const permissionGroups = [
    {
      section: "userManagement",
      title: "User Management",
      modules: [
        { key: "officials", label: "Officials" },
        { key: "residents", label: "Residents" },
        { key: "roles", label: "Roles" },
      ],
    },
    {
      section: "residentsRecord",
      title: "Residents Record",
      modules: [{ key: "residentsList", label: "Residents List" }],
    },
    {
      section: "communityHousehold",
      title: "Community Household",
      modules: [{ key: "households", label: "Households" }],
    },
    {
      section: "certificateIssuance",
      title: "Certificate Issuance",
      modules: [{ key: "certificates", label: "Certificates" }],
    },
    {
      section: "serviceRequests",
      title: "Service Requests",
      modules: [{ key: "requests", label: "Requests" }],
    },
    {
      section: "blotterRecords",
      title: "Blotter Records",
      modules: [{ key: "blotter", label: "Blotter" }],
    },
    {
      section: "incidentReports",
      title: "Incident Reports",
      modules: [{ key: "incidents", label: "Incidents" }],
    },
    {
      section: "reportsModule",
      title: "Reports",
      modules: [{ key: "reports", label: "System Reports" }],
    },
    {
      section: "settingsModule",
      title: "Settings",
      modules: [{ key: "settings", label: "System Settings" }],
    },
  ];

  const actions = ["create", "view", "edit", "delete"];

  // =====================================================
  // ✅ ACCESS DENIED
  // =====================================================
  if (!hasRolesAccess) {
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
    <div className="space-y-6">
      <div className="fixed top-6 right-6 z-[100] space-y-3">
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
        <h1 className="text-2xl font-bold text-gray-800">
          Roles & Permissions
        </h1>

        {/* ✅ CREATE ROLE BUTTON — naka-filter */}
        {canCreateRole && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            + Create Role
          </button>
        )}
      </div>

      {/* ROLES TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="py-3 px-6 font-semibold">Role Name</th>
                <th className="py-3 px-6 font-semibold">Description</th>
                {/* ✅ ACTIONS COLUMN — kita lang kung may edit o delete */}
                {(canEditRole || canDeleteRole) && (
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={canEditRole || canDeleteRole ? 3 : 2}
                    className="py-6 text-center text-gray-400"
                  >
                    <FaSpinner className="animate-spin inline mr-2" />
                    Loading roles...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEditRole || canDeleteRole ? 3 : 2}
                    className="py-6 text-center text-gray-400"
                  >
                    No roles found in database.
                  </td>
                </tr>
              ) : (
                roles.map((role) => {
                  const colorInfo = getColorInfo(role.color);

                  return (
                    <tr
                      key={role.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border"
                          style={{
                            backgroundColor: colorInfo.light,
                            color: colorInfo.text,
                            borderColor: `${colorInfo.hex}35`,
                          }}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full mr-2"
                            style={{ backgroundColor: colorInfo.hex }}
                          ></span>
                          {role.name}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-gray-500">
                        {role.description || "No description"}
                      </td>

                      {/* ✅ ACTIONS — naka-filter */}
                      {(canEditRole || canDeleteRole) && (
                        <td className="py-4 px-6 text-right space-x-2">
                          {canEditRole && (
                            <button
                              type="button"
                              onClick={() => handleEditRole(role)}
                              className="text-emerald-600 hover:text-emerald-900 font-medium text-xs bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                          )}

                          {canDeleteRole && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-red-600 hover:text-red-900 font-medium text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          )}

                          {!canEditRole && !canDeleteRole && (
                            <span className="text-gray-400">—</span>
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

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-bold text-lg text-gray-800">
                {editingRoleId ? "Edit Role" : "Add New Role"}
              </h3>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light disabled:opacity-50 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={handleSubmitRole}
              className="p-6 space-y-6 overflow-y-auto flex-1"
            >
              {/* NAME */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </label>
                <input
                  type="text"
                  required
                  maxLength="55"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-right text-xs text-gray-400">
                  Max 55 characters {roleName.length}/55
                </p>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows="2"
                  maxLength="110"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <p className="text-right text-xs text-gray-400">
                  Max 110 characters {roleDescription.length}/110
                </p>
              </div>

              {/* COLOR PICKER */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-2 overflow-x-auto">
                {colorOptions.map((color) => (
                  <button
                    key={color.className}
                    type="button"
                    title={color.hex}
                    onClick={() => setSelectedColor(color.className)}
                    className={`w-6 h-6 rounded-full ${color.className} transition-transform cursor-pointer ${
                      selectedColor === color.className
                        ? "ring-4 ring-offset-2 ring-emerald-400 scale-110"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>

              {/* PREVIEW */}
              <div
                className="w-full py-3 px-4 rounded-lg flex items-center transition-colors duration-200"
                style={{ backgroundColor: selectedColorInfo.light }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: selectedColorInfo.text }}
                >
                  {roleName || "Role name preview"}
                </span>
              </div>

              {/* PERMISSIONS */}
              <div className="pt-2">
                <p className="text-sm font-semibold text-gray-700">
                  Select which permissions to activate for access control.
                </p>
              </div>

              <div className="space-y-6 border-t border-gray-100 pt-4">
                {permissionGroups.map((group) => (
                  <div key={group.section} className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded">
                      {group.title}
                    </h4>

                    {group.modules.map((module) => (
                      <div
                        key={module.key}
                        className="pl-3 space-y-2 border-l-2 border-emerald-200 ml-2"
                      >
                        <span className="text-xs font-semibold text-gray-700 block">
                          {module.label}
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {actions.map((action) => (
                            <label
                              key={action}
                              className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer capitalize"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  permissions[group.section][module.key][action]
                                }
                                onChange={() =>
                                  handleCheckboxChange(
                                    group.section,
                                    module.key,
                                    action
                                  )
                                }
                                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                              />
                              <span>{action}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 sticky bottom-0 bg-white py-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" size={12} />
                      Saving...
                    </>
                  ) : editingRoleId ? (
                    "Update Role"
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteModalRole && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeleteModalRole(null)}
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
                    Delete Role?
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  You are about to permanently delete the role{" "}
                  <span className="font-bold">"{deleteModalRole.name}"</span>.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalRole(null)}
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

export default Roles;