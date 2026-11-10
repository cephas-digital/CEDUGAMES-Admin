import { useEffect, useState } from "react";
import axios from "axios";
import { KeyRound, Loader2, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import BadgeSettings from "../../components/account-setting/badge-settings";
import { SESSION_USER_KEY } from "../../data/adminAuth";
import { TOKEN } from "../../data/Reducers/UserReducer";

const field = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:bg-slate-100";

export default function Settings() {
  const [tab, setTab] = useState("profile"), [account, setAccount] = useState(null);
  const [profile, setProfile] = useState({ name: "", title: "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  useEffect(() => { axios.get("/auth/admin/account").then(({ data }) => { setAccount(data.account); setProfile({ name: data.account.name, title: data.account.title }); }).catch((error) => toast.error(error.response?.data?.message || "Unable to load account settings.")).finally(() => setLoading(false)); }, []);
  const saveProfile = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      const { data } = await axios.patch("/auth/admin/account", profile);
      const current = JSON.parse(localStorage.getItem(SESSION_USER_KEY) || "{}");
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify({ ...current, name: data.account.name, role: data.account.title }));
      setAccount(data.account); toast.success("Profile updated."); window.location.reload();
    } catch (error) { toast.error(error.response?.data?.message || "Unable to update profile."); }
    finally { setBusy(false); }
  };
  const savePassword = async (event) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) return toast.error("New passwords do not match.");
    setBusy(true);
    try {
      const { data } = await axios.post("/auth/admin/account/password", { currentPassword: password.currentPassword, newPassword: password.newPassword });
      toast.success(data.message); localStorage.removeItem(TOKEN); localStorage.removeItem(SESSION_USER_KEY); window.location.assign("/");
    } catch (error) { toast.error(error.response?.data?.message || "Unable to update password."); }
    finally { setBusy(false); }
  };
  const tabs = [["profile","Profile",UserRound],["security","Login & security",KeyRound],["badges","Badge rules",ShieldCheck]];
  if (loading) return <div className="py-24 text-center text-slate-400">Loading account settings…</div>;
  return <div className="mx-auto min-h-screen max-w-7xl bg-slate-50 p-5 sm:p-8"><header><h1 className="text-2xl font-black text-slate-900">Account settings</h1><p className="mt-1 text-sm text-slate-500">Manage your real administrator profile, security, and platform badge rules.</p></header>
    <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm">{tabs.map(([id,label,Icon]) => <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold ${tab === id ? "bg-purple-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}><Icon size={17}/>{label}</button>)}</div>
    {tab === "profile" && <form onSubmit={saveProfile} className="mt-6 max-w-3xl rounded-2xl bg-white p-6 shadow-sm"><div className="mb-6 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-purple-100 text-2xl font-black text-purple-700">{account.name?.slice(0,1).toUpperCase()}</div><div><h2 className="text-xl font-black">{account.name}</h2><p className="text-sm text-slate-500">{account.email}</p></div></div>
      {account.managedByEnvironment && <div className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">The Super Admin identity is controlled by backend environment variables. Regular administrator profiles can be edited here.</div>}
      <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold">Full name<input disabled={account.managedByEnvironment} required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} className={field}/></label><label className="text-sm font-bold">Role title<input disabled={account.managedByEnvironment} required value={profile.title} onChange={(event) => setProfile({ ...profile, title: event.target.value })} className={field}/></label><label className="text-sm font-bold sm:col-span-2">Email address<input disabled value={account.email} className={field}/></label></div>
      {!account.managedByEnvironment && <button disabled={busy} className="mt-6 flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={17}/> : <Save size={17}/>}Save profile</button>}
    </form>}
    {tab === "security" && <form onSubmit={savePassword} className="mt-6 max-w-2xl rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-lg font-black">Change password</h2><p className="mt-1 text-sm text-slate-500">Updating a password revokes other active sessions.</p>
      {account.managedByEnvironment ? <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Change the Super Admin password securely through <code>SUPER_ADMIN_PASSWORD</code> in the backend environment, then redeploy.</div> : <div className="mt-5 space-y-4"><label className="block text-sm font-bold">Current password<input required type="password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} className={field}/></label><label className="block text-sm font-bold">New password<input required minLength="8" type="password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} className={field}/></label><label className="block text-sm font-bold">Confirm new password<input required minLength="8" type="password" value={password.confirmPassword} onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })} className={field}/></label><button disabled={busy} className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white disabled:opacity-50">Update password</button></div>}
    </form>}
    {tab === "badges" && <div className="mt-6"><BadgeSettings/></div>}
  </div>;
}
