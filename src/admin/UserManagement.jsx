// src/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { usePermission } from "../hooks/usePermission";

const UserManagement = () => {
  const location = useLocation();
  const isRootUsersPath = location.pathname === '/admin/users' || location.pathname === '/admin/users/';

  // ✅ Permissions hook
  const { canView, canCreate, canEdit, canDelete } = usePermission();

  // ✅ Check kung may access sa User Management
  const hasOfficialsAccess = canView("userManagement", "officials");
  const hasResidentsAccess = canView("userManagement", "residents");
  const hasRolesAccess = canView("userManagement", "roles");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff',
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch users
  useEffect(() => {
    if (isRootUsersPath) {
      fetchUsers();
    }
  }, [isRootUsersPath]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/barangay-api/api/users.php');
      if (!response.ok) {
        throw new Error('Failed to fetch users from database.');
      }
      const data = await response.json();
      setUsers(data.data || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await fetch('http://localhost/barangay-api/api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save user to database.');
      }

      await fetchUsers();
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Staff', status: 'Active' });
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Staff':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        </div>
        
        {/* ✅ CREATE BUTTON — naka-filter */}
        {isRootUsersPath && canCreate("userManagement", "officials") && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            + Add New User Account
          </button>
        )}
      </div>

      {/* Sub-Navigation Tabs — naka-filter base sa permissions */}
      <div className="flex border-b border-gray-200 gap-6">
        {/* All Accounts — kita kung may officials OR residents OR roles access */}
        {(hasOfficialsAccess || hasResidentsAccess || hasRolesAccess) && (
          <Link
            to="/admin/users"
            className={`pb-3 font-medium text-sm border-b-2 transition-colors ${
              isRootUsersPath
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Accounts
          </Link>
        )}

        {/* Officials — kita kung may officials access */}
        {hasOfficialsAccess && (
          <Link
            to="/admin/users/officials"
            className={`pb-3 font-medium text-sm border-b-2 transition-colors ${
              location.pathname.includes('/admin/users/officials')
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Officials
          </Link>
        )}

        {/* Residents — kita kung may residents access */}
        {hasResidentsAccess && (
          <Link
            to="/admin/users/residents"
            className={`pb-3 font-medium text-sm border-b-2 transition-colors ${
              location.pathname.includes('/admin/users/residents')
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Residents
          </Link>
        )}

        {/* Roles — kita kung may roles access */}
        {hasRolesAccess && (
          <Link
            to="/admin/users/roles"
            className={`pb-3 font-medium text-sm border-b-2 transition-colors ${
              location.pathname.includes('/admin/users/roles')
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Roles
          </Link>
        )}
      </div>

      {/* Conditional rendering */}
      {isRootUsersPath ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by ID, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created By</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-500">
                      Loading users from database...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-red-500">
                      Error: {error}
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-gray-900">{user.id}</td>
                      <td className="py-4 px-4 text-gray-700 font-medium">{user.name}</td>
                      <td className="py-4 px-4 text-gray-500">{user.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 font-medium">
                        {user.createdBy || user.created_by || 'System Admin'}
                      </td>
                      <td className="py-4 px-4 text-gray-500">{user.dateAdded || user.created_at}</td>
                      <td className="py-4 px-4 text-right space-x-2">
                        {/* ✅ EDIT BUTTON — naka-filter */}
                        {canEdit("userManagement", "officials") && (
                          <button className="text-emerald-600 hover:text-emerald-800 font-medium">
                            Edit
                          </button>
                        )}
                        
                        {/* ✅ DELETE BUTTON — naka-filter */}
                        {canDelete("userManagement", "officials") && (
                          <button className="text-red-600 hover:text-red-800 font-medium">
                            Deactivate
                          </button>
                        )}

                        {/* ✅ Kung walang edit at delete, ipakita ang dash */}
                        {!canEdit("userManagement", "officials") && 
                         !canDelete("userManagement", "officials") && (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Outlet />
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Add New User Account</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Juan Dela Cruz"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. juan@barangay.gov"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;