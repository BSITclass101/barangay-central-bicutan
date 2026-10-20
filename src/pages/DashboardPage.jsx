import React from "react";
import { FaUsers, FaFileAlt, FaHome, FaExclamationTriangle, FaCheckCircle, FaClock } from "react-icons/fa";

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Welcome back, Admin! 👋</h2>
          <p className="text-xs text-gray-300 mt-1">Narito ang buod ng mga kaganapan at transaksiyon sa Barangay Central ngayon.</p>
        </div>
        <div className="bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 px-4 py-2 rounded-lg text-xs font-semibold">
          System Status: Online & Normal
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Residents</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">4,250</h3>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">+12 ngayong buwan</span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl"><FaUsers size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Households</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">1,120</h3>
            <span className="text-[11px] text-blue-600 font-medium mt-1 inline-block">Registered families</span>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl"><FaHome size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Requests</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">45</h3>
            <span className="text-[11px] text-amber-600 font-medium mt-1 inline-block">Kailangan ng aksyon</span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3.5 rounded-xl"><FaFileAlt size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Incident Reports</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">3</h3>
            <span className="text-[11px] text-red-600 font-medium mt-1 inline-block">Active blotters</span>
          </div>
          <div className="bg-red-50 text-red-600 p-3.5 rounded-xl"><FaExclamationTriangle size={20} /></div>
        </div>
      </div>

      {/* RECENT ACTIVITIES & QUICK ACTIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT CERTIFICATE REQUESTS */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Recent Certificate Requests</h3>
            <span className="text-xs text-emerald-600 font-semibold cursor-pointer hover:underline">Tingnan lahat</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase">
                  <th className="py-2.5 px-3">Pangalan</th>
                  <th className="py-2.5 px-3">Uri ng Dokumento</th>
                  <th className="py-2.5 px-3">Petsa</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-800">Juan Dela Cruz</td>
                  <td className="py-3 px-3">Barangay Clearance</td>
                  <td className="py-3 px-3 text-gray-500">Aug 11, 2026</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                      <FaClock size={10} /> Pending
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-800">Maria Santos</td>
                  <td className="py-3 px-3">Certificate of Indigency</td>
                  <td className="py-3 px-3 text-gray-500">Aug 10, 2026</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                      <FaCheckCircle size={10} /> Approved
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* QUICK SHORTCUTS */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Mabilis na Aksyon</h3>
          <div className="space-y-2.5">
            <button className="w-full text-left px-4 py-2.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors flex items-center justify-between">
              <span>+ Magdagdag ng Residente</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full text-left px-4 py-2.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors flex items-center justify-between">
              <span>+ Mag-record ng Blotter</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full text-left px-4 py-2.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors flex items-center justify-between">
              <span>Mag-apruba ng Certificates</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;