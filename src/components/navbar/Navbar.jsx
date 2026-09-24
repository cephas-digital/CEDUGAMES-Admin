import bell from "../../assets/bell.png";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getSessionUser } from "../../data/adminAuth";

const Navbar = ({ title }) => {
  const location = useLocation();
  const storedUser = getSessionUser();
  const selectedUser = useSelector((state) => state.auth.user);
  const user = selectedUser?.user || selectedUser?.data?.user || selectedUser || storedUser;
  const name = user?.name || "Administrator";
  const email = user?.email || "";
  const role = String(user?.role || "Administrator").replaceAll("_", " ");
  const roleLabel = role.replace(/\b\w/g, (letter) => letter.toUpperCase());
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "A";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const isDashboard = location.pathname === "/dashboard";
  return (
    <header className="mb-4 flex min-w-0 items-center justify-between gap-3 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4">
      <div className="min-w-0">
        {isDashboard ? <>
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 sm:text-sm">{greeting}</p>
          <h1 className="truncate text-base font-black text-slate-900 sm:text-xl">Welcome, {name}</h1>
        </> : title ? <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">{title}</h1> : <p className="text-sm font-bold text-slate-500">CEDU Admin</p>}
      </div>

      <div className="flex min-w-0 items-center space-x-2 sm:space-x-4">
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
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-40 truncate text-sm font-semibold text-slate-900">{name}</p>
              <p className="max-w-40 truncate text-xs capitalize text-gray-400" title={email || roleLabel}>{roleLabel}</p>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
