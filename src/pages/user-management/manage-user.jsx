import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Fingerprint, Mail, ShieldCheck, UserRound } from "lucide-react";
import Table from "../../components/table";

const displayDate=value=>value?new Date(value).toLocaleString():"Never";
const money=(minor,currency="NGN")=>new Intl.NumberFormat("en-NG",{style:"currency",currency}).format(Number(minor||0)/100);
const Detail=({label,value})=><div><p className="text-gray-500">{label}</p><p className="text-gray-900 mt-1 font-medium">{value??"Not provided"}</p></div>;
const Metric=({label,value})=><div className="rounded-xl border bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p><p className="mt-1 text-2xl font-black text-gray-900">{value}</p></div>;

const UserProfile=()=>{
 const[params]=useSearchParams(),id=params.get("id"),navigate=useNavigate();
 const[data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{let active=true;if(!id){setError("No user was selected.");setLoading(false);return()=>{active=false}}axios.get(`/auth/admin/users/${encodeURIComponent(id)}`).then(({data:response})=>{if(active)setData(response)}).catch(e=>{if(active)setError(e.response?.data?.message||"Unable to load this user.")}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[id]);
 const user=data?.user,performance=user?.performance||{},purchases=user?.purchases||{};
 const attempts=useMemo(()=>(data?.recentAttempts||[]).map(item=>({...item,game:item.category_name,level:`${item.level_name} (Level ${item.level_number})`,score:`${item.score_percent}%`,result:item.passed?"Passed":"Not passed",lastPlayed:displayDate(item.created_at)})),[data]);
 const attemptColumns=[{label:"Game",accessor:"game"},{label:"Level",accessor:"level",render:value=><span className="text-blue-600 font-medium">{value}</span>},{label:"Score",accessor:"score"},{label:"Result",accessor:"result",render:(value,row)=><span className={`rounded-full px-3 py-1 text-xs font-bold ${row.passed?"bg-green-100 text-green-700":"bg-red-50 text-red-600"}`}>{value}</span>},{label:"XP",accessor:"xp_awarded"},{label:"Last Played",accessor:"lastPlayed"}];
 const coinColumns=[{label:"Type",accessor:"type",render:value=><span className="capitalize">{value}</span>},{label:"Amount",accessor:"amount",render:value=><span className={Number(value)>=0?"text-green-600":"text-red-600"}>{Number(value)>0?"+":""}{Number(value).toLocaleString()}</span>},{label:"Balance",accessor:"balance_after",render:value=>Number(value).toLocaleString()},{label:"Details",accessor:"description"},{label:"Date",accessor:"created_at",render:displayDate}];
 if(loading)return <div className="w-full max-w-6xl mx-auto py-24 text-center text-gray-500">Loading user profile...</div>;
 if(error)return <div className="w-full max-w-6xl mx-auto py-12"><div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div><Link to="/user-management" className="mt-5 inline-block font-bold text-purple-600">Back to users</Link></div>;
 return <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-5 sm:py-10">
  <section className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-[0_18px_55px_rgba(69,39,117,0.10)]">
   <div className="relative overflow-hidden bg-gradient-to-br from-[#4C1D95] via-[#7C3AED] to-[#A855F7] px-5 pb-20 pt-5 sm:px-8 sm:pb-24 sm:pt-7">
    <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10"/><div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-fuchsia-300/10 blur-xl"/>
    <button type="button" onClick={()=>navigate("/user-management")} className="relative inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"><ArrowLeft size={17}/>Back to users</button>
    <div className="relative mt-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-200">User management</p><h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">User Profile</h1><p className="mt-1 max-w-xl text-sm text-purple-100">Identity, account health, learning activity and purchase history in one view.</p></div>
   </div>
   <div className="relative px-5 pb-7 sm:px-8 sm:pb-8">
    <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 lg:flex-row lg:items-end lg:justify-between">
     <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl border-4 border-white bg-gradient-to-br from-purple-100 to-fuchsia-50 text-5xl font-black text-purple-700 shadow-xl sm:h-32 sm:w-32">{user.name?.[0]?.toUpperCase()||"U"}</div>
      <div className="min-w-0 pb-1"><h2 className="truncate text-2xl font-black text-slate-900 sm:text-3xl">{user.name}</h2><p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500"><UserRound size={15}/> @{user.username}</p></div>
     </div>
     <div className="flex flex-wrap gap-2 pb-1"><span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold ${user.is_verified?"border-emerald-200 bg-emerald-50 text-emerald-700":"border-amber-200 bg-amber-50 text-amber-700"}`}><ShieldCheck size={15}/>{user.is_verified?"Verified user":"Pending verification"}</span><span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700"><Mail size={15}/>{user.is_oauth?"Google account":"Email account"}</span></div>
    </div>
    <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
     <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-purple-600 shadow-sm"><Mail size={17}/></span><div className="min-w-0"><p className="text-xs text-slate-400">Email address</p><p className="truncate font-bold text-slate-700">{user.email}</p></div></div>
     <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-purple-600 shadow-sm"><Fingerprint size={17}/></span><div className="min-w-0"><p className="text-xs text-slate-400">User ID</p><p className="truncate font-mono text-xs font-bold text-slate-700" title={user.id}>{user.id}</p></div></div>
     <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-purple-600 shadow-sm"><CalendarDays size={17}/></span><div><p className="text-xs text-slate-400">Joined</p><p className="font-bold text-slate-700">{displayDate(user.created_at)}</p></div></div>
    </div>
   </div>
  </section>
  <h3 className="text-lg font-semibold mt-12 mb-4">User Details</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 border-t border-b py-8 text-sm"><Detail label="Email" value={user.email}/><Detail label="Age" value={user.age}/><Detail label="Account verification" value={user.is_verified?"Verified":"Not verified"}/><Detail label="Sign-in method" value={user.is_oauth?"Google OAuth":"Email and password"}/><Detail label="Last profile update" value={displayDate(user.updated_at)}/><Detail label="Last played" value={displayDate(performance.last_played)}/></div>
  <h3 className="text-xl font-semibold mt-12 mb-4">Account & Performance</h3><div className="grid grid-cols-2 gap-4 md:grid-cols-4"><Metric label="XP" value={Number(user.total_xp).toLocaleString()}/><Metric label="Coin balance" value={Number(user.coins_count).toLocaleString()}/><Metric label="Lives remaining" value={Number(user.lives_remaining).toLocaleString()}/><Metric label="Attempts" value={Number(performance.attempts).toLocaleString()}/><Metric label="Levels completed" value={Number(performance.completed_levels).toLocaleString()}/><Metric label="Average score" value={`${Number(performance.average_score)}%`}/><Metric label="Best score" value={`${Number(performance.best_score)}%`}/><Metric label="Correct answers" value={`${Number(performance.correct_answers).toLocaleString()} / ${Number(performance.questions_answered).toLocaleString()}`}/></div>
  <h3 className="text-xl font-semibold mt-12 mb-4">Purchase Summary</h3><div className="grid grid-cols-2 gap-4 md:grid-cols-4"><Metric label="Amount spent" value={money(purchases.spent_minor)}/><Metric label="Coins purchased" value={Number(purchases.purchased_coins||0).toLocaleString()}/><Metric label="Completed purchases" value={Number(purchases.completed_purchases||0).toLocaleString()}/><Metric label="Pending purchases" value={Number(purchases.pending_purchases||0).toLocaleString()}/></div>
  <h3 className="text-xl font-semibold mt-12 mb-4">Earned Badges</h3>{data.earnedBadges?.length?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.earnedBadges.map(badge=><article key={badge.id} className="rounded-xl border bg-white p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold text-gray-900">{badge.name}</p><span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold capitalize text-purple-700">{badge.tier}</span></div><p className="mt-2 text-sm text-gray-500">{badge.description}</p><p className="mt-3 text-xs text-gray-400">Earned {displayDate(badge.earned_at)}</p></article>)}</div>:<div className="rounded-xl border bg-white py-10 text-center text-gray-400">No badges earned yet.</div>}
  <h3 className="text-2xl font-semibold mt-12 mb-4">Recent Game Progress</h3>{attempts.length?<Table columns={attemptColumns} data={attempts}/>:<div className="rounded-xl border bg-white py-12 text-center text-gray-400">This user has not played a game yet.</div>}
  <h3 className="text-2xl font-semibold mt-12 mb-4">Recent Coin Activity</h3>{data.recentCoinTransactions?.length?<Table columns={coinColumns} data={data.recentCoinTransactions}/>:<div className="rounded-xl border bg-white py-12 text-center text-gray-400">No coin activity recorded yet.</div>}
 </div>;
};
export default UserProfile;
