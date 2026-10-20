// src/pages/BarangayCouncil.jsx
import React, { useState, useEffect } from "react";
import captainImg from "../assets/picture/captain.jpg";
import iyaImg from "../assets/picture/IYA.png";
import aragoImg from "../assets/picture/ARAGO.png";
import perezImg from "../assets/picture/perez.png";
import chrisImg from "../assets/picture/chris.png";
import dulImg from "../assets/picture/dulang.png";
import logo from "../assets/picture/logo (2).png";
import venaImg from "../assets/picture/VENA.png";
import tanImg from "../assets/picture/TAN.png";

import {
  FaFacebookF,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaRegClock,
  FaDirections,
} from "react-icons/fa";

import { api } from "../api/client";

// ✅ Default fallback values (kung hindi pa nag-load mula DB)
const DEFAULT_SETTINGS = {
  barangay_name: "BARANGAY CENTRAL",
  city: "Taguig City",
  address: "Central Bicutan, Taguig City, Metro Manila",
  email: "brgy.centralbicutan@gmail.com",
  contact_number: "9989692830",
  mobile_number: "09626836893",
  office_hours: "Monday - Friday, 8:00 AM - 5:00 PM",
  facebook_url: "https://www.facebook.com/profile.php?id=61552727621629",
};

// Constants for external links
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Barangay+Central+Bicutan+Taguig+City";
const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.859604112005!2d121.0500!3d14.5000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8a6b0a5f4b5%3A0x8e7a8b7f3c2a1d0e!2sBarangay%20Central%20Bicutan%2C%20Taguig%20City!5e0!3m2!1sen!2sph!4v1600000000000";

const BarangayCouncil = () => {
  // ✅ Barangay Settings State (dynamic mula DB)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // ✅ Fetch settings mula DB pagka-load
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success && res.data) {
          setSettings({
            barangay_name: res.data.barangay_name || DEFAULT_SETTINGS.barangay_name,
            city: res.data.city || DEFAULT_SETTINGS.city,
            address: res.data.address || DEFAULT_SETTINGS.address,
            email: res.data.email || DEFAULT_SETTINGS.email,
            contact_number: res.data.contact_number || DEFAULT_SETTINGS.contact_number,
            mobile_number: res.data.mobile_number || DEFAULT_SETTINGS.mobile_number,
            office_hours: res.data.office_hours || DEFAULT_SETTINGS.office_hours,
            facebook_url: res.data.facebook_url || DEFAULT_SETTINGS.facebook_url,
          });
        }
      } catch (err) {
        console.error("Failed to load barangay settings:", err);
      }
    };
    loadSettings();
  }, []);

  // Punong Barangay
  const captain = {
    name: "Rodjie Tangpuz",
    title: "Kilalanin ang Punong Barangay ng Barangay Central",
    description: `Si Kap. Rodjie Tangpuz ay naglaan ng maraming taon sa serbisyo publiko, nag-aambag sa paglaki ng isang inklusibong lipunan at transparensya sa Barangay Central. Ang kanyang pamumuno ay patuloy na nagpapataas sa kapakanan ng pamilya at nagbibigay kapangyarihan sa mga inisyatibang pangkomunidad.`,
    subDescription: `Nakatuon sa kalusugan, edukasyon, at lokal na kabuhayan, na nagsisiguro na ang bawat mamamayan ay may boses sa pagbuo ng isang progresibo at sustainable na Barangay.`,
    quote: "Pamununo sa Pamamagitan ng Serbisyo",
    image: captainImg,
  };

  // Mga Kagawad
  const councilors = [
    { name: " KYLA TAN ", role: "SK Chairman", position: "SK CHAIR", image: tanImg },
    { name: "IYA BALMORI", role: "Barangay Kagawad", position: "KGD.", image: iyaImg },
    { name: "VENA CASTRO", role: "Barangay Kagawad", position: "KGD.", image: venaImg },
    { name: "LEAH PEREZ BALARES", role: "Barangay Kagawad", position: "KGD.", image: perezImg },
    { name: "CRIS SANARES", role: "Barangay Kagawad", position: "KGD.", image: chrisImg },
    { name: "PONG DULANG", role: "Barangay Kagawad", position: "KGD.", image: dulImg },
    { name: "JESSIE ARAGO JR.", role: "Barangay Kagawad", position: "KGD.", image: aragoImg },
  ];

  const renderImage = (src, alt, className = "w-full h-full object-cover") => {
    if (src) {
      return <img src={src} alt={alt} className={className} />;
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-xs font-semibold">
        {alt.split(" ").map((word) => word[0]).join("").slice(0, 2)}
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* 1. PUNONG BARANGAY SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
              {captain.title}
            </h2>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
              {captain.description}
            </p>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8">
              {captain.subDescription}
            </p>

            <div className="border-l-4 pl-4 py-1" style={{ borderColor: "#FACC15" }}>
              <p className="text-slate-800 font-bold italic text-sm md:text-base">
                "{captain.quote}"
              </p>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
                — HON. {captain.name.toUpperCase()}, Punong Barangay
              </span>
            </div>
          </div>

          <div className="w-full lg:w-[45%] flex justify-center">
            <div className="bg-slate-50 p-4 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
              <div className="w-full h-[380px] bg-slate-200 rounded-2xl overflow-hidden flex items-center justify-center">
                {renderImage(captain.image, captain.name)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COUNCIL MEMBERS */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Dedicated Council Members
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {councilors.map((member, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col items-center text-center"
            >
              <div
                className="w-28 h-28 rounded-full border-2 p-1 mb-5 flex items-center justify-center overflow-hidden"
                style={{ borderColor: "#059669", backgroundColor: "#ecfdf5" }}
              >
                <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                  {renderImage(member.image, member.name, "w-full h-full object-cover")}
                </div>
              </div>

              <h3 className="text-sm font-black text-indigo-900 tracking-wide uppercase mb-1">
                {member.position} {member.name}
              </h3>

              <p className="text-xs font-bold" style={{ color: "#00C853" }}>
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FOOTER — ✅ DYNAMIC NA */}
      <footer className="bg-[#044c34] text-white pt-10 pb-8 px-8 font-sans relative border-t border-emerald-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-10 items-start">
          {/* Column 1: Logo */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logo}
                alt="Barangay Central Logo"
                className="w-12 h-12 object-contain bg-white rounded-full p-0.5"
              />
              <div>
                {/* ✅ DYNAMIC — mula DB */}
                <h3 className="font-extrabold text-base tracking-wider leading-tight uppercase">
                  {settings.barangay_name}
                </h3>
                <p className="text-[11px] text-emerald-200 font-medium">
                  {settings.city}
                </p>
              </div>
            </div>

            <p className="text-xs text-emerald-100/80 leading-relaxed mb-6 max-w-sm">
              Serving our community with transparency, dedication, and
              excellence. Building a safer and unified {settings.barangay_name} for all
              residents.
            </p>

            {settings.facebook_url && (
              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Page"
                className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center text-xs hover:bg-emerald-700 transition text-emerald-200"
              >
                <FaFacebookF />
              </a>
            )}
          </div>

          {/* Column 2: Contact — ✅ DYNAMIC */}
          <div className="md:col-span-4">
            <h4 className="font-bold text-sm mb-4 text-white">Contact Us</h4>
            <ul className="space-y-3 text-xs text-emerald-100/90">
              <li className="flex items-start gap-2.5">
                <FaMapMarkerAlt className="text-emerald-400 text-xs mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold block text-white">
                    {settings.barangay_name}
                  </span>
                  <span>{settings.address}</span>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <FaEnvelope className="text-emerald-400 text-xs flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:underline">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <FaPhoneAlt className="text-emerald-400 text-xs mt-0.5 flex-shrink-0" />
                <div>
                  {settings.contact_number && <p>{settings.contact_number}</p>}
                  {settings.mobile_number && <p>{settings.mobile_number}</p>}
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <FaRegClock className="text-emerald-400 text-xs flex-shrink-0" />
                <span>{settings.office_hours}</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Map */}
          <div className="md:col-span-4 flex flex-col items-start">
            <h4 className="font-bold text-sm mb-4 text-white">Location Map</h4>
            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-emerald-600/30 shadow-md mb-3">
              <iframe
                title="Barangay Hall Map"
                src={MAP_EMBED_SRC}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white font-semibold underline"
            >
              <FaDirections />
              View on Google Maps
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto border-t border-emerald-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/70">
          <p>
            &copy; {new Date().getFullYear()} {settings.barangay_name} E-Services. All
            rights reserved.
          </p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a href="#privacy" className="hover:underline">Privacy Policy</a>
            <a href="#terms" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BarangayCouncil;