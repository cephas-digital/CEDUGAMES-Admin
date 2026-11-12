import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Activity, BellRing, Clock3 } from "lucide-react";
import { toast } from "react-toastify";
import ActivityItem from "../../components/activity-item";

const ACTIVITY_PAGE_SIZE = 12;
const CAMPAIGN_PAGE_SIZE = 15;

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");
  const [retentionError, setRetentionError] = useState("");
  const [campaignError, setCampaignError] = useState("");
  const [retentionDays, setRetentionDays] = useState(15);
  const [savedRetentionDays, setSavedRetentionDays] = useState(15);
  const [retentionOptions, setRetentionOptions] = useState([10, 15, 30, 60, 90, 180, 365]);
  const [retentionEditable, setRetentionEditable] = useState(false);
  const [retentionLoading, setRetentionLoading] = useState(true);
  const [retentionSaving, setRetentionSaving] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [campaignPagination, setCampaignPagination] = useState({ page: 1, limit: CAMPAIGN_PAGE_SIZE, totalPages: 1, total: 0 });

  const loadActivities = async (page) => {
    setActivityLoading(true); setActivityError("");
    try {
      const { data } = await axios.get(`/auth/admin/activities?limit=${ACTIVITY_PAGE_SIZE}&page=${page}`);
      setActivities(data?.activities || []);
      setPagination(data?.pagination || { page, totalPages: 1, total: 0 });
    } catch (requestError) {
      setActivityError(requestError?.response?.data?.message || "Unable to load activities.");
    } finally { setActivityLoading(false); }
  };

  const loadRetention = async () => {
    setRetentionLoading(true); setRetentionError("");
    try {
      const { data } = await axios.get("/admin/activity-retention");
      const days = Number(data?.retentionDays || 15);
      setRetentionDays(days); setSavedRetentionDays(days);
      setRetentionOptions(data?.options || [10, 15, 30, 60, 90, 180, 365]);
      setRetentionEditable(Boolean(data?.canEdit));
    } catch (requestError) {
      setRetentionError(requestError?.response?.data?.message || "Unable to load activity retention settings.");
    } finally { setRetentionLoading(false); }
  };

  const loadCampaigns = async (page = 1) => {
    setCampaignLoading(true); setCampaignError("");
    try {
      const { data } = await axios.get(`/admin/notifications?limit=${CAMPAIGN_PAGE_SIZE}&page=${page}`);
      setCampaigns(data?.notifications || []);
      setCampaignPagination(data?.pagination || { page, limit: CAMPAIGN_PAGE_SIZE, totalPages: 1, total: 0 });
    } catch (requestError) {
      setCampaignError(requestError?.response?.data?.message || "Unable to load notification campaigns.");
    } finally { setCampaignLoading(false); }
  };

  const saveRetention = async () => {
    setRetentionSaving(true);
    try {
      const { data } = await axios.put("/admin/activity-retention", { retentionDays });
      setSavedRetentionDays(Number(data.retentionDays));
      toast.success(data.message || "Retention setting saved.");
      await Promise.all([loadActivities(1), loadCampaigns(1)]);
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || "Unable to save retention setting.");
    } finally { setRetentionSaving(false); }
  };

  useEffect(() => { loadActivities(1); loadRetention(); loadCampaigns(); }, []);

  const tabs = [
    { id: "campaigns", label: "Notification campaigns", count: campaignPagination.total, icon: <BellRing size={17} /> },
    { id: "activities", label: "Activity history", count: pagination.total, icon: <Activity size={17} /> },
  ];

  return (
    <div className="w-full max-w-7xl p-3 text-gray-900 sm:p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1F2937]"><Activity className="text-purple-600" /> Activity & Notifications</h1>
          <p className="mt-2 text-sm text-gray-500">Manage player messages and review administrative activity.</p>
        </div>
        {activeTab === "campaigns" && <Link to="/notifications/new-notification" className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700">Send New Notification</Link>}
      </div>

      <div role="tablist" aria-label="Notifications and activity" className="mb-5 flex gap-2 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`${tab.id}-tab`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            onClick={() => setActiveTab(tab.id)}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${activeTab === tab.id ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            {tab.icon}{tab.label}<span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-5 rounded-xl border border-purple-100 bg-purple-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><span className="rounded-lg bg-white p-2 text-purple-600"><Clock3 size={17}/></span><div><p className="text-sm font-bold text-slate-800">Activity & notification retention</p><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">Keep activity and notification campaign records for {retentionDays} days. Older records are removed automatically each day. Extending this period cannot restore records already deleted.</p></div></div>
        <div className="flex shrink-0 items-center gap-2"><label className="sr-only" htmlFor="activity-retention-days">Retention period</label><select id="activity-retention-days" value={retentionDays} disabled={retentionLoading || !retentionEditable} onChange={event => setRetentionDays(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60">{retentionOptions.map(days => <option key={days} value={days}>{days} days{days === 15 ? " (default)" : ""}</option>)}</select>{retentionEditable && <button type="button" disabled={retentionLoading || retentionSaving || retentionDays === savedRetentionDays} onClick={saveRetention} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40">{retentionSaving ? "Saving..." : "Save"}</button>}</div>
      </div>
      {retentionError && <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{retentionError}</div>}

      {activeTab === "campaigns" ? (
        <section id="campaigns-panel" role="tabpanel" aria-labelledby="campaigns-tab" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Notification campaigns</h2>
            <p className="text-xs text-slate-400">Recent messages and delivery status for each selected channel</p>
          </div>
          {campaignError && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{campaignError}</div>}
          {campaignLoading ? <p className="p-12 text-center text-sm text-slate-400">Loading notification campaigns...</p> : campaigns.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-400"><tr><th className="py-2">Message</th><th>Audience</th><th>Channels</th><th>Scheduled / sent</th><th>Email</th><th>Push</th><th>Push devices</th></tr></thead>
                <tbody>{campaigns.map(item => {
                  const isScheduled = item.scheduled_at && new Date(item.scheduled_at) > new Date();
                  const status = value => value === "pending" && isScheduled ? "scheduled" : value === "not_requested" ? "—" : value === "no_devices" ? "no devices" : value;
                  return <tr key={item.id} className="border-t border-slate-100">
                    <td className="py-3"><b>{item.title}</b><div className="max-w-sm truncate text-xs text-slate-500">{item.message}</div></td>
                    <td>{item.target_user_ids?.length ? `${item.target_user_ids.length} selected` : item.audience}</td>
                    <td className="capitalize">{(item.channels || ["in_app", "push"]).map(channel => channel === "in_app" ? "In-app" : channel).join(", ")}</td>
                    <td>{new Date(item.scheduled_at || item.published_at).toLocaleString()}</td>
                    <td title={item.email_error || ""}><span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">{status(item.email_status || "not_requested")}</span>{item.email_status && item.email_status !== "not_requested" && <div className="mt-1 text-xs text-slate-400">{item.email_success_count || 0} ok · {item.email_failure_count || 0} failed</div>}</td>
                    <td title={item.push_error || ""}><span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.push_status === "failed" ? "bg-red-50 text-red-700" : item.push_status === "partial" ? "bg-amber-50 text-amber-700" : "bg-purple-50 text-purple-700"}`}>{status(item.push_status)}</span>{item.push_error && <p className="mt-1 max-w-[220px] break-words text-xs leading-4 text-red-600">{item.push_error}</p>}</td>
                    <td title={item.push_error || ""}>{item.channels?.includes("push") ? `${item.push_success_count || 0} ok · ${item.push_failure_count || 0} failed` : "—"}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          ) : <p className="p-12 text-center text-sm text-slate-400">No notification campaigns yet.</p>}
          {!campaignLoading && campaignPagination.total > 0 && <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-sm text-slate-500">Showing {(campaignPagination.page - 1) * campaignPagination.limit + 1}–{Math.min(campaignPagination.page * campaignPagination.limit, campaignPagination.total)} of {campaignPagination.total} campaigns · Page {campaignPagination.page} of {Math.max(campaignPagination.totalPages, 1)}</span><div className="flex gap-2"><button type="button" onClick={() => loadCampaigns(campaignPagination.page - 1)} disabled={campaignLoading || campaignPagination.page <= 1} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button><button type="button" onClick={() => loadCampaigns(campaignPagination.page + 1)} disabled={campaignLoading || campaignPagination.page >= campaignPagination.totalPages} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button></div></div>}
        </section>
      ) : (
        <section id="activities-panel" role="tabpanel" aria-labelledby="activities-tab" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6"><h2 className="text-lg font-bold">Activity history</h2><p className="text-xs text-slate-400">{pagination.total} recorded event{pagination.total === 1 ? "" : "s"}</p></div>
          {activityError && <div className="m-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{activityError}</div>}
          {activityLoading ? <p className="p-12 text-center text-sm text-slate-400">Loading activities...</p> : activities.length ? (
            <div className="grid gap-6 p-5 md:grid-cols-2 sm:p-6">{activities.map(activity => <ActivityItem key={activity.id} activity={activity} />)}</div>
          ) : <p className="p-12 text-center text-sm text-slate-400">No activities have been recorded yet.</p>}
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6">
            <span className="text-sm text-slate-500">Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</span>
            <div className="flex gap-2"><button onClick={() => loadActivities(pagination.page - 1)} disabled={activityLoading || pagination.page <= 1} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button><button onClick={() => loadActivities(pagination.page + 1)} disabled={activityLoading || pagination.page >= pagination.totalPages} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button></div>
          </div>
        </section>
      )}
    </div>
  );
}
