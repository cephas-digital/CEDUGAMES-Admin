import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore, { TOKEN as DATA_TOKEN } from "../../data/Stores/Authstore";
import { SetAuthToken } from "../../data/Config";
import { TOKEN as LOGIN_TOKEN } from "../../data/Reducers/UserReducer";

/**
 * Logout page:
 * - clears axios auth header
 * - removes tokens from localStorage
 * - calls the zustand logout() to reset app auth state
 * - redirects to the login screen
 */
const Logout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    // remove axios auth header
    SetAuthToken(null);

    // remove both token keys used in the repo (be conservative)
    try {
      if (DATA_TOKEN) localStorage.removeItem(DATA_TOKEN);
    } catch (e) {
      // ignore if import fails or token is undefined
    }
    try {
      if (LOGIN_TOKEN) localStorage.removeItem(LOGIN_TOKEN);
    } catch (e) {}

    // update client auth state
    if (typeof logout === "function") logout();

    // send user to login
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Signed out</h2>
        <p className="text-gray-600 mb-4">Redirecting to login…</p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Logout;
