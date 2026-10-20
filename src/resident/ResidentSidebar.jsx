import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FileText,
  FolderOpen,
  Bell,
  Settings,
  LogOut,
  Building2,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ResidentSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = () => {
    logout();
  };

  // =====================================================
  // NAVIGATION ITEM
  // =====================================================
  const navItems = [
    {
      name: "Dashboard",
      path: "/resident/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Profile",
      path: "/resident/profile",
      icon: User,
    },
    {
      name: "Certificate Requests",
      path: "/resident/certificate-requests",
      icon: FileText,
    },
    {
      name: "My Certificates",
      path: "/resident/my-certificates",
      icon: FolderOpen,
    },
    {
      name: "Notifications",
      path: "/resident/notifications",
      icon: Bell,
    },
  ];

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72
          bg-white border-r border-slate-200
          flex flex-col transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER / LOGO */}
        <div className="h-20 px-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-tight">
                Barangay Central Bicutan
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Resident Portal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RESIDENT ACCOUNT */}
        <ResidentInfo />

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    group flex items-center gap-3 px-3 py-3 rounded-xl
                    text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`
                          w-5 h-5 shrink-0
                          ${
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-slate-600"
                          }
                        `}
                      />
                      <span>{item.name}</span>

                      {item.name === "Notifications" && (
                        <span
                          className={`
                            ml-auto min-w-5 h-5 px-1.5 rounded-full
                            text-[10px] font-bold flex items-center justify-center
                            ${
                              isActive
                                ? "bg-white text-blue-600"
                                : "bg-blue-100 text-blue-600"
                            }
                          `}
                        >
                          2
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* ACCOUNT */}
          <div className="mt-8">
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Account
            </p>

            <NavLink
              to="/resident/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-3 py-3 rounded-xl
                text-sm font-medium transition
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }
                `
              }
            >
              <Settings className="w-5 h-5" />
              <span>Account Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// =====================================================
// RESIDENT INFO
// =====================================================
const ResidentInfo = () => {
  const [resident, setResident] = React.useState(null);

  React.useEffect(() => {
    const storedResident = localStorage.getItem("resident");
    if (storedResident) {
      try {
        setResident(JSON.parse(storedResident));
      } catch (error) {
        console.error("Failed to read resident data:", error);
      }
    }
  }, []);

  const firstName =
    resident?.first_name ||
    resident?.firstName ||
    resident?.name ||
    "Resident";

  const lastName = resident?.last_name || resident?.lastName || "";

  const residentId =
    resident?.resident_id ||
    resident?.resident_code ||
    resident?.residentId ||
    "BRG000000";

  return (
    <div className="px-4 pt-5">
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {firstName} {lastName}
            </p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {residentId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentSidebar;