// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);

const SESSION_DURATION = 8 * 60 * 60 * 1000;

const API_BASE_URL = "http://localhost/barangay-api/api";

// ==================================================
// SESSION KEYS
// ==================================================
const ADMIN_KEYS = {
  loggedIn: "admin_isLoggedIn",
  user: "admin_user",
  role: "admin_role",
  permissions: "admin_permissions",
  sessionToken: "admin_sessionToken",
  loginTime: "admin_loginTime",
};

const RESIDENT_KEYS = {
  loggedIn: "resident_isLoggedIn",
  user: "resident_user",
  role: "resident_role",
  permissions: "resident_permissions",
  sessionToken: "resident_sessionToken",
  loginTime: "resident_loginTime",
};

// ==================================================
// HELPERS
// ==================================================
const safeParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getCurrentPortal = () => {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname.toLowerCase();
  if (path.startsWith("/resident")) return "resident";
  if (path.startsWith("/admin")) return "admin";
  return null;
};

const getPortalFromRole = (role) => {
  return String(role || "").trim().toLowerCase() === "resident"
    ? "resident"
    : "admin";
};

const getKeysForPortal = (portal) => {
  return portal === "resident" ? RESIDENT_KEYS : ADMIN_KEYS;
};

const getUserFromStorage = (keys) => {
  const savedUser = safeParse(sessionStorage.getItem(keys.user));

  if (!savedUser || typeof savedUser !== "object") return null;

  return {
    ...savedUser,
    role: sessionStorage.getItem(keys.role) || savedUser.role || "",
    permissions:
      safeParse(sessionStorage.getItem(keys.permissions), null) ||
      savedUser.permissions ||
      {},
  };
};

const isSessionValid = (keys) => {
  const loggedIn = sessionStorage.getItem(keys.loggedIn) === "true";
  const loginTime = Number(sessionStorage.getItem(keys.loginTime));

  if (!loggedIn || !Number.isFinite(loginTime)) return false;

  const elapsed = Date.now() - loginTime;

  if (elapsed < 0 || elapsed >= SESSION_DURATION) return false;

  if (keys === ADMIN_KEYS) {
    const token = sessionStorage.getItem(keys.sessionToken);
    if (!token || token.length < 32) return false;
  }

  return true;
};

const restorePortalSession = (keys) => {
  if (!isSessionValid(keys)) return null;
  return getUserFromStorage(keys);
};

const clearPortalSession = (keys) => {
  Object.values(keys).forEach((key) => {
    sessionStorage.removeItem(key);
  });
};

// ==================================================
// AUTH PROVIDER
// ==================================================
export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [residentUser, setResidentUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==================================================
  // RESTORE SESSION
  // ==================================================
  useEffect(() => {
    const admin = restorePortalSession(ADMIN_KEYS);
    const resident = restorePortalSession(RESIDENT_KEYS);

    setAdminUser(admin);
    setResidentUser(resident);

    const portal = getCurrentPortal();

    if (portal === "resident") {
      setUser(resident);
    } else if (portal === "admin") {
      setUser(admin);
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  // ==================================================
  // LOGIN
  // ==================================================
  const login = useCallback((userData) => {
    if (!userData || typeof userData !== "object") {
      return false;
    }

    const portal = getPortalFromRole(userData.role);
    const keys = getKeysForPortal(portal);

    if (portal === "admin") {
      const token = sessionStorage.getItem(keys.sessionToken);
      if (!token || token.length < 32) {
        console.error("Login failed: missing token");
        return false;
      }
    }

    const storedUser = {
      ...userData,
      role: String(userData.role || "").trim(),
      permissions: userData.permissions || {},
    };

    const now = Date.now();

    sessionStorage.setItem(keys.loggedIn, "true");
    sessionStorage.setItem(keys.user, JSON.stringify(storedUser));
    sessionStorage.setItem(keys.role, storedUser.role);
    sessionStorage.setItem(
      keys.permissions,
      JSON.stringify(storedUser.permissions)
    );
    sessionStorage.setItem(keys.loginTime, String(now));

    if (portal === "admin") {
      setAdminUser(storedUser);
    } else {
      setResidentUser(storedUser);
    }

    setUser(storedUser);

    return true;
  }, []);

  // ==================================================
  // REFRESH USER
  // ==================================================
  const refreshUser = useCallback(async () => {
    const portal = getCurrentPortal();
    if (!portal) return false;

    const keys = getKeysForPortal(portal);
    const token = sessionStorage.getItem(keys.sessionToken);
    const savedUser = safeParse(sessionStorage.getItem(keys.user));

    if (!token || !savedUser?.id) return false;

    try {
      const response = await fetch(
        `${API_BASE_URL}/get_user.php?id=${savedUser.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return false;

      const data = await response.json();
      if (!data.success || !data.user) return false;

      const updatedUser = {
        ...savedUser,
        ...data.user,
        permissions: data.user.permissions || savedUser.permissions || {},
      };

      sessionStorage.setItem(keys.user, JSON.stringify(updatedUser));
      sessionStorage.setItem(keys.role, updatedUser.role || "");
      sessionStorage.setItem(
        keys.permissions,
        JSON.stringify(updatedUser.permissions)
      );

      if (portal === "admin") {
        setAdminUser(updatedUser);
      } else {
        setResidentUser(updatedUser);
      }
      setUser(updatedUser);

      return true;
    } catch (error) {
      console.error("refreshUser error:", error);
      return false;
    }
  }, []);

  // ==================================================
  // SWITCH PORTAL
  // ==================================================
  const switchPortalUser = useCallback((portal) => {
    if (portal === "admin") {
      const restored = restorePortalSession(ADMIN_KEYS);
      setAdminUser(restored);
      setUser(restored);
      return;
    }

    if (portal === "resident") {
      const restored = restorePortalSession(RESIDENT_KEYS);
      setResidentUser(restored);
      setUser(restored);
    }
  }, []);

  // ==================================================
  // ✅ SET RESIDENT OFFLINE
  // ==================================================
  const setResidentOffline = useCallback(async (residentId) => {
    if (!residentId) return;

    try {
      await fetch(`${API_BASE_URL}/residents.php?id=${residentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_online: 0 }),
      });
    } catch (err) {
      console.error("Failed to set resident offline:", err);
    }
  }, []);

  // ==================================================
  // LOGOUT
  // ==================================================
  const logoutAdmin = useCallback(() => {
    clearPortalSession(ADMIN_KEYS);
    setAdminUser(null);
    if (getCurrentPortal() === "admin") setUser(null);
  }, []);

  const logoutResident = useCallback(async () => {
    const residentData = safeParse(sessionStorage.getItem(RESIDENT_KEYS.user));
    const residentId = residentData?.id;

    if (residentId) {
      await setResidentOffline(residentId);
    }

    clearPortalSession(RESIDENT_KEYS);
    setResidentUser(null);
    if (getCurrentPortal() === "resident") setUser(null);
  }, [setResidentOffline]);

  // ✅ FIXED: Tamang redirect — resident → /resident-login, admin → /login
  const logout = useCallback(async () => {
    const portal = getCurrentPortal() || getPortalFromRole(user?.role);

    if (portal === "resident") {
      await logoutResident();
      if (typeof window !== "undefined") {
        window.location.replace("/resident-login");
      }
    } else {
      logoutAdmin();
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  }, [user, logoutAdmin, logoutResident]);

  // ==================================================
  // ✅ CHECK SESSION EXPIRATION + AUTO-OFFLINE
  // ==================================================
  useEffect(() => {
    if (loading) return;

    const checkSession = () => {
      const portal = getCurrentPortal();
      if (!portal) return;

      const keys = getKeysForPortal(portal);

      if (!isSessionValid(keys)) {
        if (portal === "resident") {
          const residentData = safeParse(sessionStorage.getItem(keys.user));
          if (residentData?.id) {
            setResidentOffline(residentData.id);
          }
        }

        clearPortalSession(keys);
        if (portal === "resident") {
          setResidentUser(null);
        } else {
          setAdminUser(null);
        }
        setUser(null);
        return;
      }

      const latestUser = getUserFromStorage(keys);
      if (latestUser) {
        setUser(latestUser);
        if (portal === "resident") {
          setResidentUser(latestUser);
        } else {
          setAdminUser(latestUser);
        }
      }
    };

    const handleFocus = () => checkSession();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkSession();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loading, setResidentOffline]);

  // ==================================================
  // ✅ SET RESIDENT OFFLINE PAGKA-CLOSE NG BROWSER
  // ==================================================
  useEffect(() => {
    const handleBeforeUnload = () => {
      const portal = getCurrentPortal();

      if (portal === "resident") {
        const residentData = safeParse(sessionStorage.getItem(RESIDENT_KEYS.user));
        const residentId = residentData?.id;

        if (residentId) {
          const blob = new Blob(
            [JSON.stringify({ is_online: 0 })],
            { type: "application/json" }
          );
          navigator.sendBeacon(
            `${API_BASE_URL}/residents.php?id=${residentId}`,
            blob
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const activeRole = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        residentUser,
        activeRole,
        login,
        logout,
        logoutAdmin,
        logoutResident,
        switchPortalUser,
        refreshUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;