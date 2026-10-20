import React, { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  FaTachometerAlt,
  FaUsers,
  FaAddressBook,
  FaHome,
  FaFileAlt,
  FaConciergeBell,
  FaBook,
  FaExclamationTriangle,
  FaChartBar,
  FaCog,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";


// =====================================================
// HELPER
// =====================================================

const hasPermission = (
  permissions,
  section,
  module,
  action = "view"
) => {
  return (
    permissions?.[section]?.[module]?.[action] === true
  );
};


// =====================================================
// ADMIN LAYOUT
// =====================================================

const AdminLayout = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [permissions, setPermissions] = useState({});

  const [currentUser, setCurrentUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    role: "",
  });

  const location = useLocation();

  const navigate = useNavigate();


  // =====================================================
  // LOAD USER + PERMISSIONS
  // =====================================================

  useEffect(() => {

    try {

      // ---------------------------------------------------
      // GET PERMISSIONS
      // ---------------------------------------------------

      const savedPermissions =
        localStorage.getItem("permissions");

      if (savedPermissions) {

        const parsedPermissions =
          JSON.parse(savedPermissions);

        setPermissions(
          parsedPermissions || {}
        );

      } else {

        setPermissions({});

      }


      // ---------------------------------------------------
      // GET USER
      // ---------------------------------------------------

      const savedUser =
        localStorage.getItem("user");

      if (savedUser) {

        const parsedUser =
          JSON.parse(savedUser);

        setCurrentUser({
          firstName:
            parsedUser.firstName || "",

          lastName:
            parsedUser.lastName || "",

          username:
            parsedUser.username || "",

          role:
            parsedUser.role || "",
        });

      } else {

        // -------------------------------------------------
        // FALLBACK SA INDIVIDUAL LOCALSTORAGE
        // -------------------------------------------------

        setCurrentUser({

          firstName:
            localStorage.getItem(
              "firstName"
            ) || "",

          lastName:
            localStorage.getItem(
              "lastName"
            ) || "",

          username:
            localStorage.getItem(
              "username"
            ) || "",

          role:
            localStorage.getItem(
              "role"
            ) || "",
        });

      }

    } catch (error) {

      console.error(
        "Failed to load user permissions:",
        error
      );

      setPermissions({});

    }

  }, []);


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    // ---------------------------------------------------
    // REMOVE LOGIN DATA
    // ---------------------------------------------------

    localStorage.removeItem(
      "isLoggedIn"
    );

    localStorage.removeItem(
      "userId"
    );

    localStorage.removeItem(
      "username"
    );

    localStorage.removeItem(
      "firstName"
    );

    localStorage.removeItem(
      "lastName"
    );

    localStorage.removeItem(
      "role"
    );

    localStorage.removeItem(
      "permissions"
    );

    localStorage.removeItem(
      "status"
    );

    localStorage.removeItem(
      "user"
    );


    // ---------------------------------------------------
    // REDIRECT
    // ---------------------------------------------------

    navigate("/login");

  };


  // =====================================================
  // PERMISSION CHECKS
  // =====================================================

  // -----------------------------------------------------
  // USER MANAGEMENT
  // -----------------------------------------------------

  const canViewOfficials =
    hasPermission(
      permissions,
      "userManagement",
      "officials",
      "view"
    );

  const canViewResidents =
    hasPermission(
      permissions,
      "userManagement",
      "residents",
      "view"
    );

  const canViewRoles =
    hasPermission(
      permissions,
      "userManagement",
      "roles",
      "view"
    );


  const canViewUserManagement =
    canViewOfficials ||
    canViewResidents ||
    canViewRoles;


  // -----------------------------------------------------
  // OTHER MODULES
  // -----------------------------------------------------

  const canViewResidentsRecord =
    hasPermission(
      permissions,
      "residentsRecord",
      "residentsList",
      "view"
    );


  const canViewCommunityHousehold =
    hasPermission(
      permissions,
      "communityHousehold",
      "households",
      "view"
    );


  const canViewCertificates =
    hasPermission(
      permissions,
      "certificateIssuance",
      "certificates",
      "view"
    );


  const canViewServiceRequests =
    hasPermission(
      permissions,
      "serviceRequests",
      "requests",
      "view"
    );


  const canViewBlotter =
    hasPermission(
      permissions,
      "blotterRecords",
      "blotter",
      "view"
    );


  const canViewIncidents =
    hasPermission(
      permissions,
      "incidentReports",
      "incidents",
      "view"
    );


  const canViewReports =
    hasPermission(
      permissions,
      "reportsModule",
      "reports",
      "view"
    );


  const canViewSettings =
    hasPermission(
      permissions,
      "settingsModule",
      "settings",
      "view"
    );


  // =====================================================
  // MENU ITEMS
  // =====================================================

  const menuItems = [

    // ---------------------------------------------------
    // DASHBOARD
    // ---------------------------------------------------

    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <FaTachometerAlt />,
      allowed: true,
    },


    // ---------------------------------------------------
    // USER MANAGEMENT
    // ---------------------------------------------------

    {
      name: "User Management",
      path: "/admin/users",
      icon: <FaUsers />,
      allowed: canViewUserManagement,
    },


    // ---------------------------------------------------
    // RESIDENTS RECORD
    // ---------------------------------------------------

    {
      name: "Residents Record",
      path: "/admin/residents",
      icon: <FaAddressBook />,
      allowed: canViewResidentsRecord,
    },


    // ---------------------------------------------------
    // COMMUNITY HOUSEHOLD
    // ---------------------------------------------------

    {
      name: "Community Household",
      path: "/admin/households",
      icon: <FaHome />,
      allowed: canViewCommunityHousehold,
    },


    // ---------------------------------------------------
    // CERTIFICATE ISSUANCE
    // ---------------------------------------------------

    {
      name: "Certificate Issuance",
      path: "/admin/certificates",
      icon: <FaFileAlt />,
      allowed: canViewCertificates,
    },


    // ---------------------------------------------------
    // SERVICE REQUESTS
    // ---------------------------------------------------

    {
      name: "Service Requests",
      path: "/admin/services",
      icon: <FaConciergeBell />,
      allowed: canViewServiceRequests,
    },


    // ---------------------------------------------------
    // BLOTTER RECORDS
    // ---------------------------------------------------

    {
      name: "Blotter Records",
      path: "/admin/blotter",
      icon: <FaBook />,
      allowed: canViewBlotter,
    },


    // ---------------------------------------------------
    // INCIDENT REPORTS
    // ---------------------------------------------------

    {
      name: "Incident Reports",
      path: "/admin/incidents",
      icon: <FaExclamationTriangle />,
      allowed: canViewIncidents,
    },


    // ---------------------------------------------------
    // REPORTS
    // ---------------------------------------------------

    {
      name: "Reports",
      path: "/admin/reports",
      icon: <FaChartBar />,
      allowed: canViewReports,
    },


    // ---------------------------------------------------
    // SETTINGS
    // ---------------------------------------------------

    {
      name: "Settings",
      path: "/admin/settings",
      icon: <FaCog />,
      allowed: canViewSettings,
    },

  ];


  // =====================================================
  // USER DISPLAY NAME
  // =====================================================

  const displayName =
    currentUser.firstName ||
    currentUser.username ||
    "User";


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          w-64
          bg-slate-900
          text-white
          transform
          transition-transform
          duration-300
          ease-in-out

          lg:translate-x-0

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          flex
          flex-col
        `}
      >


        {/* =============================================
            SIDEBAR HEADER
        ============================================= */}

        <div className="flex items-center justify-between h-16 px-6 bg-slate-950 flex-shrink-0">

          <span className="text-xs font-bold tracking-widest text-emerald-400">
            BARANGAY CENTRAL
          </span>


          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="lg:hidden text-gray-400 hover:text-white"
          >

            <FaTimes size={20} />

          </button>

        </div>


        {/* =============================================
            NAVIGATION
        ============================================= */}

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">

          {menuItems
            .filter(
              (item) =>
                item.allowed
            )
            .map((item) => {

              const isActive =
                location.pathname ===
                item.path;


              return (

                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() =>
                    setSidebarOpen(false)
                  }

                  className={`
                    flex
                    items-center
                    gap-3
                    px-4
                    py-2.5
                    rounded-lg
                    text-xs
                    font-semibold
                    tracking-wide
                    transition-colors

                    ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >

                  <span className="text-sm">
                    {item.icon}
                  </span>

                  {item.name}

                </Link>

              );

            })}

        </nav>


        {/* =============================================
            LOGOUT
        ============================================= */}

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex-shrink-0">

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >

            <FaSignOutAlt size={14} />

            LOGOUT

          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="flex-1 flex flex-col lg:ml-64 h-full overflow-hidden">


        {/* =============================================
            HEADER
        ============================================= */}

        <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6 z-40 flex-shrink-0 shadow-sm">


          {/* MOBILE MENU */}

          <button
            onClick={() =>
              setSidebarOpen(true)
            }
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >

            <FaBars size={20} />

          </button>


          {/* USER INFO */}

          <div className="flex items-center gap-4 ml-auto">

            <FaUserCircle
              size={26}
              className="text-emerald-600"
            />


            <div className="text-right">

              <div className="text-xs font-bold text-gray-800">
                {displayName}
              </div>


              <div className="text-[10px] text-gray-500 uppercase">
                {currentUser.role || "User"}
              </div>

            </div>

          </div>

        </header>


        {/* =============================================
            PAGE CONTENT
        ============================================= */}

        <main className="flex-1 p-6 overflow-y-auto">

          <Outlet />

        </main>

      </div>

    </div>

  );
};


export default AdminLayout;