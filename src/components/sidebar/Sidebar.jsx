import React, { useState } from "react";
import { FaCog, FaSignOutAlt, FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import CEDUGAMES from "../../assets/CEDUGAMES.png";
import {
  FaUserGraduate,
  FaBook,
  FaChartLine,
  FaSchool,
  FaTrophy,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { canAccess } from "../../data/adminAuth";

const Sidebar = ({ children, onSelectPage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <FaUserGraduate /> },
    {
      to: "/user-management",
      label: "User Management",
      icon: <FaUserGraduate />,
    },
    { to: "/content", label: "Content", icon: <FaBook /> },
    { to: "/leaderboard", label: "Leaderboard", icon: <FaChartLine /> },
    { to: "/coin-system", label: "Coin System", icon: <FaSchool /> },
    { to: "/categories", label: "Categories/Levels", icon: <FaTrophy /> },
    { to: "/notifications", label: "Notifications", icon: <FaChartLine /> },
    { to: "/settings", label: "Settings", icon: <FaSchool /> },
    { to: "/admins", label: "Admins", icon: <FaCog />, page: "admins" },
    { to: "/log-out", label: "Log Out", icon: <FaSignOutAlt /> },
  ].filter(({ to, page }) => canAccess(user, page || to.split("/")[1]));

  return (
    <div className=" font-Outfit">
      <button
        className="absolute top-6 left-2 md:hidden text-md text-[#202020]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBars />
      </button>
      <div className="nav">
        <div
          className={`fixed w-56 z-10 h-full bg-gradient-to-br  from-[#9B5DE5] to-[#56347F] shadow-lg flex flex-col  transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full w-0"
          } md:translate-x-0 p-5`}
        >
          <button
            className="md:hidden relative right-20 block  text-2xl text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            X
          </button>
          <div>
            <Link to="/dashboard">
              <div className=" mt-20">
                <img
                  className=" w-48"
                  src={CEDUGAMES}
                  alt="Logo"
                />
              </div>
            </Link>
          </div>

          <nav className="font-Outfit mt-20">
            {links.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`block relative px-2  py-2 rounded text-sm hover:bg-[#F8F8F8] mb-4 ${
                  location.pathname === to
                    ? "bg-purple-200 text-purple-600  active-link"
                    : "text-white hover:text-[#6a0dad]"
                }`}
              >
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-tr-lg rounded-br-lg transform scale-0 transition-transform duration-300 origin-left">
                  {location.pathname === to && (
                    <span className="block h-full w-1 bg-purple-600 rounded-tr-lg rounded-br-lg"></span>
                  )}
                </span>
                <span className="inline-flex items-center">
                  {icon}
                  <span className="ml-3">{label}</span>
                </span>
              </Link>
            ))}
          </nav>
          {/* <nav className="font-Outfit mt-20">
            {links.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => onSelectPage(label)} // NEW: Tell parent the current page
                className={`block relative py-2 rounded text-sm hover:bg-[#F8F8F8] mb-2 ${
                  location.pathname === to
                    ? "bg-purple-200 text-purple-600 active-link"
                    : "text-white hover:text-[#6a0dad]"
                }`}
              >
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-tr-lg rounded-br-lg transform scale-0 transition-transform duration-300 origin-left">
                  {location.pathname === to && (
                    <span className="block h-full w-1 bg-purple-600 rounded-tr-lg rounded-br-lg"></span>
                  )}
                </span>

                <span className="inline-flex items-center">
                  {icon}
                  <span className="ml-3">{label}</span>
                </span>
              </Link>
            ))}
          </nav> */}
        </div>
        <div className="md:ml-52  bg-[#fafbfc]">{children}</div>
      </div>
    </div>
  );
};

export default Sidebar;
