import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaLandmark, FaLeaf, FaStethoscope, FaGraduationCap, FaStore } from "react-icons/fa";

const CommunityHighlights = () => {
  const communityPillars = [
    {
      title: "Cultural Heritage",
      description:
        "Mula sa mga ugat nito hanggang sa pag-unlad nito, ipinagmamalaki ng Barangay Culiat ang aming mga tradisyon at kasaysayan.",
      icon: <FaLandmark className="text-lg" style={{ color: "#059669" }} />,
    },
    {
      title: "Green & Sustainable",
      description:
        "Ang mga hardin ng komunidad at mga puno-puno na kalsada ay sumasalamin sa aming pangako sa isang malinis at malusog na kinabukasan.",
      icon: <FaLeaf className="text-lg" style={{ color: "#059669" }} />,
    },
    {
      title: "Health for All",
      description:
        "Ang aming health center ay nagsisiguro ng madaling makuhang pangangalaga at wellness programs para sa aming mga residente.",
      icon: <FaStethoscope className="text-lg" style={{ color: "#059669" }} />,
    },
    {
      title: "Education & Youth",
      description:
        "Ang pangangalaga sa bata at mga programang pang-kabataan ay nag-aalaga ng pag-aaral at liderato mula pa lamang sa maagang edad.",
      icon: <FaGraduationCap className="text-lg" style={{ color: "#059669" }} />,
    },
    {
      title: "Local Livelihood",
      description:
        "Ang maliliit na negosyo at merkado ay nagpapalakas sa aming umuusong lokal na ekonomiya.",
      icon: <FaStore className="text-lg" style={{ color: "#059669" }} />,
    },
  ];

  return (
    <section className="text-white py-20 px-6 relative overflow-hidden pb-32" style={{ backgroundColor: "#00C853" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header & CTA Button */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight max-w-3xl text-white">
            Tuklasin ang aming lokal na komunidad, tradisyon at pag-unlad
          </h2>

          <Link
            to="/about"
            className="bg-[#FFEB3B] hover:bg-[#FDD835] text-slate-900 font-extrabold text-xs md:text-sm px-6 py-3.5 rounded-xl shadow-md transition flex items-center gap-2 uppercase tracking-wide flex-shrink-0"
          >
            Matuto Pa Tungkol Sa Amin <FaArrowRight className="text-xs" />
          </Link>
        </div>

        {/* 5 Pillars Grid (Flat style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {communityPillars.map((pillar, index) => (
            <div key={index} className="flex flex-col items-start">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                {pillar.icon}
              </div>

              <h3 className="text-base font-extrabold text-white mb-2 tracking-wide">
                {pillar.title}
              </h3>

              <p className="text-emerald-50 text-xs leading-relaxed opacity-90">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* White Wave Divider sa Ibaba para mag-blend sa puting background */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "70px",
          display: "block",
        }}
      >
        <path
          fill="#ffffff"
          d="M0,192L48,181.3C96,171,192,150,288,160C384,171,480,213,576,218.7C672,224,768,192,864,181.3C960,171,1056,181,1152,197.3C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </section>
  );
};

export default CommunityHighlights;