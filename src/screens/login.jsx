import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CEDUGAMES from "../assets/CEDUGAMES.png";
import { SetAuthToken } from "../data/Config";
import { login } from "../data/Reducers/UserReducer";
import { authenticateAdmin, getDefaultRoute, publicAdmin } from "../data/adminAuth";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const localAdmin = authenticateAdmin(form.email, form.password);
      if (localAdmin) {
        dispatch(
          login({
            token: `cedugames-${localAdmin.id}-${Date.now()}`,
            user: publicAdmin(localAdmin),
          })
        );
        navigate(getDefaultRoute(localAdmin), { replace: true });
        toast.success(`Welcome, ${localAdmin.name}`);
        return;
      }

      const { data } = await axios.post("/api/v1/login", form);
      const payload = data?.data || data;
      const token = payload?.token || data?.token;

      if (!token) throw new Error("The server did not return an access token.");

      SetAuthToken(token);
      dispatch(login({ ...payload, token, user: payload?.user || payload?.data }));
      navigate("/dashboard", { replace: true });
      toast.success(data?.message || "Welcome back");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Unable to sign in"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f4fb] px-4 py-10 font-Outfit">
      <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-purple-200/60 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-fuchsia-200/50 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/80 bg-white px-6 py-9 shadow-[0_24px_70px_rgba(86,52,127,0.14)] sm:px-10">
        <img className="mx-auto mb-8 w-52" src={CEDUGAMES} alt="Cedugames" />

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#241a30]">Admin login</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your credentials to access the admin dashboard.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email address</span>
            <span className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100">
              <Mail className="h-5 w-5 text-slate-400" />
              <input
                className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="admin@cedugames.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
            <span className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100">
              <LockKeyhole className="h-5 w-5 text-slate-400" />
              <input
                className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="text-slate-400 hover:text-purple-600"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </span>
          </label>

          <button
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#9B5DE5] to-[#56347F] py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Login;
