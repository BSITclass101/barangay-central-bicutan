// src/admin/CommunityHousehold.jsx
import { useState, useRef, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaTimes,
  FaSync,
  FaExclamationCircle,
  FaInfoCircle,
  FaEye,
  FaEdit,
  FaEllipsisH,
} from "react-icons/fa";
import { usePermission } from "../hooks/usePermission";
// ✅ INALIS: useAuth — hindi na kailangan

// ====== API URL ======
const API_URL = "http://localhost/barangay-api/api";

const CommunityHousehold = () => {
  // ✅ Permission hooks
  const { canView, canCreate, canEdit, canDelete } = usePermission();

  // ✅ Permission shortcuts base sa Access Control
  const hasAccess = canView("communityHousehold", "households");
  const canAddHousehold = canCreate("communityHousehold", "households");
  const canEditHousehold = canEdit("communityHousehold", "households");
  const canDeleteHousehold = canDelete("communityHousehold", "households");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  // ====== DATA FROM DATABASE ======
  const [households, setHouseholds] = useState([]);
  const [residents, setResidents] = useState([]);
  const [residentsInHousehold, setResidentsInHousehold] = useState({});
  const [loading, setLoading] = useState(false);

  // ====== TOOLTIP STATE ======
  const [showTooltip, setShowTooltip] = useState(false);

  // ====== ERROR NOTIFICATION ======
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  // ====== DROPDOWN MENU STATE ======
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // ====== VIEW DETAILS MODAL ======
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingHousehold, setViewingHousehold] = useState(null);

  // ====== EDIT MODE ======
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // ====== DELETE CONFIRMATION MODAL ======
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState(null);

  // ====== FORM STATE ======
  const [formData, setFormData] = useState({
    address: "",
    mobile: "",
    notes: "",
  });

  const [householdHead, setHouseholdHead] = useState(null);
  const [members, setMembers] = useState([]);

  // ====== SEARCH RESIDENT MODAL STATE ======
  const [showResidentModal, setShowResidentModal] = useState(false);
  const [residentModalType, setResidentModalType] = useState("head");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualData, setManualData] = useState({
    name: "",
    dob: "",
    sex: "",
    mobile: "",
    relationship: "",
  });

  // ✅ WALANG refreshUser() — walang CORS error

  // ====== FETCH HOUSEHOLDS SA MOUNT ======
  useEffect(() => {
    fetchHouseholds();
  }, []);

  const fetchHouseholds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/households.php`);
      const data = await res.json();
      setHouseholds(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch households:", error);
      showErrorNotification("Failed to load households.");
    }
    setLoading(false);
  };

  // ====== SEARCH RESIDENTS (DEBOUNCED) ======
  useEffect(() => {
    if (!showResidentModal || isManualInput) return;

    const timeout = setTimeout(async () => {
      try {
        const url = searchQuery
          ? `${API_URL}/residents_for_household.php?search=${encodeURIComponent(searchQuery)}`
          : `${API_URL}/residents_for_household.php`;
        const res = await fetch(url);
        const data = await res.json();
        setResidents(Array.isArray(data) ? data : []);

        const excludeId =
          isEditing && editingIndex !== null
            ? households[editingIndex]?.id
            : null;
        const batchUrl = `${API_URL}/check_households_batch.php${
          excludeId ? `?exclude_household_id=${excludeId}` : ""
        }`;
        const batchRes = await fetch(batchUrl);
        const batchData = await batchRes.json();
        const statusMap = {};
        (batchData.in_household || []).forEach((id) => {
          statusMap[id] = true;
        });
        setResidentsInHousehold(statusMap);
      } catch (error) {
        console.error("Failed to fetch residents:", error);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    searchQuery,
    showResidentModal,
    isManualInput,
    households,
    isEditing,
    editingIndex,
  ]);

  // ====== CLOSE DROPDOWN KAPAG CLINICK SA LABAS ======
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ====== HELPER: Ipakita ang error ======
  const showErrorNotification = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openHeadModal = () => {
    setResidentModalType("head");
    setShowResidentModal(true);
    resetResidentModal();
  };

  const openMemberModal = () => {
    setResidentModalType("member");
    setShowResidentModal(true);
    resetResidentModal();
  };

  const resetResidentModal = () => {
    setSearchQuery("");
    setSelectedResident(null);
    setIsManualInput(false);
    setManualData({ name: "", dob: "", sex: "", mobile: "", relationship: "" });
  };

  const handleSaveHead = () => {
    if (isManualInput) {
      if (!manualData.name) return alert("Please enter a name.");
      setHouseholdHead({ ...manualData, id: `MANUAL-${Date.now()}` });
    } else {
      if (!selectedResident) return alert("Please select a resident.");
      setHouseholdHead(selectedResident);
    }
    setShowResidentModal(false);
  };

  const handleAddMember = () => {
    let newMember = null;
    if (isManualInput) {
      if (!manualData.name || !manualData.relationship)
        return alert("Please fill in Name and Relationship.");
      newMember = { ...manualData, id: `MANUAL-${Date.now()}` };
    } else {
      if (!selectedResident || !manualData.relationship)
        return alert("Please select a resident and fill in Relationship.");
      newMember = { ...selectedResident, relationship: manualData.relationship };
    }
    setMembers([...members, newMember]);
    setShowResidentModal(false);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSaveHousehold = async () => {
    if (isEditing && !canEditHousehold) return;
    if (!isEditing && !canAddHousehold) return;

    if (!householdHead) return alert("Please select a Household Head.");

    const payload = {
      address: formData.address,
      mobile: formData.mobile,
      notes: formData.notes,
      head: householdHead,
      members: members,
    };

    try {
      let res;
      if (isEditing) {
        const householdId = households[editingIndex].id;
        res = await fetch(`${API_URL}/households.php?id=${householdId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/households.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        await fetchHouseholds();
        closeModal();
      } else {
        const err = await res.json();
        showErrorNotification(err.error || "Failed to save household.");
      }
    } catch (error) {
      console.error(error);
      showErrorNotification("Network error. Please try again.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingIndex(null);
    setFormData({ address: "", mobile: "", notes: "" });
    setHouseholdHead(null);
    setMembers([]);
  };

  const openCreateModal = () => {
    if (!canAddHousehold) return;
    setIsEditing(false);
    setEditingIndex(null);
    setFormData({ address: "", mobile: "", notes: "" });
    setHouseholdHead(null);
    setMembers([]);
    setShowModal(true);
  };

  const handleViewDetails = (household) => {
    setViewingHousehold(household);
    setShowViewModal(true);
    setOpenDropdown(null);
  };

  const handleEdit = (household, index) => {
    if (!canEditHousehold) return;
    setIsEditing(true);
    setEditingIndex(index);
    setFormData({
      address: household.address || "",
      mobile: household.mobile || "",
      notes: household.notes || "",
    });
    setHouseholdHead(household.head);
    setMembers(household.members || []);
    setShowModal(true);
    setOpenDropdown(null);
  };

  const handleDeleteClick = (index) => {
    if (!canDeleteHousehold) return;
    setDeletingIndex(index);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const confirmDelete = async () => {
    if (!canDeleteHousehold) return;

    try {
      const householdId = households[deletingIndex].id;
      const res = await fetch(`${API_URL}/households.php?id=${householdId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchHouseholds();
      }
    } catch (error) {
      console.error(error);
      showErrorNotification("Failed to delete household.");
    }
    setShowDeleteModal(false);
    setDeletingIndex(null);
  };

  const filteredHouseholds = households.filter((h) => {
    const matchesSearch =
      h.household_no?.toLowerCase().includes(search.toLowerCase()) ||
      h.head_name?.toLowerCase().includes(search.toLowerCase());

    if (activeFilter === "All") return matchesSearch;

    const totalMembers = (h.members?.length || 0) + 1;
    if (activeFilter === "Singleperson") return matchesSearch && totalMembers === 1;
    if (activeFilter === "Small")
      return matchesSearch && totalMembers >= 2 && totalMembers <= 3;
    if (activeFilter === "Medium")
      return matchesSearch && totalMembers >= 4 && totalMembers <= 5;
    if (activeFilter === "Large")
      return matchesSearch && totalMembers >= 6 && totalMembers <= 7;
    if (activeFilter === "Very Large") return matchesSearch && totalMembers >= 8;
    return matchesSearch;
  });

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <FaExclamationCircle className="text-red-500 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-2">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* ===== ERROR NOTIFICATION ===== */}
      {showError && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100]">
          <div className="flex items-center gap-3 bg-red-500 text-white px-5 py-3 rounded-lg shadow-lg">
            <FaExclamationCircle size={20} />
            <span className="text-sm font-medium">{errorMessage}</span>
            <button
              onClick={() => setShowError(false)}
              className="ml-2 text-white/80 hover:text-white"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ===== PAGE TITLE ===== */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Households</h2>

        <div className="flex items-center gap-2 mt-1 relative">
          <p className="text-gray-500 text-sm">
            View all household profiles, including heads and members.
          </p>

          <button
            onClick={() => setShowTooltip(!showTooltip)}
            onBlur={() => setTimeout(() => setShowTooltip(false), 200)}
            className="text-emerald-600 hover:text-emerald-700 transition-colors focus:outline-none"
          >
            <FaInfoCircle size={16} />
          </button>

          {showTooltip && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-72 bg-gray-800 text-white text-xs rounded-lg shadow-xl p-4">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45"></div>
              <ul className="space-y-1.5 relative z-10">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>A single-person household (1 member).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>A small household (2–3 members).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>A medium household (4–5 members).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>A large household (6–7 members).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>A very large household (8 or more members).</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ===== ACTION BAR ===== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          {canAddHousehold && (
            <button
              onClick={openCreateModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2 text-sm active:scale-95"
            >
              <FaPlus size={12} />
              Create Household
            </button>
          )}

          <div className="relative">
            <FaSearch className="absolute top-3 left-3 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-emerald-500 w-64"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute top-2.5 right-2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>

          <button
            onClick={fetchHouseholds}
            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <FaSync size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {["All", "Singleperson", "Small", "Medium", "Large", "Very Large"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeFilter === filter
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter}
              </button>
            )
          )}
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Household Number
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Head Name
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Household Member
              </th>
              {(canEditHousehold || canDeleteHousehold) && (
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
            {loading ? (
              <tr>
                <td className="text-center py-12 text-gray-400" colSpan="4">
                  Loading...
                </td>
              </tr>
            ) : filteredHouseholds.length > 0 ? (
              filteredHouseholds.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {item.household_no}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                        {item.head_name?.charAt(0)}
                      </span>
                      <span className="font-medium text-gray-900">
                        {item.head_name}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold border-2 border-white -mr-2">
                        {(item.members?.length || 0) + 1}
                      </span>
                      {(item.members || []).slice(0, 2).map((m, i) => (
                        <span
                          key={i}
                          className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold border-2 border-white -mr-2"
                        >
                          {m.name?.charAt(0)}
                        </span>
                      ))}
                    </span>
                  </td>

                  {(canEditHousehold || canDeleteHousehold) && (
                    <td className="px-6 py-4 text-right">
                      <div
                        className="relative inline-block"
                        ref={openDropdown === index ? dropdownRef : null}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(
                              openDropdown === index ? null : index
                            );
                          }}
                          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <FaEllipsisH size={14} />
                        </button>

                        {openDropdown === index && (
                          <div
                            className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-[100]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleViewDetails(item)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <FaEye size={14} className="text-emerald-600" />
                              View Details
                            </button>

                            {canEditHousehold && (
                              <button
                                type="button"
                                onClick={() => handleEdit(item, index)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <FaEdit size={14} className="text-amber-600" />
                                Edit
                              </button>
                            )}

                            {canDeleteHousehold && (
                              <>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClick(index)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <FaTrash size={14} />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td className="text-center py-12 text-gray-400" colSpan="4">
                  No household records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>TOTAL: {filteredHouseholds.length}</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded hover:bg-gray-100">‹</button>
            <button className="px-3 py-1 rounded bg-emerald-600 text-white">1</button>
            <button className="px-2 py-1 rounded hover:bg-gray-100">›</button>
          </div>
        </div>
      </div>

      {/* ===== CREATE / EDIT MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditing ? "Edit Community Household" : "Community Household"}
                </h2>
                <p className="text-xs text-gray-500">
                  {isEditing
                    ? "Update the community household information below."
                    : "Provide the community household information below."}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-md font-bold text-emerald-700 mb-4 pb-2 border-b border-emerald-100">
                  Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter address"
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Mobile Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-gray-600 text-sm">
                        🇵🇭 +63
                      </span>
                      <input
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="333 3333 333"
                        className="flex-1 bg-white border border-gray-200 rounded-r-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Notes"
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={openHeadModal}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition text-sm font-medium"
                >
                  <FaSearch size={14} /> Search Resident
                </button>
              </div>

              <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-md font-bold text-emerald-700 mb-4 pb-2 border-b border-emerald-100">
                  Household Head
                </h3>
                {householdHead ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium text-sm">{householdHead.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="font-medium text-sm">{householdHead.dob}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sex</p>
                      <p className="font-medium text-sm">{householdHead.sex}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mobile Number</p>
                      <p className="font-medium text-sm">{householdHead.mobile}</p>
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                      <button
                        onClick={() => setHouseholdHead(null)}
                        className="text-red-500 text-xs hover:underline"
                      >
                        Remove Head
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium text-sm">N/A</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="font-medium text-sm">N/A</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sex</p>
                      <p className="font-medium text-sm">N/A</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={openMemberModal}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition text-sm font-medium shadow-sm"
                >
                  <FaPlus size={14} /> Add Member
                </button>
              </div>

              <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-md font-bold text-emerald-700 mb-4 pb-2 border-b border-emerald-100">
                  Household Members
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date of Birth</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sex</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Relationship to Head</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mobile Number</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {members.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-4 text-center text-gray-400 italic text-sm">
                            No members added yet.
                          </td>
                        </tr>
                      ) : (
                        members.map((member, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{member.dob}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{member.sex}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{member.relationship}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{member.mobile}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => removeMember(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTrash size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 py-4 border-t border-gray-100 bg-white sticky bottom-0 z-10">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHousehold}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md transition-all active:scale-95"
              >
                {isEditing ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SEARCH RESIDENT MODAL ===== */}
      {showResidentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowResidentModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={18} />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {residentModalType === "head" ? "Select Household Head" : "Add Household Member"}
            </h2>

            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="manualToggle"
                checked={isManualInput}
                onChange={(e) => setIsManualInput(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="manualToggle" className="text-sm text-gray-700">
                Manual Input (Not verified)
              </label>
            </div>

            {!isManualInput ? (
              <>
                <div className="mb-4 relative">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search Resident by Name or ID..."
                    className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="border rounded-lg max-h-60 overflow-y-auto mb-4">
                  {residents.length > 0 ? (
                    residents.map((res) => {
                      const isAlreadyIn = residentsInHousehold[res.id];
                      return (
                        <div
                          key={res.id}
                          onClick={() => !isAlreadyIn && setSelectedResident(res)}
                          className={`p-3 border-b ${
                            isAlreadyIn
                              ? "bg-red-50 cursor-not-allowed opacity-60"
                              : "cursor-pointer hover:bg-emerald-50"
                          } ${
                            selectedResident?.id === res.id
                              ? "bg-emerald-100 border-emerald-500"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">{res.name}</p>
                              <p className="text-xs text-gray-500">
                                {res.id} | {res.dob} | {res.sex}
                              </p>
                            </div>
                            {isAlreadyIn ? (
                              <span className="text-red-500 text-xs font-bold">
                                Already in a household
                              </span>
                            ) : selectedResident?.id === res.id ? (
                              <span className="text-emerald-600 text-xs font-bold">
                                Selected
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="p-4 text-center text-gray-500 text-sm">
                      No residents found.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 text-sm"
                    value={manualData.name}
                    onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      className="w-full border rounded-lg p-2 text-sm"
                      value={manualData.dob}
                      onChange={(e) => setManualData({ ...manualData, dob: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Sex</label>
                    <select
                      className="w-full border rounded-lg p-2 text-sm"
                      value={manualData.sex}
                      onChange={(e) => setManualData({ ...manualData, sex: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 text-sm"
                    value={manualData.mobile}
                    onChange={(e) => setManualData({ ...manualData, mobile: e.target.value })}
                  />
                </div>
              </div>
            )}

            {residentModalType === "member" && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Relationship to Head
                </label>
                <input
                  type="text"
                  placeholder="e.g., Son, Daughter, Spouse"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={manualData.relationship}
                  onChange={(e) =>
                    setManualData({ ...manualData, relationship: e.target.value })
                  }
                />
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowResidentModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={residentModalType === "head" ? handleSaveHead : handleAddMember}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                {residentModalType === "head" ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== VIEW DETAILS MODAL ===== */}
      {showViewModal && viewingHousehold && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Household Details</h2>
                <p className="text-xs text-gray-500">{viewingHousehold.household_no}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-md font-bold text-emerald-700 mb-4 pb-2 border-b border-emerald-100">
                  Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex">
                    <span className="w-32 text-gray-500">Address:</span>
                    <span className="font-medium text-gray-800">
                      {viewingHousehold.address || "N/A"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-500">Mobile:</span>
                    <span className="font-medium text-gray-800">
                      {viewingHousehold.mobile || "N/A"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-500">Notes:</span>
                    <span className="font-medium text-gray-800">
                      {viewingHousehold.notes || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-md font-bold text-emerald-700 mb-4 pb-2 border-b border-emerald-100">
                  Household Head
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium">{viewingHousehold.head?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="font-medium">{viewingHousehold.head?.dob || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sex</p>
                    <p className="font-medium">{viewingHousehold.head?.sex || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mobile</p>
                    <p className="font-medium">{viewingHousehold.head?.mobile || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-md font-bold text-emerald-700 mb-4 pb-2 border-b border-emerald-100">
                  Household Members ({viewingHousehold.members?.length || 0})
                </h3>
                {!viewingHousehold.members || viewingHousehold.members.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No members.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sex</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Relationship</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {viewingHousehold.members.map((m, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                            <td className="px-4 py-2 font-medium text-gray-900">{m.name}</td>
                            <td className="px-4 py-2 text-gray-500">{m.dob}</td>
                            <td className="px-4 py-2 text-gray-500">{m.sex}</td>
                            <td className="px-4 py-2 text-gray-500">{m.relationship}</td>
                            <td className="px-4 py-2 text-gray-500">{m.mobile}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 py-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {showDeleteModal && canDeleteHousehold && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <FaTrash size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Delete Household?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete this household? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHousehold;