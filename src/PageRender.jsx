import { lazy, Suspense, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import useAuthStore from "./data/Stores/Authstore";
import brandLogo from "./assets/cedugames-logo.png";

const pages = {
  dashboard: lazy(() => import("./pages/dashboard")),
  "user-management": lazy(() => import("./pages/user-management")),
  "user-management/manage-user": lazy(() => import("./pages/user-management/manage-user")),
  content: lazy(() => import("./pages/content")),
  "content/add-question": lazy(() => import("./pages/content/add-question")),
  "content/edit-question": lazy(() => import("./pages/content/edit-question")),
  "content/upload-files": lazy(() => import("./pages/content/upload-files")),
  leaderboard: lazy(() => import("./pages/leaderboard")),
  "leaderboard/leaderboard-details": lazy(() => import("./pages/leaderboard/leaderboard-details")),
  "coin-system": lazy(() => import("./pages/coin-system")),
  "coin-system/create-coin": lazy(() => import("./pages/coin-system/create-coin")),
  "coin-system/edit-coin-package": lazy(() => import("./pages/coin-system/edit-coin-package")),
  "coin-system/event-key-guide": lazy(() => import("./pages/coin-system/event-key-guide")),
  "coin-system/life-settings": lazy(() => import("./pages/coin-system/life-settings")),
  airtime: lazy(() => import("./pages/airtime")),
  "daily-rewards": lazy(() => import("./pages/daily-rewards")),
  categories: lazy(() => import("./pages/categories")),
  "categories/age-groups": lazy(() => import("./pages/categories/age-groups")),
  "categories/learn": lazy(() => import("./pages/categories/learn")),
  "categories/add-age-group": lazy(() => import("./pages/categories/add-age-group")),
  "categories/add-level": lazy(() => import("./pages/categories/add-level")),
  "categories/age-categories": lazy(() => import("./pages/categories/age-categories")),
  "categories/edit-age-group": lazy(() => import("./pages/categories/edit-age-group")),
  "categories/edit-categories": lazy(() => import("./pages/categories/edit-categories")),
  "categories/level-questions": lazy(() => import("./pages/categories/level-questions")),
  "categories/view-categories": lazy(() => import("./pages/categories/view-categories")),
  notifications: lazy(() => import("./pages/notifications")),
  "notifications/new-notification": lazy(() => import("./pages/notifications/new-notification")),
  "notifications/view-notification": lazy(() => import("./pages/notifications/view-notification")),
  settings: lazy(() => import("./pages/settings")),
  admins: lazy(() => import("./pages/admins")),
  "log-out": lazy(() => import("./pages/log-out")),
};

const PageLoader = () => (
  <div className="grid min-h-[60vh] place-items-center" role="status" aria-live="polite">
    <div className="text-center">
      <img src={brandLogo} alt="Cedugames" className="brand-loader-logo" />
      <div className="brand-loader-dots mt-5" aria-hidden="true"><span /><span /><span /></div>
    </div>
    <span className="sr-only">Loading page</span>
  </div>
);

export default function PageRender() {
  const { page, id } = useParams();
  const navigate = useNavigate();
  const { auth, errors, clearErrors } = useAuthStore();

  useEffect(() => {
    if (auth?.isAuth && errors?.errorText) {
      if (page !== "login" && page !== "register") navigate("/");
      clearErrors();
    }
    if (auth?.isAuth && (page === "login" || page === "register")) navigate("/");
  }, [auth?.isAuth, clearErrors, errors?.errorText, navigate, page]);

  const key = id ? `${page}/${id}` : page;
  const Component = pages[key] || (page === "settings" && id ? lazy(() => import("./pages/settings/[id]")) : null);
  if (!Component) return <Navigate to="/dashboard" replace />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}
