import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, CalendarDays, Clock3, FileQuestion, Image, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import { toast } from "react-toastify";
import { PERMISSIONS } from "../../data/adminAuth";

const emptyForm = { name: "", email: "", password: "", title: "Administrator", permissions: [] };
const field = "w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100";

export default function Admins() {
  const [admins, setAdmins] = useState([]), [form, setForm] = useState(emptyForm), [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const initialTo = new Date();
  const initialFrom = new Date(initialTo.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [analytics, setAnalytics] = useState(null), [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [range, setRange] = useState({ from: initialFrom.toISOString().slice(0, 10), to: initialTo.toISOString().slice(0, 10), granularity: "day" });
  const load = () => { setLoading(true); axios.get("/auth/admin/admins").then(({ data }) => setAdmins(data.admins || [])).catch((error) => toast.error(error.response?.data?.message || "Unable to load administrators.")).finally(() => setLoading(false)); };
  const loadAnalytics = () => {
    setAnalyticsLoading(true);
    const toExclusive = new Date(`${range.to}T00:00:00`);
    toExclusive.setDate(toExclusive.getDate() + 1);
    axios.get("/auth/admin/upload-analytics", { params: { from: `${range.from}T00:00:00`, to: toExclusive.toISOString(), granularity: range.granularity } })
      .then(({ data }) => setAnalytics(data))
      .catch((error) => toast.error(error.response?.data?.message || "Unable to load upload analytics."))
      .finally(() => setAnalyticsLoading(false));
  };
  useEffect(load, []);
  useEffect(loadAnalytics, [range.from, range.to, range.granularity]);
  const togglePermission = (key) => setForm((value) => ({ ...value, permissions: value.permissions.includes(key) ? value.permissions.filter((item) => item !== key) : [...value.permissions, key] }));
  const create = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      if (editing) await axios.patch(`/auth/admin/admins/${editing}`, { name: form.name, email: form.email, title: form.title, permissions: form.permissions });
      else await axios.post("/auth/admin/admins", form);
      toast.success(editing ? "Administrator updated." : "Administrator created."); setForm(emptyForm); setEditing(null); load();
    }
    catch (error) { toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.message || "Unable to create administrator."); }
    finally { setBusy(false); }
  };
  const toggleStatus = async (admin) => {
    setBusy(true);
    try { await axios.patch(`/auth/admin/admins/${admin.id}/status`, { isActive: !admin.is_active }); toast.success(admin.is_active ? "Access revoked." : "Access restored."); load(); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to update administrator."); }
    finally { setBusy(false); }
  };
  const number = (value) => Number(value || 0).toLocaleString();
  const maxTrend = Math.max(1, ...(analytics?.trend || []).map((item) => Number(item.questions || 0) + Number(item.images || 0)));
  const formatDate = (value) => value ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
  return <div className="space-y-6 px-6 pb-10 lg:px-8">
    <header><h1 className="text-2xl font-black text-slate-900">Admin management</h1><p className="mt-1 text-sm text-slate-500">Create persisted administrator accounts and control dashboard access.</p></header>
    <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex items-center gap-2"><BarChart3 className="text-purple-600" size={21}/><h2 className="text-lg font-bold">Upload performance</h2></div><p className="mt-1 text-sm text-slate-500">Questions and images recorded against each administrator for productivity and payment review.</p></div><div className="flex flex-wrap items-end gap-2"><label className="text-xs font-bold text-slate-500">From<input type="date" value={range.from} onChange={(event) => setRange({ ...range, from: event.target.value })} className="mt-1 block rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-normal text-slate-700"/></label><label className="text-xs font-bold text-slate-500">To<input type="date" value={range.to} onChange={(event) => setRange({ ...range, to: event.target.value })} className="mt-1 block rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-normal text-slate-700"/></label><label className="text-xs font-bold text-slate-500">Group by<select value={range.granularity} onChange={(event) => setRange({ ...range, granularity: event.target.value })} className="mt-1 block rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-normal text-slate-700"><option value="day">Daily</option><option value="week">Weekly</option><option value="month">Monthly</option></select></label></div></div>
      {analyticsLoading ? <div className="grid min-h-40 place-items-center text-sm text-slate-400">Loading contribution data…</div> : <>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><Metric icon={<FileQuestion size={19}/>} label="Questions uploaded" value={number(analytics?.summary?.total_questions)} color="purple"/><Metric icon={<Image size={19}/>} label="Images uploaded" value={number(analytics?.summary?.total_images)} color="blue"/><Metric icon={<Users size={19}/>} label="Active contributors" value={number(analytics?.summary?.active_admins)} color="emerald"/><Metric icon={<Clock3 size={19}/>} label="Upload events" value={number(analytics?.summary?.upload_events)} color="amber"/></div>
        <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]"><div className="rounded-xl border border-slate-100 p-4"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-slate-800">Contribution trend</h3><span className="text-xs text-slate-400">{range.granularity === "day" ? "Daily" : range.granularity === "week" ? "Weekly" : "Monthly"}</span></div>{analytics?.trend?.length ? <div className="space-y-3">{analytics.trend.map((item) => { const total = Number(item.questions || 0) + Number(item.images || 0); return <div key={item.bucket} className="grid grid-cols-[82px_1fr_55px] items-center gap-3 text-xs"><span className="text-slate-500">{new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric" }).format(new Date(item.bucket))}</span><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${Math.max(4, total / maxTrend * 100)}%` }}/></div><span className="text-right font-bold text-slate-700">{number(total)}</span></div>})}</div> : <p className="py-8 text-center text-sm text-slate-400">No uploads in this period.</p>}</div><div className="rounded-xl border border-slate-100 p-4"><h3 className="mb-3 font-bold text-slate-800">Admin contributions</h3><div className="space-y-2">{(analytics?.leaderboard || []).map((admin) => <div key={admin.id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-purple-100 text-xs font-black text-purple-700">{admin.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{admin.name}</p><p className="text-xs text-slate-500">{number(admin.questions)} questions · {number(admin.images)} images</p></div><span className={`h-2.5 w-2.5 rounded-full ${admin.isActive ? "bg-emerald-400" : "bg-slate-300"}`} title={admin.isActive ? "Active" : "Revoked"}/></div>)}</div></div></div>
        <div className="overflow-x-auto rounded-xl border border-slate-100"><div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3"><CalendarDays size={17} className="text-slate-500"/><h3 className="font-bold text-slate-800">Upload audit trail</h3></div><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Administrator</th><th className="px-4 py-3">Upload</th><th className="px-4 py-3">Questions</th><th className="px-4 py-3">Images</th><th className="px-4 py-3">Date and time</th></tr></thead><tbody className="divide-y">{(analytics?.recentUploads || []).map((item) => <tr key={item.id}><td className="px-4 py-3 font-semibold">{item.actor_name}</td><td className="px-4 py-3 capitalize text-slate-600">{String(item.upload_type).replaceAll("_", " ")}</td><td className="px-4 py-3">{number(item.question_count)}</td><td className="px-4 py-3">{number(item.image_count)}</td><td className="px-4 py-3 text-slate-500">{formatDate(item.created_at)}</td></tr>)}</tbody></table>{!analytics?.recentUploads?.length && <p className="py-8 text-center text-sm text-slate-400">No upload events in this period.</p>}</div>
      </>}
    </section>
    <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
      <form onSubmit={create} className="h-fit rounded-2xl bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-purple-100 p-2.5 text-purple-700"><UserPlus size={20}/></span><h2 className="text-lg font-bold">{editing ? "Edit administrator" : "Add administrator"}</h2>{editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={17}/></button>}</div>
        <div className="space-y-4">{[["name","Full name","text"],["email","Email address","email"],...(!editing ? [["password","Temporary password","password"]] : []),["title","Role title","text"]].map(([name,label,type]) => <label className="block" key={name}><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><input className={field} type={type} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} required minLength={name === "password" ? 10 : 2}/></label>)}
          <fieldset><legend className="mb-2 text-sm font-semibold text-slate-700">Dashboard access</legend><div className="grid grid-cols-2 gap-2">{PERMISSIONS.map((permission) => <label key={permission.key} className="flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs text-slate-700 hover:bg-purple-50"><input type="checkbox" checked={form.permissions.includes(permission.key)} onChange={() => togglePermission(permission.key)} className="accent-purple-600"/>{permission.label}</label>)}</div></fieldset>
          <button disabled={busy || !form.permissions.length} className="w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white disabled:opacity-50">{editing ? "Save administrator" : "Create administrator"}</button>
        </div>
      </form>
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm"><div className="flex items-center gap-3 border-b p-6"><Users className="text-purple-600" size={22}/><h2 className="text-lg font-bold">Administrators ({admins.length})</h2></div>
        {loading ? <div className="py-24 text-center text-slate-400">Loading administrators…</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-4">Admin</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Access</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Control</th></tr></thead><tbody className="divide-y">{admins.map((admin) => <tr key={admin.id}><td className="px-6 py-4"><p className="font-semibold">{admin.name}</p><p className="text-xs text-slate-500">{admin.email}</p></td><td className="px-6 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700"><ShieldCheck size={13}/>{admin.title}</span></td><td className="max-w-xs px-6 py-4 text-xs text-slate-500">{admin.permissions.includes("*") ? "Full access" : admin.permissions.map((key) => PERMISSIONS.find((item) => item.key === key)?.label).filter(Boolean).join(", ")}</td><td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${admin.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{admin.is_active ? "Active" : "Revoked"}</span></td><td className="px-6 py-4 text-right">{admin.id !== "super-admin" && <button disabled={busy} onClick={() => toggleStatus(admin)} className={`rounded-lg px-3 py-2 text-xs font-bold ${admin.is_active ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>{admin.is_active ? "Revoke access" : "Reactivate"}</button>}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  </div>;
}

function Metric({ icon, label, value, color }) {
  const styles = { purple: "bg-purple-50 text-purple-600", blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600" };
  return <div className="rounded-xl border border-slate-100 p-4"><span className={`inline-flex rounded-lg p-2 ${styles[color]}`}>{icon}</span><p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></div>;
}
