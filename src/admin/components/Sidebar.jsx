import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaUserFriends,
  FaHome,
  FaFileAlt,
  FaClipboardList,
  FaGavel,
  FaExclamationTriangle,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
  { name: "User Management", path: "/admin/users", icon: <FaUsers /> },
  { name: "Residents Record", path: "/admin/residents", icon: <FaUserFriends /> },
  { name: "Community Household", path: "/admin/households", icon: <FaHome /> },
  { name: "Certificate Issuance", path: "/admin/certificates", icon: <FaFileAlt /> },
  { name: "Service Requests", path: "/admin/services", icon: <FaClipboardList /> },
  { name: "Blotter Records", path: "/admin/blotter", icon: <FaGavel /> },
  { name: "Incident Reports", path: "/admin/incidents", icon: <FaExclamationTriangle /> },
  { name: "Reports", path: "/admin/reports", icon: <FaChartBar /> },
  { name: "Settings", path: "/admin/settings", icon: <FaCog /> },
];

const Sidebar = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-72 min-h-screen bg-emerald-900 text-white flex flex-col shadow-lg">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-emerald-700">
        <h1 className="text-xl font-bold">Barangay Central</h1>
        <p className="text-sm text-emerald-200">Management System</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 mx-3 rounded-lg transition ${
                isActive
                  ? "bg-white text-emerald-900 font-semibold"
                  : "hover:bg-emerald-800"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-emerald-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-600 transition cursor-pointer"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;