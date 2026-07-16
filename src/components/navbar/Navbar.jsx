import { useState } from "react";
import bell from "../../assets/bell.png";
import { MdSearch } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import navImg from "../../assets/admin.png";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = ({ title }) => {
  const { pathname } = useLocation();
  const isProfile = pathname === "/profile-page";

  const navigate = useNavigate();

  function handleNotification() {
    navigate("/notification");
  }

  const [search, setSearch] = useState("");
  const user = useSelector((state) => state.auth.user);
  return (
    <div className="flex items-center mb-4 justify-between px-6 py-4 bg-white shadow-sm">
      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="flex items-center space-x-4">
        <div className="flex sticky w-2/3 z-10 top-0 justify-between items-center">
          <div className="flex px-4 border rounded-xl w-full border-[#CCCCCCCC]  h-10 items-center">
            <MdSearch
              size={20}
              className="text-[#A7A7A7]"
            />
            <input
              type="text"
              value={search}
              onChange={(ev) => setSearch(ev.target.value)}
              placeholder="Search your course here..."
              className="w-full  text-sm p-2 focus:outline-none focus:border-purple text-[#A7A7A7]"
            />
          </div>
        </div>
        <div className="relative w-8 h-8">
          <img
            src={bell}
            alt="Notification bell"
          />
        </div>

        <Link to="/settings">
          <div className="flex items-center space-x-2">
            <img
              src={navImg}
              alt=""
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium">{user?.name || "Admin User"}</p>
              <p className="text-xs text-gray-400">{user?.role || "Administrator"}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
