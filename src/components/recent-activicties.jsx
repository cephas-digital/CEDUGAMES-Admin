import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ActivityItem from "./activity-item";

export default function RecentActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    axios.get("/auth/admin/activities?limit=4&page=1")
      .then(({ data }) => { if (active) setActivities(data?.activities || []); })
      .catch(() => { if (active) setActivities([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Activities</h2>
        <Link to="/notifications" className="text-sm font-bold text-purple-600 hover:underline">View more</Link>
      </div>
      {loading ? <p className="py-8 text-center text-sm text-slate-400">Loading activities...</p> : activities.length ? (
        <div className="space-y-5">{activities.map((activity) => <ActivityItem key={activity.id} activity={activity} />)}</div>
      ) : <p className="py-8 text-center text-sm text-slate-400">No activities recorded yet.</p>}
    </div>
  );
}
