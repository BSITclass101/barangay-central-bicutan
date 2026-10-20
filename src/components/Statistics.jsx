import React, { useState, useEffect } from "react";
import { FaUsers, FaHome, FaMale, FaFemale } from "react-icons/fa";

const API_URL = "http://localhost/barangay-api/api/demographics.php";

const Statistics = () => {
  const [stats, setStats] = useState({
    total_residents: 0,
    total_households: 0,
    male_residents: 0,
    female_residents: 0,
  });

  const [loading, setLoading] = useState(true);

  // ===================================================
  // FETCH DEMOGRAPHICS
  // ===================================================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        const result = await res.json();

        console.log("Demographics response:", result);

        if (result.success) {
          setStats({
            total_residents: result.data.total_residents || 0,
            total_households: result.data.total_households || 0,
            male_residents: result.data.male_residents || 0,
            female_residents: result.data.female_residents || 0,
          });
        }
      } catch (err) {
        console.error("DEMOGRAPHICS FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ===================================================
  // STATS CARDS
  // ===================================================
  const statsData = [
    {
      icon: <FaUsers />,
      number: stats.total_residents,
      title: "Total Residents",
    },
    {
      icon: <FaHome />,
      number: stats.total_households,
      title: "Households",
    },
    {
      icon: <FaMale />,
      number: stats.male_residents,
      title: "Male Residents",
    },
    {
      icon: <FaFemale />,
      number: stats.female_residents,
      title: "Female Residents",
    },
  ];

  return (
    <section
      id="statistics"
      style={{
        background: "#ffffff",
        padding: "70px 20px",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "45px",
          fontWeight: "700",
          color: "#1e293b",
        }}
      >
        Barangay Demographics
      </h2>

      <p
        style={{
          textAlign: "center",
          color: "#64748b",
          marginTop: "6px",
          fontSize: "16px",
        }}
      >
        Key statistics about our community
      </p>

      <div
        style={{
          marginTop: "60px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
          gap: "30px",
          maxWidth: "1200px",
          marginInline: "auto",
        }}
      >
        {statsData.map((item, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "15px",
              padding: "35px",
              textAlign: "center",
              boxShadow: "0 8px 25px rgba(0,0,0,.08)",
              transition: ".3s",
            }}
          >
            {/* ICON CONTAINER */}
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "#00C853",
                color: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto 25px",
                fontSize: "30px",
                boxShadow: "0 4px 15px rgba(5, 150, 105, 0.3)",
              }}
            >
              {item.icon}
            </div>

            {/* NUMBER */}
            <h1
              style={{
                fontSize: "36px",
                marginBottom: "10px",
                color: "#1e293b",
                fontWeight: "800",
                minHeight: "44px",
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: "inline-block",
                    width: "60px",
                    height: "30px",
                    background: "#e2e8f0",
                    borderRadius: "6px",
                  }}
                />
              ) : (
                item.number
              )}
            </h1>

            {/* TITLE */}
            <p
              style={{
                color: "#64748b",
                fontSize: "18px",
                fontWeight: "500",
              }}
            >
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Statistics;