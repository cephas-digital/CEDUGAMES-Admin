import React, { useEffect, useState } from "react";
import axios from "axios";
import StatsCards from "../../components/statsCard";
import { Users, Coins, Gamepad2, Trophy } from "lucide-react";
import RecentTransactions from "../../components/recentTransaction";
import CoinPackages from "../../components/coinPackae";
import TopPlayers from "../../components/topPlayers";
import RecentActivities from "../../components/recent-activicties";

const Index = () => {
  const [dashboard,setDashboard]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
  useEffect(()=>{let active=true;axios.get("/admin/dashboard").then(({data})=>{if(active)setDashboard(data)}).catch(e=>{if(active)setError(e.response?.data?.message||"Unable to load dashboard data.")}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
  const number=value=>Number(value||0).toLocaleString();
  const money=(minor,currency)=>new Intl.NumberFormat("en-NG",{style:"currency",currency:currency||"NGN",maximumFractionDigits:2}).format(Number(minor||0)/100);
  const change=value=>`${Number(value||0)>=0?"+":""}${Number(value||0).toFixed(1)}%`;
  const stats=[
    {title:"Total Users",value:number(dashboard?.stats?.totalUsers?.value),icon:<Users className="w-6 h-6 text-purple-600"/>,change:change(dashboard?.stats?.totalUsers?.change),gradient:"from-purple-500 to-blue-500"},
    {title:"Active Games",value:number(dashboard?.stats?.activeGames?.value),icon:<Gamepad2 className="w-6 h-6 text-purple-400"/>,change:change(dashboard?.stats?.activeGames?.change),gradient:"from-purple-400 to-pink-400"},
    {title:"Coins Purchased",value:money(dashboard?.stats?.coinsPurchased?.valueMinor,dashboard?.stats?.coinsPurchased?.currency),icon:<Coins className="w-6 h-6 text-pink-500"/>,change:change(dashboard?.stats?.coinsPurchased?.change),gradient:"from-pink-500 to-red-400"},
    {title:"Levels Completed",value:number(dashboard?.stats?.levelsCompleted?.value),icon:<Trophy className="w-6 h-6 text-yellow-500"/>,change:change(dashboard?.stats?.levelsCompleted?.change),gradient:"from-yellow-500 to-orange-400"},
  ];
  return <div className="lg:px-8"><div className="space-y-6">
    {error&&<div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <StatsCards data={stats}/>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2"><RecentTransactions data={dashboard?.recentTransactions||[]} loading={loading}/></div><CoinPackages data={dashboard?.popularPackages||[]} loading={loading}/></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><TopPlayers data={dashboard?.topPlayers||[]} loading={loading}/><div><RecentActivities data={dashboard?.recentActivities||[]} loading={loading}/></div></div>
  </div></div>;
};
export default Index;
