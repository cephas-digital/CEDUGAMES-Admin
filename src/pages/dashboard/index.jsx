import React from "react";
import StatsCards from "../../components/statsCard";
import { Users, Coins, Gamepad2, Trophy } from "lucide-react";
import RecentTransactions from "../../components/recentTransaction";
import CoinPackages from "../../components/coinPackae";
import TopPlayers from "../../components/topPlayers";
import RecentActivities from "../../components/recent-activicties";

const Index = () => {
  const stats = [
    {
      title: "Total Users",
      value: "24,567",
      icon: <Users className="w-6 h-6 text-purple-600" />,
      change: "+12.5%",
      gradient: "from-purple-500 to-blue-500",
    },
    {
      title: "Active Games",
      value: "1,234",
      icon: <Gamepad2 className="w-6 h-6 text-purple-400" />,
      change: "+8.2%",
      gradient: "from-purple-400 to-pink-400",
    },
    {
      title: "Coins Purchased",
      value: "₦2.4M",
      icon: <Coins className="w-6 h-6 text-pink-500" />,
      change: "+23.1%",
      gradient: "from-pink-500 to-red-400",
    },
    {
      title: "Levels Completed",
      value: "45,892",
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      change: "+15.8%",
      gradient: "from-yellow-500 to-orange-400",
    },
  ];
  return (
    <div className="lg:px-8">
      <div className="space-y-6">
        <StatsCards data={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
          <CoinPackages />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopPlayers />
          <div>
            <RecentActivities />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
