import React from "react";
import { LogIn, ShieldCheck, Trophy, UserPlus, Zap } from "lucide-react";

const iconFor = (type) => {
  if (type === "user.registered") return <UserPlus className="h-5 w-5" />;
  if (type === "admin.signed_in") return <ShieldCheck className="h-5 w-5" />;
  if (type.includes("signed_in") || type.includes("authenticated")) return <LogIn className="h-5 w-5" />;
  if (type.includes("level") || type.includes("achievement")) return <Trophy className="h-5 w-5" />;
  return <Zap className="h-5 w-5" />;
};

export const timeAgo = (value) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString();
};

export default function ActivityItem({ activity }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">{iconFor(activity.event_type)}</span>
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">{activity.title}</p>
        <p className="text-sm text-slate-600">{activity.description}</p>
        <p className="mt-0.5 text-xs text-slate-400">{timeAgo(activity.created_at)}</p>
      </div>
    </div>
  );
}
