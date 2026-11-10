import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CEDUGAMES from "../assets/cedugames-logo.png";
import { SetAuthToken } from "../data/Config";
import { login } from "../data/Reducers/UserReducer";
import { getDefaultRoute } from "../data/adminAuth";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [recoveryStep, setRecoveryStep] = useState("login");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resendCooldown) return undefined;
    const timer = window.setTimeout(() => setResendCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");
    setLoading(true);

    try {
      if (recoveryStep === "forgot") {
        const email = form.email.trim().toLowerCase();
        await axios.post("/auth/forgot-password", { email });
        setForm((current) => ({ ...current, email }));
        setRecoveryCode("");
        setResendCooldown(60);
        setNotice("If this email belongs to a managed admin account, you should receive a six-digit code. Check your inbox and spam folder.");
        setRecoveryStep("verify");
        return;
      }
      if (recoveryStep === "verify") {
        const { data } = await axios.post("/auth/verify-otp", { email: form.email.trim().toLowerCase(), otp: recoveryCode, purpose: "password_reset" });
        if (!data?.resetToken) throw new Error("The verification session could not be created. Request a new code.");
        setResetToken(data.resetToken);
        setRecoveryStep("reset");
        return;
      }
      if (recoveryStep === "reset") {
        if (newPassword.length < 8 || newPassword.length > 128) throw new Error("Use a password between 8 and 128 characters.");
        if (newPassword !== confirmPassword) throw new Error("Passwords do not match.");
        await axios.post("/auth/reset-password", { newPassword }, { headers: { Authorization: `Bearer ${resetToken}` } });
        setRecoveryStep("login");
        setResendCooldown(0);
        setResetToken("");
        setNewPassword("");
        setConfirmPassword("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setForm((current) => ({ ...current, password: "" }));
        setNotice("Password reset successfully. Sign in with your new password.");
        return;
      }
      const { data } = await axios.post("/auth/admin/login", form);
      const payload = data?.data || data;
      const token = payload?.token || data?.token;

      if (!token) throw new Error("The server did not return an access token.");

      SetAuthToken(token);
      const user = payload?.user || data?.user;
      dispatch(login({ ...payload, token, user }));
      navigate(getDefaultRoute(user), { replace: true });
      toast.success(data?.message || "Welcome back");
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Unable to sign in";
      if (recoveryStep === "login") toast.error(message);
      else setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setErrorMessage("");
    setNotice("");
    setLoading(true);
    try {
      await axios.post("/auth/resend-otp", { email: form.email.trim().toLowerCase(), purpose: "password_reset" });
      setRecoveryCode("");
      setResendCooldown(60);
      setNotice("If this email belongs to a managed admin account, a new code was sent or will be available shortly.");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error?.message || "Unable to resend the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f4fb] px-4 py-10 font-Outfit">
      <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-purple-200/60 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-fuchsia-200/50 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/80 bg-white px-6 py-9 shadow-[0_24px_70px_rgba(86,52,127,0.14)] sm:px-10">
        <img className="mx-auto mb-8 w-52" src={CEDUGAMES} alt="Cedu" />

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#241a30]">{recoveryStep === "login" ? "Admin login" : recoveryStep === "forgot" ? "Forgot password?" : recoveryStep === "verify" ? "Verify your code" : "Set a new password"}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {recoveryStep === "login" ? "Enter your credentials to access the admin dashboard." : recoveryStep === "forgot" ? "Enter your managed administrator email to receive a six-digit recovery code." : recoveryStep === "verify" ? `Enter the six-digit code sent to ${form.email}. It expires in 15 minutes.` : "Choose a new password with at least 8 characters."}
          </p>
        </div>

        {notice && <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{notice}</p>}
        {errorMessage && <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{errorMessage}</p>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {recoveryStep !== "reset" && <label className="block">
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
                readOnly={recoveryStep === "verify"}
                required
              />
            </span>
          </label>}
          {recoveryStep === "reset" && <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Resetting the password for <strong className="text-slate-800">{form.email}</strong></p>}

          {recoveryStep === "login" && <label className="block">
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
          </label>}

          {recoveryStep === "verify" && <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Six-digit code</span>
            <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required placeholder="000000" />
          </label>}

          {recoveryStep === "reset" && <>
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">New password</span><span className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100"><input className="w-full bg-transparent py-3.5 pr-3 text-sm outline-none" type={showNewPassword ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /><button type="button" className="text-slate-400 hover:text-purple-600" onClick={() => setShowNewPassword((visible) => !visible)} aria-label={showNewPassword ? "Hide new password" : "Show new password"} aria-pressed={showNewPassword}>{showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Confirm new password</span><span className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100"><input className="w-full bg-transparent py-3.5 pr-3 text-sm outline-none" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /><button type="button" className="text-slate-400 hover:text-purple-600" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} aria-pressed={showConfirmPassword}>{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span></label>
          </>}

          {recoveryStep === "login" && <button type="button" className="-mt-2 block text-sm font-semibold text-purple-700 hover:text-purple-900" onClick={() => { setForm((current) => ({ ...current, password: "" })); setNotice(""); setErrorMessage(""); setRecoveryStep("forgot"); }}>Forgot password?</button>}

          <button
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#9B5DE5] to-[#56347F] py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading || (recoveryStep === "verify" && recoveryCode.length !== 6) || (recoveryStep === "reset" && (newPassword.length < 8 || newPassword.length > 128 || newPassword !== confirmPassword))}
          >
            {loading ? "Please wait..." : recoveryStep === "login" ? "Sign in" : recoveryStep === "forgot" ? "Send recovery code" : recoveryStep === "verify" ? "Verify code" : "Reset password"}
          </button>
        </form>
        {recoveryStep === "verify" && <button type="button" disabled={loading || resendCooldown > 0} onClick={resendCode} className="mt-4 text-sm font-semibold text-purple-700 disabled:cursor-not-allowed disabled:text-slate-400">{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}</button>}
        {recoveryStep !== "login" && <>
          {recoveryStep === "forgot" && <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">The Super Admin password is managed through backend deployment settings. This email recovery flow is for dashboard administrator accounts.</p>}
          <button type="button" className="mt-4 block text-sm font-semibold text-purple-700 hover:text-purple-900" onClick={() => { setRecoveryStep("login"); setResetToken(""); setRecoveryCode(""); setNewPassword(""); setConfirmPassword(""); setShowNewPassword(false); setShowConfirmPassword(false); setResendCooldown(0); setNotice(""); setErrorMessage(""); }}>Back to admin login</button>
        </>}
      </section>
    </main>
  );
};

export default Login;
