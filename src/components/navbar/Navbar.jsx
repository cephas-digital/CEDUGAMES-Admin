import { useState } from "react";
import bell from "../../assets/bell.png";
import { MdSearch } from "react-icons/md";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getSessionUser } from "../../data/adminAuth";

const Navbar = ({ title }) => {
  const [search, setSearch] = useState("");
  const storedUser = getSessionUser();
  const selectedUser = useSelector((state) => state.auth.user);
  const user = selectedUser?.user || selectedUser?.data?.user || selectedUser || storedUser;
  const name = user?.name || "Administrator";
  const email = user?.email || "";
  const role = String(user?.role || "Administrator").replaceAll("_", " ");
  const roleLabel = role.replace(/\b\w/g, (letter) => letter.toUpperCase());
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "A";
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
        <Link to="/notifications" className="relative block w-8 h-8" aria-label="View notifications and activities">
          <img
            src={bell}
            alt="Notification bell"
          />
        </Link>

        <Link to="/settings">
          <div className="flex items-center space-x-2">
            <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-purple-300 bg-purple-100 text-sm font-black text-purple-700">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="max-w-40 truncate text-sm font-semibold text-slate-900">{name}</p>
              <p className="max-w-40 truncate text-xs capitalize text-gray-400" title={email || roleLabel}>{roleLabel}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
