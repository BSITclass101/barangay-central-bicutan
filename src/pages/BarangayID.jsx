import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaChevronDown,
  FaBell,
  FaSignInAlt,
  FaRegClock,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaRegFileAlt,
  FaListOl,
  FaLightbulb,
  FaHome,
  FaBriefcase,
  FaIdCard,
  FaHeartbeat,
  FaFileContract,
  FaEnvelope,
  FaPhoneAlt,
  FaFacebookF,
  FaDirections,
  FaArrowUp,
} from "react-icons/fa";
import { FaHandHoldingHeart, FaShieldHalved } from "react-icons/fa6";
import { HiSparkles } from "react-icons/hi2";

import logo from "../assets/picture/logo (2).png";

const BarangayIDPage = () => {
  const [activeTip, setActiveTip] = useState(null);

  // States para sa hover dropdowns sa navbar
  const [homeOpen, setHomeOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [downloadsOpen, setDownloadsOpen] = useState(false);

  // Awtomatikong mag-scroll sa pinakataas pagka-load ng pahina
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requirements = [
    {
      id: 1,
      text: "Valid Barangay Clearance (issued within the last 3 months)",
    },
    {
      id: 2,
      text: "Proof of Residency (e.g., Electric bill, Water bill, or Lease contract)",
    },
    {
      id: 3,
      text: "Photocopy of any Government-issued ID or Birth Certificate",
    },
    {
      id: 4,
      text: "Recent 1x1 or 2x2 ID picture with white background",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Prepare Requirements",
      description:
        "Secure a valid barangay clearance, proof of residency, your ID photo, and a supporting identification document.",
    },
    {
      number: "02",
      title: "Visit the Barangay Hall",
      description:
        "Go to the Barangay Central ID processing window and submit your complete requirements for verification.",
    },
    {
      number: "03",
      title: "Picture Taking & Biometrics",
      description:
        "Proceed to the capture station for your digital photo and signature recording for the ID card.",
    },
    {
      number: "04",
      title: "Payment of Processing Fee",
      description:
        "Pay the corresponding ID processing fee (₱100) at the designated cashier window and keep your receipt.",
    },
    {
      number: "05",
      title: "Claim Your Barangay ID",
      description:
        "Wait for your ID to be printed and claim it upon presentation of your official receipt.",
    },
  ];

  const tips = [
    {
      title: "Get a Barangay Clearance First",
      description:
        "Make sure you have an active barangay clearance before applying, as it serves as primary proof of good standing.",
    },
    {
      title: "Wear Proper Attire",
      description:
        "Since your photo will be captured on-site for an official ID, wear decent, collared clothing.",
    },
    {
      title: "Keep Your Claiming Receipt",
      description:
        "Do not lose your official payment receipt as it is required when claiming your printed Barangay ID.",
    },
  ];

  const otherServices = [
    {
      title: "Barangay Clearance",
      icon: <FaShieldHalved className="text-emerald-600 text-xl" />,
    },
    {
      title: "Certificate of Residency",
      icon: <FaHome className="text-emerald-600 text-xl" />,
    },
    {
      title: "Certificate of Indigency",
      icon: <FaHandHoldingHeart className="text-emerald-600 text-xl" />,
    },
    {
      title: "Business Permit",
      icon: <FaBriefcase className="text-emerald-600 text-xl" />,
    },
    {
      title: "Barangay Permit",
      icon: <FaFileContract className="text-emerald-600 text-xl" />,
    },
    {
      title: "Health Services & Social Welfare",
      icon: <FaHeartbeat className="text-emerald-600 text-xl" />,
    },
  ];

  const fbPageUrl = "https://www.facebook.com/profile.php?id=61552727621629";
  const mapsUrl = "https://maps.app.goo.gl/kzmeSdXGovHGZ8dSA";

  return (
    <div className="w-full min-h-screen font-sans bg-slate-50 text-slate-800 flex flex-col justify-between relative">
      <div>
        {/* Navigation Bar */}
        <nav className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm relative z-50">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Barangay Logo"
              className="w-10 h-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wide leading-tight text-slate-900">
                BARANGAY CENTRAL
              </span>
              <span className="text-[10px] font-bold text-emerald-600 tracking-widest">
                E-SERVICES
              </span>
            </div>
          </div>

          <ul className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wider text-gray-700 uppercase">
            {/* Home Dropdown */}
            <li
              className="relative py-2"
              onMouseEnter={() => setHomeOpen(true)}
              onMouseLeave={() => setHomeOpen(false)}
            >
              <div className="flex items-center gap-1 cursor-pointer hover:text-emerald-600 uppercase">
                Home
                <FaChevronDown
                  className={`text-[9px] transition-transform duration-200 ${
                    homeOpen ? "rotate-180 text-emerald-600" : ""
                  }`}
                />
              </div>

              {homeOpen && (
                <div className="absolute top-full left-0 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50">
                  <Link
                    to="/"
                    onClick={() => setHomeOpen(false)}
                    className="block px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 font-medium normal-case text-xs transition"
                  >
                    Main Home
                  </Link>
                </div>
              )}
            </li>

            {/* Services Dropdown */}
            <li
              className="relative py-2"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <div className="flex items-center gap-1 cursor-pointer hover:text-emerald-600 uppercase">
                Services
                <FaChevronDown
                  className={`text-[9px] transition-transform duration-200 ${
                    servicesOpen ? "rotate-180 text-emerald-600" : ""
                  }`}
                />
              </div>

              {servicesOpen && (
                <div className="absolute top-full left-0 w-64 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50">
                  <Link
                    to="/services/barangay-clearance"
                    onClick={() => setServicesOpen(false)}
                    className="block px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 font-medium normal-case text-xs transition"
                  >
                    Barangay Clearance
                  </Link>
                  <Link
                    to="/services/barangay-id"
                    onClick={() => setServicesOpen(false)}
                    className="block px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 font-medium normal-case text-xs transition"
                  >
                    Barangay ID
                  </Link>
                  <Link
                    to="/services/certificate-of-indigency"
                    onClick={() => setServicesOpen(false)}
                    className="block px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 font-medium normal-case text-xs transition"
                  >
                    Certificate of Indigency
                  </Link>
                  <Link
                    to="/services/certificate-of-residency"
                    onClick={() => setServicesOpen(false)}
                    className="block px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 font-medium normal-case text-xs transition"
                  >
                    Certificate of Residency
                  </Link>
                </div>
              )}
            </li>

            {/* Downloads Dropdown */}
            <li
              className="relative py-2"
              onMouseEnter={() => setDownloadsOpen(true)}
              onMouseLeave={() => setDownloadsOpen(false)}
            >
              <div className="flex items-center gap-1 cursor-pointer hover:text-emerald-600 uppercase">
                Downloads{" "}
                <FaChevronDown
                  className={`text-[9px] transition-transform duration-200 ${
                    downloadsOpen ? "rotate-180 text-emerald-600" : ""
                  }`}
                />
              </div>

              {downloadsOpen && (
                <div className="absolute top-full left-0 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50">
                  <a
                    href="#form-clearance"
                    className="block px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 font-medium normal-case text-xs transition"
                  >
                    Barangay Ordinance
                  </a>
                  <a
                    href="#form-permit"
                    className="block px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 font-medium normal-case text-xs transition"
                  >
                    Executive Order
                  </a>
                </div>
              )}
            </li>

            <li className="cursor-pointer hover:text-emerald-600">Report</li>
            <li className="flex items-center gap-1 cursor-pointer hover:text-emerald-600">
              About <FaChevronDown className="text-[9px]" />
            </li>
          </ul>

          <div className="flex items-center gap-4 text-xs font-bold">
            <button className="text-gray-600 hover:text-emerald-600 p-1">
              <FaBell className="text-sm" />
            </button>

            <a
              href="#login"
              className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 tracking-wider uppercase"
            >
              <FaSignInAlt className="text-sm" /> LOGIN
            </a>

            <a
              href="#register"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded font-semibold tracking-wider text-[11px] uppercase transition"
            >
              REGISTER
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-[520px] bg-gradient-to-br from-[#06201b] via-[#083a2f] to-[#041a15] text-white px-8 py-8 flex flex-col justify-between">
          <div className="max-w-6xl mx-auto w-full mt-2">
            <div className="text-[11px] font-semibold text-emerald-100/60 uppercase tracking-wider mb-8 flex items-center gap-1">
              <Link to="/" className="hover:text-emerald-400 transition">HOME</Link>
              <span>&gt;</span>
              <Link to="/services" className="hover:text-emerald-400 transition">SERVICES</Link>
              <span>&gt;</span>{" "}
              <span className="text-emerald-400 font-bold">BARANGAY ID</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6 backdrop-blur-md">
                  <HiSparkles className="text-xs" />
                  IDENTIFICATION CARD
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4 text-white">
                  Barangay ID
                </h1>

                <p className="text-emerald-100/70 text-sm md:text-base max-w-xl leading-relaxed">
                  Official identification card issued to bonafide residents of Barangay Central for local transactions and emergency use.
                </p>
              </div>

              <div className="lg:col-span-5 flex justify-start lg:justify-end">
                <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-emerald-400 rounded-xl flex items-center justify-center text-slate-900 shadow-md">
                      <FaIdCard className="text-xl" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-emerald-200/50 uppercase tracking-widest block">
                        BARANGAY SERVICE
                      </span>
                      <h3 className="text-base font-bold text-white tracking-wide">
                        Barangay Central
                      </h3>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[9px] text-emerald-200/50 uppercase font-semibold block leading-none">
                        FEE
                      </span>
                      <span className="font-bold text-white text-xs">₱100</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaRegClock className="text-emerald-400 text-sm" />
                      <div>
                        <span className="text-[9px] text-emerald-200/50 uppercase font-semibold block leading-none">
                          PROCESSING
                        </span>
                        <span className="font-bold text-white text-xs">
                          Same day
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-emerald-200/40 uppercase tracking-widest font-semibold mt-10">
            SCROLL DOWN
            <FaChevronDown className="mx-auto mt-1 text-xs animate-bounce" />
          </div>
        </section>

        {/* Overview Section */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs tracking-wider uppercase mb-4">
                <FaCheckCircle className="text-sm" />
                ABOUT THIS SERVICE
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Everything you need to know about Barangay ID
              </h2>

              <p className="text-slate-600 leading-relaxed mb-8 text-base">
                The Barangay ID is a primary form of local identification issued to registered residents of Barangay Central. It serves as a valid proof of identity and residency for everyday transactions, local applications, and emergency coordination within the community.
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 font-bold text-xs px-4 py-2 rounded-full">
                  Fee: ₱100
                </span>
                <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-bold text-xs px-4 py-2 rounded-full">
                  <FaRegClock className="text-sm" /> Same day
                </span>
                <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 font-bold text-xs px-4 py-2 rounded-full">
                  <FaMapMarkerAlt className="text-sm" /> Barangay Hall
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 relative">
                <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <FaShieldHalved className="text-xs" /> OFFICIAL
                </div>

                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-md mb-4">
                  <FaIdCard />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-6">
                  Quick Overview
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      AMOUNT
                    </span>
                    <span className="text-base font-extrabold text-slate-800">
                      ₱100
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <FaRegClock className="text-blue-500 text-lg mb-2" />
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      TURNAROUND
                    </span>
                    <span className="text-base font-extrabold text-slate-800">
                      Same day
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <FaRegFileAlt className="text-amber-500 text-lg mb-2" />
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      REQUIREMENTS
                    </span>
                    <span className="text-base font-extrabold text-slate-800">
                      4
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <FaListOl className="text-purple-500 text-lg mb-2" />
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      STEPS
                    </span>
                    <span className="text-base font-extrabold text-slate-800">
                      5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="bg-white py-16 border-y border-slate-100">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs tracking-wider uppercase mb-2">
                <FaRegFileAlt className="text-sm" /> WHAT YOU NEED
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Requirements
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
                Make sure you have all the following documents ready before visiting
                the Barangay Hall.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-200 transition"
                >
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-emerald-500 text-lg mt-0.5 flex-shrink-0" />
                    <span className="text-xs md:text-sm font-semibold text-slate-700 leading-snug">
                      {req.text}
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 font-extrabold text-xs px-2.5 py-1 rounded-lg ml-4">
                    {req.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Procedure Section */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs tracking-wider uppercase mb-2">
              <HiSparkles className="text-sm" /> STEP BY STEP
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Procedure
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Follow these simple steps to complete your Barangay ID application.
            </p>
          </div>

          <div className="relative pl-6 md:pl-10 border-l-2 border-emerald-200 space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="absolute -left-[37px] md:-left-[53px] top-0 w-10 h-10 md:w-12 md:h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-sm md:text-base shadow-md group-hover:scale-105 transition">
                  {step.number}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm ml-4 hover:shadow-md transition">
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tips Section */}
        <section className="bg-[#0b192c] text-white py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                <FaLightbulb className="text-xs" /> PRO TIPS
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                Tips for Faster Processing
              </h2>

              <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto">
                Save time and avoid hassle with these helpful reminders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tips.map((tip, index) => {
                const isActive = activeTip === index;

                return (
                  <div
                    key={index}
                    onMouseEnter={() => setActiveTip(index)}
                    onMouseLeave={() => setActiveTip(null)}
                    className={`relative bg-[#112239] border rounded-2xl p-6 transition-all duration-300 cursor-pointer overflow-hidden ${
                      isActive
                        ? "border-emerald-500/50 shadow-lg shadow-emerald-950/40 -translate-y-1"
                        : "border-slate-700/50"
                    }`}
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 bg-emerald-400 rounded-t-2xl transition-opacity duration-300 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 ${
                        isActive
                          ? "bg-emerald-500 text-slate-900"
                          : "bg-emerald-950/70 border border-emerald-500/40 text-emerald-400"
                      }`}
                    >
                      <FaLightbulb className="text-base" />
                    </div>

                    <h3 className="text-base font-bold text-white mb-3">
                      {tip.title}
                    </h3>

                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Explore Other Services Section */}
        <section className="bg-slate-50 py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-center text-slate-900 tracking-tight mb-10">
              Explore Other Services
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {otherServices.map((service, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200 flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px]"
                >
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
                    {service.icon}
                  </div>
                  <span className="text-xs md:text-sm font-bold text-slate-800 leading-snug">
                    {service.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER SECTION */}
      <footer className="bg-[#044c34] text-white pt-10 pb-8 px-8 font-sans relative border-t border-emerald-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-10 items-start">
          
          {/* Column 1: Logo & Info */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logo}
                alt="Barangay Logo"
                className="w-12 h-12 object-contain bg-white rounded-full p-0.5"
              />
              <div>
                <h3 className="font-extrabold text-base tracking-wider leading-tight uppercase">
                  BARANGAY CENTRAL
                </h3>
                <p className="text-[11px] text-emerald-200 font-medium">Taguig City</p>
              </div>
            </div>

            <p className="text-xs text-emerald-100/80 leading-relaxed mb-6 max-w-sm">
              Serving our community with transparency, dedication, and excellence.
              Building a safer and unified Barangay Central for all residents.
            </p>

            <a
              href={fbPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Page"
              className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center text-xs hover:bg-emerald-700 transition text-emerald-200"
            >
              <FaFacebookF />
            </a>
          </div>

          {/* Column 2: Contact Us */}
          <div className="md:col-span-4">
            <h4 className="font-bold text-sm mb-4 text-white">Contact Us</h4>

            <ul className="space-y-3 text-xs text-emerald-100/90">
              <li className="flex items-start gap-2.5">
                <FaMapMarkerAlt className="text-emerald-400 text-xs mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold block text-white">
                    BARANGAY CENTRAL BICUTAN
                  </span>
                  <span>Central Bicutan, Taguig City, Metro Manila</span>
                </div>
              </li>

              <li className="flex items-center gap-2.5">
                <FaEnvelope className="text-emerald-400 text-xs flex-shrink-0" />
                <a
                  href="mailto:brgy.centralbicutan@gmail.com"
                  className="hover:underline"
                >
                  brgy.centralbicutan@gmail.com
                </a>
              </li>

              <li className="flex items-start gap-2.5">
                <FaPhoneAlt className="text-emerald-400 text-xs mt-0.5 flex-shrink-0" />
                <div>
                  <p>9989692830</p>
                  <p>09626836893</p>
                </div>
              </li>

              <li className="flex items-center gap-2.5">
                <FaRegClock className="text-emerald-400 text-xs flex-shrink-0" />
                <span>Monday - Friday, 8:00 AM - 5:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Location Map */}
          <div className="md:col-span-4 flex flex-col items-start">
            <h4 className="font-bold text-sm mb-4 text-white">Location Map</h4>

            {/* Map Container */}
            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-emerald-600/30 shadow-md mb-3">
              <iframe
                title="Barangay Central Location Map"
                src="https://maps.google.com/maps?q=Central%20Bicutan%20Barangay%20Hall%20Taguig&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>

            <div className="w-full flex items-center justify-between gap-2 mt-1">
              <p className="text-[11px] text-emerald-100/80 max-w-[200px] leading-tight">
                Visit our barangay hall for in-person services and assistance.
              </p>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-emerald-950 font-bold text-[11px] py-2 px-3 rounded-md shadow hover:bg-emerald-50 transition flex items-center gap-1.5 flex-shrink-0"
              >
                <FaDirections className="text-emerald-700 text-xs" />
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto border-t border-emerald-800/80 pt-4 flex flex-col md:flex-row justify-between items-center text-[11px] text-emerald-200/80 gap-3">
          <div>
            <p>
              © 2026 Barangay Central | Managed by Barangay Central Information Office
            </p>
            <p className="text-[10px] text-emerald-300/60 mt-0.5">
              Powered by Prince IT Solutions
            </p>
          </div>

          <div className="flex items-center gap-5">
            <a href="#terms" className="hover:underline">
              Terms & Conditions
            </a>
            <a href="#privacy" className="hover:underline">
              Privacy Policy
            </a>
            <a
              href={fbPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Facebook
            </a>
          </div>
        </div>

        {/* Back to Top Floating Button */}
        <button
          onClick={scrollToTop}
          className="absolute right-6 bottom-6 bg-emerald-400 hover:bg-emerald-300 text-slate-900 p-2.5 rounded-full shadow-lg transition"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="text-xs" />
        </button>
      </footer>
    </div>
  );
};

export default BarangayIDPage;