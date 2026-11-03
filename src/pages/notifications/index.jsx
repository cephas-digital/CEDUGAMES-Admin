import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Activity, Clock3 } from "lucide-react";
import { toast } from "react-toastify";
import ActivityItem from "../../components/activity-item";

const PAGE_SIZE = 12;

export default function NotificationsPage() {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retentionDays, setRetentionDays] = useState(15);
  const [savedRetentionDays, setSavedRetentionDays] = useState(15);
  const [retentionOptions, setRetentionOptions] = useState([10, 15, 30, 60, 90, 180, 365]);
  const [retentionEditable, setRetentionEditable] = useState(false);
  const [retentionLoading, setRetentionLoading] = useState(true);
  const [retentionSaving, setRetentionSaving] = useState(false);

  const loadActivities = async (page) => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.get(`/auth/admin/activities?limit=${PAGE_SIZE}&page=${page}`);
      setActivities(data?.activities || []);
      setPagination(data?.pagination || { page, totalPages: 1, total: 0 });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to load activities.");
    } finally { setLoading(false); }
  };

  const loadRetention = async () => {
    setRetentionLoading(true);
    try {
      const { data } = await axios.get("/admin/activity-retention");
      const days = Number(data?.retentionDays || 15);
      setRetentionDays(days); setSavedRetentionDays(days);
      setRetentionOptions(data?.options || [10, 15, 30, 60, 90, 180, 365]);
      setRetentionEditable(Boolean(data?.canEdit));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to load activity retention settings.");
    } finally { setRetentionLoading(false); }
  };

  const saveRetention = async () => {
    setRetentionSaving(true);
    try {
      const { data } = await axios.put("/admin/activity-retention", { retentionDays });
      setSavedRetentionDays(Number(data.retentionDays));
      toast.success(data.message || "Retention setting saved.");
      await loadActivities(1);
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || "Unable to save retention setting.");
    } finally { setRetentionSaving(false); }
  };

  useEffect(() => { loadActivities(1); loadRetention(); }, []);

  return (
    <div className="w-full max-w-7xl p-3 text-gray-900 sm:p-5 lg:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1F2937]"><Activity className="text-purple-600" /> Activity & Notifications</h1>
          <p className="mt-2 text-sm text-gray-500">Monitor important activity across Cedu and manage user notifications.</p>
        </div>
        <Link to="/notifications/new-notification"><button className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700">Send New Notification</button></Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
          <div><h2 className="text-lg font-bold">All Activities</h2><p className="text-xs text-slate-400">{pagination.total} recorded event{pagination.total === 1 ? "" : "s"}</p></div>
          <div className="flex flex-col gap-3 rounded-xl border border-purple-100 bg-purple-50/60 p-4 sm:flex-row sm:items-center sm:justify-between xl:min-w-[600px]">
            <div className="flex items-start gap-3"><span className="rounded-lg bg-white p-2 text-purple-600"><Clock3 size={17}/></span><div><p className="text-sm font-bold text-slate-800">Activity & notification retention</p><p className="mt-1 max-w-md text-xs leading-5 text-slate-500">Keep records for {retentionDays} days. Older activities and sent notifications are removed automatically each day. Extending this period cannot restore records already deleted.</p></div></div>
            <div className="flex shrink-0 items-center gap-2"><label className="sr-only" htmlFor="activity-retention-days">Retention period</label><select id="activity-retention-days" value={retentionDays} disabled={retentionLoading || !retentionEditable} onChange={event => setRetentionDays(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60">{retentionOptions.map(days => <option key={days} value={days}>{days} days{days === 15 ? " (default)" : ""}</option>)}</select>{retentionEditable && <button type="button" disabled={retentionLoading || retentionSaving || retentionDays === savedRetentionDays} onClick={saveRetention} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40">{retentionSaving ? "Saving..." : "Save"}</button>}</div>
          </div>
        </div>
        {error && <div className="m-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {loading ? <p className="p-12 text-center text-sm text-slate-400">Loading activities...</p> : activities.length ? (
          <div className="grid gap-6 p-6 md:grid-cols-2">{activities.map((activity) => <ActivityItem key={activity.id} activity={activity} />)}</div>
        ) : <p className="p-12 text-center text-sm text-slate-400">No activities have been recorded yet.</p>}

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <span className="text-sm text-slate-500">Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</span>
          <div className="flex gap-2">
            <button onClick={() => loadActivities(pagination.page - 1)} disabled={loading || pagination.page <= 1} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button>
            <button onClick={() => loadActivities(pagination.page + 1)} disabled={loading || pagination.page >= pagination.totalPages} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
