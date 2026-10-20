import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaSearch,
} from "react-icons/fa";

const Header = () => {
  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white shadow-sm border-b h-20 flex items-center justify-between px-6">
      {/* Left */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h2>
        <p className="text-sm text-gray-500">{today}</p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96">
        <FaSearch className="text-gray-400 mr-3" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none w-full"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        <button className="relative">
          <FaBell size={20} className="text-gray-600" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </button>

        <div className="flex items-center gap-3">
          <FaUserCircle size={40} className="text-emerald-700" />

          <div className="hidden md:block">
            <h4 className="font-semibold text-gray-800">
              Administrator
            </h4>
            <p className="text-sm text-gray-500">
              Barangay Central Bicutan
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;