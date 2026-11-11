import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, BellRing, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const field = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100";
const localDateTime = () => { const d = new Date(Date.now() + 60_000); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

export default function NewNotificationForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", message: "", type: "announcement", audience: "all", scheduledAt: "" });
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  useEffect(() => { axios.get("/admin/users").then(({ data }) => setUsers(data.users || [])).catch(() => toast.error("Unable to load players for targeting.")); }, []);
  const filtered = useMemo(() => users.filter(user => `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())), [users, search]);
  const update = event => setForm(value => ({ ...value, [event.target.name]: event.target.value }));
  const toggleUser = id => setSelected(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]);
  const submit = async event => {
    event.preventDefault(); setSending(true);
    try {
      const payload = { title: form.title, message: form.message, type: form.type, audience: form.audience, targetUserIds: selected, scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null };
      const { data } = await axios.post("/admin/notifications", payload);
      toast.success(data.message || "Notification saved."); navigate("/notifications");
    } catch (error) { toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.message || "Unable to save notification."); }
    finally { setSending(false); }
  };
  return <div className="mx-auto w-full max-w-4xl p-4 sm:p-7">
    <Link to="/notifications" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-purple-600"><ArrowLeft size={17}/>Back to notifications</Link>
    <section className="mt-5 overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
      <header className="bg-gradient-to-r from-purple-700 to-fuchsia-500 p-6 text-white sm:p-8"><BellRing size={30}/><h1 className="mt-4 text-2xl font-black">Create push notification</h1><p className="mt-1 text-sm text-purple-100">Send now or schedule delivery. The message also appears in the player notification centre.</p></header>
      <form onSubmit={submit} className="space-y-5 p-5 sm:p-8">
        <label className="block text-sm font-bold">Title<input required minLength="3" maxLength="160" name="title" value={form.title} onChange={update} placeholder="What should players know?" className={field}/></label>
        <label className="block text-sm font-bold">Message<textarea required minLength="5" maxLength="3000" rows="5" name="message" value={form.message} onChange={update} placeholder="Write a clear, helpful message..." className={field}/><span className="mt-1 block text-right text-xs font-normal text-slate-400">{form.message.length}/3000</span></label>
        <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-bold">Notification type<select name="type" value={form.type} onChange={update} className={field}><option value="announcement">Announcement</option><option value="achievement">Achievement</option><option value="reminder">Reminder</option><option value="system">System update</option></select></label><label className="block text-sm font-bold">Verified status<select name="audience" value={form.audience} onChange={update} className={field}><option value="all">All players</option><option value="verified">Verified players</option><option value="unverified">Players awaiting verification</option></select></label></div>
        <section className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-bold">Choose players <span className="font-normal text-slate-400">({selected.length} selected)</span></h2><p className="text-xs text-slate-500">Leave empty to send to everyone matching the verified status above.</p></div><button type="button" onClick={() => setSelected(ids => filtered.every(user => ids.includes(user.id)) ? ids.filter(id => !filtered.some(user => user.id === id)) : [...new Set([...ids, ...filtered.map(user => user.id)])])} className="text-sm font-bold text-purple-700">{filtered.length && filtered.every(user => selected.includes(user.id)) ? "Clear visible" : "Select visible"}</button></div>
          <input aria-label="Search players" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or email" className={`${field} mb-3`}/>
          <div className="max-h-56 space-y-1 overflow-y-auto">{filtered.map(user => <label key={user.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-purple-50"><input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleUser(user.id)} className="h-4 w-4 accent-purple-600"/><span className="min-w-0 flex-1 truncate text-sm font-semibold">{user.name}<span className="ml-2 font-normal text-slate-400">{user.email}</span></span><span className="text-xs text-slate-400">{user.is_verified ? "Verified" : "Unverified"}</span></label>)}{!filtered.length && <p className="p-4 text-center text-sm text-slate-400">No matching players.</p>}</div>
        </section>
        <label className="block text-sm font-bold">Schedule delivery (optional)<input type="datetime-local" min={localDateTime()} value={form.scheduledAt} onChange={event => setForm(current => ({ ...current, scheduledAt: event.target.value }))} className={field}/><span className="mt-1 block text-xs font-normal text-slate-500">Uses your device’s local time. Leave blank to send now.</span></label>
        <div className="rounded-xl bg-purple-50 p-4 text-sm text-purple-800"><b>Recipients:</b> {selected.length ? `${selected.length} selected player account${selected.length === 1 ? "" : "s"}` : form.audience === "all" ? "all players" : `${form.audience} players`}. {form.scheduledAt ? "Delivery is scheduled." : "Delivery starts immediately."}</div>
        <div className="flex justify-end"><button disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white disabled:opacity-60 sm:w-auto"><Send size={17}/>{sending ? "Saving..." : form.scheduledAt ? "Schedule notification" : "Send notification"}</button></div>
      </form>
    </section>
  </div>;
}
