import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaInfoCircle, FaEye, FaBullseye } from "react-icons/fa";
import communityPhoto from "../assets/picture/communityPhoto.png";
import historyPhoto from "../assets/picture/historyPhoto.jpg";

const About = () => {
  const { hash, state } = useLocation();
  const [historyHovered, setHistoryHovered] = useState(false);
  const [communityHovered, setCommunityHovered] = useState(false);
  const [visionHovered, setVisionHovered] = useState(false);
  const [missionHovered, setMissionHovered] = useState(false);

  // Para mag-auto scroll papunta sa tamang seksyon base sa Navbar click o URL hash
  useEffect(() => {
    if (state && state.scrollTo) {
      const element = document.getElementById(state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, state]);

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        background: "#ffffff",
        minHeight: "100vh",
        boxSizing: "border-box",
        paddingBottom: "80px",
      }}
    >
      {/* =========================================
          HERO / HEADER SECTION (GREEN BACKGROUND WITH WAVE)
      ========================================== */}
      <div
        id="about-barangay"
        style={{
          background: "#00C853",
          color: "#ffffff",
          padding: "140px 8% 120px 8%",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "55px",
            height: "55px",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
            color: "#ffffff",
            fontSize: "22px",
          }}
        >
          <FaInfoCircle />
        </div>

        <h1 style={{ fontSize: "42px", fontWeight: "800", margin: "0 0 15px 0" }}>
          About Us
        </h1>
        <p style={{ fontSize: "16px", maxWidth: "600px", margin: "0 auto", opacity: "0.9", lineHeight: "1.6" }}>
          Discover Barangay Central's mission, vision, goals, and the leaders who guide our growing community.
        </p>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            overflow: "hidden",
            lineHeight: 0,
          }}
        >
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{
              position: "relative",
              display: "block",
              width: "calc(100% + 1.3px)",
              height: "70px",
            }}
          >
            <path
              d="M0,0 C150,90 350,-40 500,50 C650,140 900,10 1200,40 L1200,120 L0,120 Z"
              fill="#ffffff"
            ></path>
          </svg>
        </div>
      </div>

      {/* =========================================
          SEKSYON 1: GOALS / LAYUNIN NG BARANGAY CENTRAL
      ========================================== */}
      <section id="goals" style={{ maxWidth: "1200px", margin: "60px auto 0 auto", padding: "0 5%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "50px", alignItems: "center" }}>
          
          <div>
            <div 
              style={{ 
                width: "100%", 
                height: "450px", 
                borderRadius: "12px", 
                overflow: "hidden", 
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)" 
              }}
            >
              <img 
                src={communityPhoto} 
                alt="Barangay Central Community" 
                onMouseEnter={() => setCommunityHovered(true)}
                onMouseLeave={() => setCommunityHovered(false)}
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  transform: communityHovered ? "scale(1.08)" : "scale(1)",
                  transition: "transform 0.4s ease-in-out"
                }} 
              />
            </div>
          </div>

          <div>
            <span style={{ color: "#00C853", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>
              Ating mga Layunin
            </span>
            <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#1e293b", marginTop: "8px", marginBottom: "15px" }}>
              Layunin ng Barangay Central
            </h2>
            <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.7", marginBottom: "30px" }}>
              Narito ang mga pangunahing layunin at pangako ng Barangay Central para sa de-kalidad na serbisyo at tunay na kalinga sa pamayanan.
            </p>

            <div style={goalItemStyle}>
              <div style={badgeStyle}>01</div>
              <div><h4 style={titleStyle}>Serbisyong Panlipunan</h4><p style={descStyle}>Presensya ng barangay sa paaralan, health center, at tulong sa iba't ibang sektor.</p></div>
            </div>
            <div style={goalItemStyle}>
              <div style={badgeStyle}>02</div>
              <div><h4 style={titleStyle}>Pangkabuhayang Pag-unlad</h4><p style={descStyle}>Mabilis na proseso sa negosyo, pagsasanay, at tulong sa underemployed.</p></div>
            </div>
            <div style={goalItemStyle}>
              <div style={badgeStyle}>03</div>
              <div><h4 style={titleStyle}>Programang Pangkalikasan</h4><p style={descStyle}>Disiplina sa kalinisan at pagsuporta sa urban gardening.</p></div>
            </div>
            <div style={goalItemStyle}>
              <div style={badgeStyle}>04</div>
              <div><h4 style={titleStyle}>Inprastraktura</h4><p style={descStyle}>Maayos na kalsada, drainage, at proyektong pangkomunidad.</p></div>
            </div>
            <div style={{ ...goalItemStyle, marginBottom: 0 }}>
              <div style={badgeStyle}>05</div>
              <div><h4 style={titleStyle}>Pagpapatatag ng Pamamahala</h4><p style={descStyle}>Tatak ng Mabuting Pamamahala – Kalidad na Serbisyo, Kalingang Tunay.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SEKSYON 2: PRINCIPLES (VISION & MISSION)
      ========================================== */}
      <section id="mission-vision" style={{ maxWidth: "1200px", margin: "100px auto 0 auto", padding: "0 5%" }}>
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h2 style={{ fontSize: "35px", fontWeight: "800", color: "#1e293b" }}>
            Barangay Central <span style={{ color: "#00C853" }}>Principles</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "15px", marginTop: "8px" }}>
            Ang aming gabay sa tapat na paglilingkod at pag-unlad ng komunidad.
          </p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
          
          {/* OUR VISION CARD */}
          <div 
            onMouseEnter={() => setVisionHovered(true)}
            onMouseLeave={() => setVisionHovered(false)}
            style={{
              background: "#ffffff",
              padding: "40px 35px",
              borderRadius: "20px",
              boxShadow: visionHovered ? "0 20px 40px rgba(45, 90, 39, 0.15)" : "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid #f1f5f9",
              transform: visionHovered ? "translateY(-8px)" : "translateY(0px)",
              transition: "transform 0.3s ease, boxShadow 0.3s ease",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
              <div style={{ width: "50px", height: "50px", background: "#E8F0E6", color: "#00C853", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                <FaEye />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: 0 }}>OUR VISION</h3>
                <div style={{ 
                  width: visionHovered ? "80px" : "30px", 
                  height: "3px", 
                  background: "#00C853", 
                  marginTop: "5px", 
                  borderRadius: "2px",
                  transition: "width 0.3s ease-in-out"
                }}></div>
              </div>
            </div>
            <p style={{ color: "#475569", lineHeight: "1.8", fontSize: "15px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              BUKLOD CENTRAL, MATATAG AT TAPAT.
            </p>
          </div>

          {/* OUR MISSION CARD */}
          <div 
            onMouseEnter={() => setMissionHovered(true)}
            onMouseLeave={() => setMissionHovered(false)}
            style={{
              background: "#ffffff",
              padding: "40px 35px",
              borderRadius: "20px",
              boxShadow: missionHovered ? "0 20px 40px rgba(45, 90, 39, 0.15)" : "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid #f1f5f9",
              transform: missionHovered ? "translateY(-8px)" : "translateY(0px)",
              transition: "transform 0.3s ease, boxShadow 0.3s ease",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
              <div style={{ width: "50px", height: "50px", background: "#E8F0E6", color: "#00C853", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                <FaBullseye />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: 0 }}>OUR MISSION</h3>
                <div style={{ 
                  width: missionHovered ? "80px" : "30px", 
                  height: "3px", 
                  background: "#00C853", 
                  marginTop: "5px", 
                  borderRadius: "2px",
                  transition: "width 0.3s ease-in-out"
                }}></div>
              </div>
            </div>
            <p style={{ color: "#475569", lineHeight: "1.8", fontSize: "14.5px" }}>
              Ang Barangay Central ay sasalamin sa programa ng pamahalaang Taguig na isang maunlad, malinis, maayos at mapayapang pamayanan na nakatuntong sa matapat, marangal at mapagkawang-gawa na paglilingkod na may pagkilala ng pagkakapantay ng kasarian o kalagayan sa lipunan kasabay din nang pangangalaga sa kalikasan at kapaligiran, na patuloy na makasusunod sa makabagong teknolohiya.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================
          SEKSYON 3: HISTORY (GREEN BACKGROUND WITH WAVE)
      ========================================== */}
      <section
        id="history"
        style={{
          background: "#00C853",
          color: "#ffffff",
          padding: "100px 8% 130px 8%",
          marginTop: "100px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "50px",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ fontSize: "36px", fontWeight: "800", margin: "0 0 20px 0", lineHeight: "1.3" }}>
              The Rich History of Barangay Central
            </h2>
            <p style={{ fontSize: "15px", lineHeight: "1.8", opacity: "0.95", marginBottom: "20px" }}>
              Barangay Central, located in the heart of Taguig, boasts a vibrant and storied past. Originally a sprawling agricultural land, it has transformed over decades into a bustling urban community while retaining its unique charm and strong community spirit.
            </p>
            <p style={{ fontSize: "15px", lineHeight: "1.8", opacity: "0.95", marginBottom: "20px" }}>
              From its early beginnings, Central has been a melting pot of cultures and traditions. Early settlers contributed to its development, cultivating the land and establishing the foundations of the close-knit neighborhood it is today.
            </p>
            <p style={{ fontSize: "15px", lineHeight: "1.8", opacity: "0.95", margin: 0 }}>
              The spirit of bayanihan and collective effort has always been at the core of Central’s progress. Through various challenges and triumphs, the residents have consistently demonstrated resilience and dedication to building a better future for all. This rich heritage continues to inspire its leaders and constituents in striving for excellence and sustainable development.
            </p>
          </div>

          <div>
            <div
              style={{
                width: "100%",
                height: "420px",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
              }}
            >
              <img 
                src={historyPhoto} 
                alt="Barangay Central History" 
                onMouseEnter={() => setHistoryHovered(true)}
                onMouseLeave={() => setHistoryHovered(false)}
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  transform: historyHovered ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.4s ease-in-out"
                }} 
              />
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            overflow: "hidden",
            lineHeight: 0,
          }}
        >
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{
              position: "relative",
              display: "block",
              width: "calc(100% + 1.3px)",
              height: "70px",
            }}
          >
            <path
              d="M0,0 C150,90 350,-40 500,50 C650,140 900,10 1200,40 L1200,120 L0,120 Z"
              fill="#ffffff"
            ></path>
          </svg>
        </div>
      </section>

      {/* =========================================
          SEKSYON 4: ORGANIZATION
      ========================================== */}
      <section id="organization" style={{ maxWidth: "1200px", margin: "80px auto 0 auto", padding: "0 5%" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#1e293b" }}>Organization</h2>
          <p style={{ color: "#64748b", fontSize: "15px" }}>Ang mga namumuno sa ating barangay.</p>
        </div>
        <div style={{ textAlign: "center", padding: "40px", background: "#f1f5f9", borderRadius: "12px", color: "#64748b" }}>
          [Ilagay dito ang Organizational Chart o Listahan ng mga Opisyal ng Barangay Central]
        </div>
      </section>
    </div>
  );
};

const goalItemStyle = {
  display: "flex",
  gap: "20px",
  marginBottom: "20px",
  padding: "12px",
  borderRadius: "12px",
  transition: "all 0.3s ease",
  cursor: "pointer",
};

const badgeStyle = {
  minWidth: "40px",
  height: "40px",
  background: "#E8F0E6",
  color: "#00C853",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
  fontSize: "14px",
};

const titleStyle = {
  margin: "0 0 4px 0",
  fontSize: "16px",
  fontWeight: "700",
  color: "#1e293b",
};

const descStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "1.5",
};

export default About;