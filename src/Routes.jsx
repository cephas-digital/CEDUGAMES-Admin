import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import PageRender from "./PageRender";
import Login from "./screens/login";
import Index from "./pages/index";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import { canAccess, getDefaultRoute } from "./data/adminAuth";
import RouteErrorBoundary from "./components/route-error-boundary";
import { useEffect } from "react";

const AdminLayout = ({ children }) => (
  <Sidebar>
    <Navbar />
    {children}
  </Sidebar>
);

const ProtectedPage = () => {
  const { isAuth, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const page = location.pathname.split("/")[1] || "dashboard";

  useEffect(() => {
    document.getElementById("admin-catalog-loader")?.remove();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  return isAuth && canAccess(user, page) ? (
    <RouteErrorBoundary key={`${location.pathname}${location.search}`}>
      <AdminLayout>
        <PageRender />
      </AdminLayout>
    </RouteErrorBoundary>
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
              <AdminLayout>
                <Index />
              </AdminLayout>
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
