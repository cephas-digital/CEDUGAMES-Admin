import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import StatsCard from "../../components/statsCard";
import DataTable from "../../components/data-table";
import { Coins, ShieldCheck, UserPlus, Users } from "lucide-react";
import { Link } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadUsers = async () => {
      try {
        const { data } = await axios.get("/auth/admin/users");
        if (active) setUsers(data?.users || []);
      } catch (requestError) {
        if (active) setError(requestError?.response?.data?.message || "Unable to load registered users.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadUsers();
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const registeredToday = users.filter((user) => new Date(user.created_at).toDateString() === today).length;
    const verified = users.filter((user) => user.is_verified).length;
    const coins = users.reduce((total, user) => total + Number(user.coins_count || 0), 0);
    return [
      { title: "Total Users", value: users.length.toLocaleString(), icon: <Users className="w-6 h-6 text-purple-600" />, change: "Registered players", gradient: "from-purple-500 to-blue-500" },
      { title: "New Today", value: registeredToday.toLocaleString(), icon: <UserPlus className="w-6 h-6 text-purple-500" />, change: "Today's registrations", gradient: "from-purple-400 to-pink-400" },
      { title: "Verified Users", value: verified.toLocaleString(), icon: <ShieldCheck className="w-6 h-6 text-green-600" />, change: `${users.length ? Math.round((verified / users.length) * 100) : 0}% of users`, gradient: "from-green-500 to-emerald-400" },
      { title: "Player Coins", value: coins.toLocaleString(), icon: <Coins className="w-6 h-6 text-yellow-500" />, change: "Current total balance", gradient: "from-yellow-500 to-orange-400" },
    ];
  }, [users]);

  const columns = [
    {
      key: "name", label: "User", render: (value, row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">{(value || row.username || "U").slice(0, 1).toUpperCase()}</span>
          <div><p className="font-medium text-gray-900">{value}</p><p className="text-xs text-gray-400">@{row.username}</p></div>
        </div>
      ),
    },
    { key: "email", label: "Email address" },
    { key: "age", label: "Age" },
    { key: "coins_count", label: "Coins", render: (value) => Number(value || 0).toLocaleString() },
    { key: "total_xp", label: "XP", render: (value) => Number(value || 0).toLocaleString() },
    {
      key: "is_verified", label: "Status", render: (value) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${value ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{value ? "Verified" : "Pending"}</span>
      ),
    },
    { key: "created_at", label: "Date Joined", render: (value) => value ? new Date(value).toLocaleDateString() : "—" },
    {
      key: "actions", label: "Actions", render: (_value, row) => (
        <Link to={`/user-management/manage-user?id=${row.id}`}><button className="text-sm font-bold text-purple-600 hover:underline">Manage User</button></Link>
      ),
    },
  ];

  return (
    <div className="space-y-4 px-8">
      <StatsCard data={stats} loading={loading} />
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="rounded-xl bg-white p-12 text-center text-gray-500">Loading registered users...</div>
      ) : (
        <DataTable data={users} columns={columns} title="Registered Users" itemsPerPage={8} />
      )}
    </div>
  );
};

export default UserManagement;
