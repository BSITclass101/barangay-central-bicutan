import React from "react";
import { 
  FaFileAlt, 
  FaHome, 
  FaStore, 
  FaUsers, 
  FaBriefcase, 
  FaHeartbeat, 
  FaHandsHelping, 
  FaClock, 
  FaIdCard 
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const ServicesSection = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: <FaFileAlt />,
      title: "Barangay Clearance",
      category: "Certificates",
      fee: "Free",
      time: "Same day",
      link: "/services/barangay-clearance",
    },
    {
      icon: <FaHome />,
      title: "Certificate of Residency",
      category: "Certificates",
      fee: "₱50",
      time: "Same day",
      link: "/services/certificate-of-residency",
    },
    {
      icon: <FaStore />,
      title: "Business Permit",
      category: "Business & Permits",
      fee: "₱500",
      time: "Same day",
      link: "/services/business-permit",
    },
    {
      icon: <FaUsers />,
      title: "Certificate of Indigency",
      category: "Certificates",
      fee: "Free",
      time: "Same day",
      link: "/services/certificate-of-indigency",
    },
    {
      icon: <FaIdCard />,
      title: "Barangay ID",
      category: "Identification",
      fee: "₱100",
      time: "Same day",
      link: "/services/barangay-id",
    },
    {
      icon: <FaBriefcase />,
      title: "Barangay Permit",
      category: "Permits",
      fee: "Varies",
      time: "Same day",
      link: "/services/barangay-permit"
    },
    {
      icon: <FaHeartbeat />,
      title: "Health Services",
      category: "Medical Services",
      fee: "Free",
      time: "Daily",
      link: "/services/health-services"
    },
    {
      icon: <FaHandsHelping />,
      title: "Social Welfare",
      category: "Community Services",
      fee: "Free",
      time: "1–3 Days",
      link: "/services/social-welfare",
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* SECTION BADGE */}
        <div className="flex justify-center mb-4">
          <span 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full uppercase tracking-widest text-xs font-bold"
            style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
          >
            <HiSparkles className="text-base" />
            Barangay Services
          </span>
        </div>

        <h2 className="text-5xl font-extrabold text-center text-slate-900">
          How Can We Help You?
        </h2>

        <p className="text-center text-gray-500 mt-4 max-w-3xl mx-auto leading-8">
          Browse official barangay services. Click any card to view
          requirements, fees, and processing time.
        </p>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {services.map((service, index) => (
            <div
              key={index}
              onClick={() => {
                if (service.link) {
                  navigate(service.link);
                }
              }}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            >
              {/* Top Accent Line */}
              <div className="h-1" style={{ backgroundColor: "#059669" }}></div>

              <div className="p-5 flex flex-col h-[225px]">
                
                {/* ICON BOX */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg mb-4 transition-all duration-500 ease-out transform group-hover:-rotate-12 group-hover:scale-110 group-hover:-translate-y-1"
                  style={{ backgroundColor: "#059669" }}
                >
                  {service.icon}
                </div>

                <h3 
                  className="text-base font-bold text-slate-900 min-h-[46px] leading-snug transition-colors duration-300 group-hover:opacity-80"
                >
                  {service.title}
                </h3>

                <p className="text-xs text-gray-400 mt-1">
                  {service.category}
                </p>

                <div className="mt-auto">
                  <div className="border-t pt-3 mt-4 flex justify-between items-center text-[11px] text-gray-500">
                    <span>{service.fee}</span>

                    <span className="flex items-center gap-1">
                      <FaClock className="text-[10px]" />
                      {service.time}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (service.link) {
                          navigate(service.link);
                        }
                      }}
                      className="font-semibold transition-all duration-300 group-hover:translate-x-1"
                      style={{ color: "#059669" }}
                    >
                      View →
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="flex justify-center gap-4 mt-14 flex-wrap">
          <button 
            className="text-white px-8 py-3 rounded-xl font-semibold transition shadow-sm hover:opacity-90"
            style={{ backgroundColor: "#059669" }}
          >
            Browse All Services →
          </button>

          <button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 px-8 py-3 rounded-xl font-semibold transition">
            Request a Document
          </button>
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;