import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";
import ActivityItem from "../../components/activity-item";

const PAGE_SIZE = 12;

export default function NotificationsPage() {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => { loadActivities(1); }, []);

  return (
    <div className="mx-auto w-full max-w-7xl p-6 text-gray-900">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1F2937]"><Activity className="text-purple-600" /> Activity & Notifications</h1>
          <p className="mt-2 text-sm text-gray-500">Monitor important activity across CeduGames and manage user notifications.</p>
        </div>
        <Link to="/notifications/new-notification"><button className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700">Send New Notification</button></Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div><h2 className="text-lg font-bold">All Activities</h2><p className="text-xs text-slate-400">{pagination.total} recorded event{pagination.total === 1 ? "" : "s"}</p></div>
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
