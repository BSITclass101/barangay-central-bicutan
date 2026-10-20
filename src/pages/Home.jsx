import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import barangay from "../assets/picture/bicutan.png";
import logo from "../assets/picture/logo (2).png";
import Carousel from "../components/Carousel";
import Statistics from "../components/Statistics";
import ServicesSection from "../components/ServicesSection";
import CommunityHighlights from "../components/CommunityHighlights";
import BarangayCouncil from "../components/BarangayCouncil";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const targetId = location.state.scrollTo;
      let attempts = 0;
      
      const checkElement = setInterval(() => {
        const section = document.getElementById(targetId);
        attempts++;

        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          window.history.replaceState({}, document.title);
          clearInterval(checkElement);
        } else if (attempts >= 15) {
          clearInterval(checkElement);
        }
      }, 100);

      return () => clearInterval(checkElement);
    }
  }, [location]);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          height: "100vh",
          position: "relative",
          overflow: "hidden",
          backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${barangay})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
        }}
      >
        <div>
          {/* Logo */}
          <img
            src={logo}
            alt="Barangay Logo"
            style={{
              width: "120px",
              height: "120px",
              display: "block",
              margin: "0 auto 20px",
              objectFit: "contain",
              transform: "translateY(20px)",
            }}
          />

          {/* Title */}
          <h1
            style={{
              fontSize: "70px",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            BARANGAY CENTRAL
          </h1>

          {/* District */}
          <h2
            style={{
              fontSize: "20px",
              color: "#00d26a",
              marginBottom: "20px",
              fontWeight: "400",
              letterSpacing: "1px",
            }}
          >
            District II, Taguig City
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: "16px",
              maxWidth: "650px",
              margin: "auto",
              lineHeight: "28px",
              color: "#f1f1f1",
            }}
          >
            Malugod po kayong tinatanggap sa opisyal na e-services portal ng
            Barangay Central. Ang aming platform ay ginawa upang mabigyan ang
            bawat residente ng madali, mabilis, at maginhawang paraan upang
            ma-access ang iba't ibang serbisyo ng barangay—kabilang ang
            paghingi ng mga dokumento, mga anunsyo sa komunidad, at
            mahahalagang impormasyon. Layunin naming maihatid ang mas
            episyente at modernong serbisyo para sa lahat ng mamamayan.
          </p>

          {/* Buttons Container - Nakagitna at madaling i-click */}
          <div 
            style={{ 
              marginTop: "35px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px", // Nagbibigay ng pantay na agwat sa pagitan ng buttons para hindi magkadikit
              flexWrap: "wrap"
            }}
          >
            {/* Explore Our Community Button */}
            <button
              onClick={() => {
                const element = document.getElementById("carousel");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)"; 
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "white";
              }}
              style={{
                padding: "12px 30px",
                background: "transparent",
                color: "white",
                border: "2px solid white",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
            >
              Explore Our Community
            </button>

            {/* View Services Button */}
            <button
              onClick={() => {
                const element = document.getElementById("services");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#00b046"; // Mas matingkad na green pag tinapatan
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#00C853"; // Babalik sa original green
              }}
              style={{
                padding: "12px 30px",
                background: "#00C853",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
            >
              View Services
            </button>
          </div>
        </div>

        {/* Wave Divider */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "120px",
            display: "block",
          }}
        >
          <path
            fill="#0f172a"
            d="M0,224L80,229.3C160,235,320,245,480,234.7C640,224,800,192,960,181.3C1120,171,1280,181,1360,186.7L1440,192L1440,320L0,320Z"
          />
        </svg>
      </section>

      {/* Carousel Section */}
      <section
        id="carousel"
        style={{
          background: "#0f172a",
          marginTop: "-2px",
          position: "relative",
        }}
      >
        <Carousel />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{
            display: "block",
            width: "100%",
            height: "120px",
          }}
        >
          <path
            fill="#ffffff"
            d="M0,224L80,229.3C160,235,320,245,480,234.7C640,224,800,192,960,181.3C1120,171,1280,181,1360,186.7L1440,192L1440,320L0,320Z"
          />
        </svg>
      </section>

      {/* Statistics Section */}
      <section id="statistics">
        <Statistics />
      </section>

      {/* Services Section */}
      <section id="services">
        <ServicesSection />
      </section>

      {/* Community Highlights */}
      <section id="community-highlights">
        <CommunityHighlights />
      </section>

      {/* Barangay Council Section */}
      <section id="barangay-council">
        <BarangayCouncil />
      </section>
    </>
  );
};

export default Home;