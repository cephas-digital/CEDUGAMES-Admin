import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import PageRender from "./PageRender";
import Login from "./screens/login";
import Index from "./pages/index";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";

const AdminLayout = ({ children }) => (
  <Sidebar>
    <Navbar />
    {children}
  </Sidebar>
);

const ProtectedPage = () => {
  const isAuth = useSelector((state) => state.auth.isAuth);

  return isAuth ? (
    <AdminLayout>
      <PageRender />
    </AdminLayout>
  ) : (
    <Navigate to="/" replace />
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
