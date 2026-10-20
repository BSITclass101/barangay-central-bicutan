import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBell, FaChevronDown, FaSignInAlt } from "react-icons/fa";
import logo from "../assets/picture/logo (2).png";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Isara ang dropdown kapag lumipat ng pahina
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  const getNavBackground = () => {
    if (isHomePage) {
      return scrolled
        ? "rgba(255, 255, 255, 0.95)"
        : "linear-gradient(to bottom, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0) 100%)";
    }
    return "#ffffff";
  };

  const getTextColor = () => {
    if (isHomePage && !scrolled) {
      return "#ffffff";
    }
    return "#1e293b";
  };

  const scrollToSection = (id) => {
    setActiveDropdown(null);
    if (!isHomePage) {
      navigate("/", { state: { scrollTo: id } });
      return;
    }
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToAboutSection = (id) => {
    setActiveDropdown(null);
    if (location.pathname !== "/about") {
      navigate("/about", { state: { scrollTo: id } });
      return;
    }
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <style>
        {`
          .culiat-dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            min-width: 240px;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            border: 1px solid #f1f5f9;
            padding: 8px 0;
            z-index: 99999;
            animation: fadeInDropdown 0.15s ease-in-out forwards;
          }

          @keyframes fadeInDropdown {
            from {
              opacity: 0;
              transform: translateY(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .culiat-dropdown-menu a {
            display: block;
            padding: 10px 18px;
            color: #334155;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            font-family: 'Times New Roman', Times, serif;
            transition: all 0.2s ease;
          }

          .culiat-dropdown-menu a:hover {
            background: #f0fdf4;
            color: #059669;
            padding-left: 22px;
          }
        `}
      </style>

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "75px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 5%",
          background: getNavBackground(),
          backdropFilter: isHomePage && scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: isHomePage && scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled ? "0 4px 20px rgba(0, 0, 0, 0.08)" : "none",
          borderBottom: scrolled || !isHomePage ? "1px solid #e2e8f0" : "none",
          transition: "background 0.3s ease, box-shadow 0.3s ease, border 0.3s ease",
          zIndex: 99999,
          boxSizing: "border-box",
        }}
      >
        {/* LOGO SECTION — ✅ CLICK → ADMIN LOGIN */}
        <Link
          to="/login"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          <img
            src={logo}
            alt="Barangay Central Logo"
            style={{ width: "44px", height: "44px", objectFit: "contain" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h2
              style={{
                margin: 0,
                color: getTextColor(),
                fontSize: "15px",
                fontWeight: "800",
                fontFamily: "'Times New Roman', Times, serif",
                letterSpacing: ".8px",
                lineHeight: "1.2",
                textShadow: isHomePage && !scrolled ? "0 2px 4px rgba(0,0,0,0.4)" : "none",
              }}
            >
              BARANGAY CENTRAL
            </h2>
            <span
              style={{
                color: isHomePage && !scrolled ? "#34d399" : "#059669",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "1.2px",
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              E-SERVICES PORTAL
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS & DROPDOWNS */}
        <div style={{ display: "flex", alignItems: "center", gap: "26px" }}>

          {/* HOME DROPDOWN */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setActiveDropdown("home")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              style={{
                background: "none",
                border: "none",
                color: getTextColor(),
                fontWeight: "700",
                fontSize: "13px",
                fontFamily: "'Times New Roman', Times, serif",
                letterSpacing: ".8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "10px 0",
                textShadow: isHomePage && !scrolled ? "0 2px 4px rgba(0,0,0,0.4)" : "none",
              }}
            >
              HOME <FaChevronDown size={8} />
            </button>
            {activeDropdown === "home" && (
              <div className="culiat-dropdown-menu">
                <a href="#carousel" onClick={(e) => { e.preventDefault(); scrollToSection("carousel"); }}>
                  Featured Announcements
                </a>
                <a href="#statistics" onClick={(e) => { e.preventDefault(); scrollToSection("statistics"); }}>
                  Barangay Statistics
                </a>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection("services"); }}>
                  Quick Services
                </a>
                <a href="#community-highlights" onClick={(e) => { e.preventDefault(); scrollToSection("community-highlights"); }}>
                  Community Highlights
                </a>
                <a href="#barangay-council" onClick={(e) => { e.preventDefault(); scrollToSection("barangay-council"); }}>
                  Barangay Council
                </a>
              </div>
            )}
          </div>

          {/* SERVICES DROPDOWN */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setActiveDropdown("services")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              style={{
                background: "none",
                border: "none",
                color: getTextColor(),
                fontWeight: "700",
                fontSize: "13px",
                fontFamily: "'Times New Roman', Times, serif",
                letterSpacing: ".8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "10px 0",
                textShadow: isHomePage && !scrolled ? "0 2px 4px rgba(0,0,0,0.4)" : "none",
              }}
            >
              SERVICES <FaChevronDown size={8} />
            </button>
            {activeDropdown === "services" && (
              <div className="culiat-dropdown-menu">
                <Link to="/barangay-clearance">Barangay Clearance</Link>
                <Link to="/certificate-of-indigency">Certificate of Indigency</Link>
                <Link to="/certificate-of-residency">Certificate of Residency</Link>
                <Link to="/business-permit">Business Permit</Link>
                <Link to="/barangay-id">Barangay ID</Link>
                <Link to="/barangay-permit">Barangay Permit</Link>
                <Link to="/health-services">Health Services</Link>
                <Link to="/social-welfare">Social Welfare</Link>
              </div>
            )}
          </div>

          {/* DOWNLOADS DROPDOWN */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setActiveDropdown("downloads")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              style={{
                background: "none",
                border: "none",
                color: getTextColor(),
                fontWeight: "700",
                fontSize: "13px",
                fontFamily: "'Times New Roman', Times, serif",
                letterSpacing: ".8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "10px 0",
                textShadow: isHomePage && !scrolled ? "0 2px 4px rgba(0,0,0,0.4)" : "none",
              }}
            >
              DOWNLOADS <FaChevronDown size={8} />
            </button>
            {activeDropdown === "downloads" && (
              <div className="culiat-dropdown-menu">
                <Link to="/downloads">Barangay Ordinance</Link>
                <Link to="/downloads">Executive Order</Link>
                <Link to="/downloads">Barangay Resolution</Link>
              </div>
            )}
          </div>

          {/* REPORT */}
          <Link
            to="/reports"
            style={{
              textDecoration: "none",
              color: getTextColor(),
              fontWeight: "700",
              fontSize: "13px",
              fontFamily: "'Times New Roman', Times, serif",
              letterSpacing: ".8px",
              textShadow: isHomePage && !scrolled ? "0 2px 4px rgba(0,0,0,0.4)" : "none",
            }}
          >
            REPORT
          </Link>

          {/* ABOUT DROPDOWN */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setActiveDropdown("about")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              style={{
                background: "none",
                border: "none",
                color: getTextColor(),
                fontWeight: "700",
                fontSize: "13px",
                fontFamily: "'Times New Roman', Times, serif",
                letterSpacing: ".8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "10px 0",
                textShadow: isHomePage && !scrolled ? "0 2px 4px rgba(0,0,0,0.4)" : "none",
              }}
            >
              ABOUT <FaChevronDown size={8} />
            </button>
            {activeDropdown === "about" && (
              <div className="culiat-dropdown-menu">
                <a href="#about-barangay" onClick={(e) => { e.preventDefault(); scrollToAboutSection("about-barangay"); }}>
                  About Barangay
                </a>
                <a href="#goals" onClick={(e) => { e.preventDefault(); scrollToAboutSection("goals"); }}>
                  Goals
                </a>
                <a href="#mission-vision" onClick={(e) => { e.preventDefault(); scrollToAboutSection("mission-vision"); }}>
                  Mission & Vision
                </a>
                <a href="#history" onClick={(e) => { e.preventDefault(); scrollToAboutSection("history"); }}>
                  History
                </a>
                <a href="#organization" onClick={(e) => { e.preventDefault(); scrollToAboutSection("organization"); }}>
                  Organization
                </a>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <FaBell
            style={{
              color: getTextColor(),
              fontSize: "16px",
              cursor: "pointer",
              filter: isHomePage && !scrolled ? "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" : "none",
            }}
          />

          {/* ✅ LOGIN BUTTON — CLICK → RESIDENT LOGIN */}
          <Link
            to="/resident-login"
            style={{
              textDecoration: "none",
              color: getTextColor(),
              fontWeight: "700",
              fontSize: "13px",
              fontFamily: "'Times New Roman', Times, serif",
              letterSpacing: ".8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textShadow: isHomePage && !scrolled ? "0 2px 4px rgba(0,0,0,0.4)" : "none",
            }}
          >
            <FaSignInAlt style={{ fontSize: "14px", color: isHomePage && !scrolled ? "#34d399" : "#059669" }} />
            LOGIN
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;