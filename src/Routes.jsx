import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import PageRender from "./PageRender";
import Login from "./screens/login";
import Index from "./pages/index";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import { canAccess, getDefaultRoute } from "./data/adminAuth";
import RouteErrorBoundary from "./components/route-error-boundary";
import { useEffect, useState } from "react";
import { logout, TOKEN } from "./data/Reducers/UserReducer";
import { SetAuthToken } from "./data/Config";

const AdminLayout = ({ children }) => (
  <Sidebar>
    <Navbar />
    {children}
  </Sidebar>
);

const AdminSessionGate = ({ children }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token) || localStorage.getItem(TOKEN);
  const [status, setStatus] = useState(token ? "checking" : "invalid");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return undefined; }
    let active = true;
    setStatus("checking");
    axios.get("/auth/admin/account")
      .then(() => { if (active) setStatus("valid"); })
      .catch(() => {
        if (!active) return;
        SetAuthToken(null);
        dispatch(logout());
        setStatus("invalid");
      });
    return () => { active = false; };
  }, [token, dispatch]);

  if (status === "checking") return <main className="grid min-h-screen place-items-center bg-slate-50"><div role="status" className="text-center text-sm font-semibold text-slate-500"><span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600"/>Verifying your admin session...</div></main>;
  return status === "valid" ? children : <Navigate to="/" replace />;
};

const ProtectedPage = () => {
  const { isAuth, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const page = location.pathname.split("/")[1] || "dashboard";

  useEffect(() => {
    document.getElementById("admin-catalog-loader")?.remove();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  return isAuth && canAccess(user, page) ? (
    <AdminSessionGate>
      <RouteErrorBoundary key={`${location.pathname}${location.search}`}>
        <AdminLayout>
          <PageRender />
        </AdminLayout>
      </RouteErrorBoundary>
    </AdminSessionGate>
  ) : (
    <Navigate to={isAuth ? getDefaultRoute(user) : "/"} replace />
  );
};

const Routers = () => {
  const isAuth = useSelector((state) => state.auth.isAuth);

  return (
    <>
      <ToastContainer position="bottom-center" />
      <Routes>
        <Route
          path="/"
          element={
            isAuth ? (
              <AdminSessionGate>
                <AdminLayout>
                  <Index />
                </AdminLayout>
              </AdminSessionGate>
            ) : (
              <Login />
            )
          }
        />
        <Route path="/:page" element={<ProtectedPage />} />
        <Route path="/:page/:id" element={<ProtectedPage />} />
        <Route path="/:page/:id/:step" element={<ProtectedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default Routers;
