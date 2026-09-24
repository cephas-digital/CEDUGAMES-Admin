// export default function StatsCards() {
//   const stats = [
//     {
//       label: "Total Users",
//       value: "24,567",
//       change: "+12.5%",
//       icon: "👥",
//     },
//     {
//       label: "Active Games",
//       value: "1,234",
//       change: "+8.2%",
//       icon: "🎮",
//     },
//     {
//       label: "Coins Purchased",
//       value: "₦2.4M",
//       change: "+23.1%",
//       icon: "💰",
//     },
//     {
//       label: "Levels Completed",
//       value: "45,892",
//       change: "+15.8%",
//       icon: "🏆",
//     },
//   ];

//   return (
//     <div className="grid w-full grid-cols-1 md:grid-cols-4 gap-4">
//       {stats.map((item, idx) => (
//         <div
//           key={idx}
//           className="bg-white p-5 rounded-xl shadow-sm border"
//         >
//           <div className="text-3xl">{item.icon}</div>
//           <p className="text-gray-600 text-sm mt-2">{item.label}</p>
//           <p className="text-3xl font-semibold mt-1">{item.value}</p>
//           <p className="text-green-500 text-sm mt-1">{item.change}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

// import React from "react";
// import { Users, Gamepad2, Coins, Trophy } from "lucide-react";

// const stats = [
//   {
//     title: "Total Users",
//     value: "24,567",
//     icon: <Users className="w-6 h-6 text-purple-600" />,
//     change: "+12.5%",
//     gradient: "from-purple-500 to-blue-500",
//   },
//   {
//     title: "Active Games",
//     value: "1,234",
//     icon: <Gamepad2 className="w-6 h-6 text-purple-400" />,
//     change: "+8.2%",
//     gradient: "from-purple-400 to-pink-400",
//   },
//   {
//     title: "Coins Purchased",
//     value: "₦2.4M",
//     icon: <Coins className="w-6 h-6 text-pink-500" />,
//     change: "+23.1%",
//     gradient: "from-pink-500 to-red-400",
//   },
//   {
//     title: "Levels Completed",
//     value: "45,892",
//     icon: <Trophy className="w-6 h-6 text-yellow-500" />,
//     change: "+15.8%",
//     gradient: "from-yellow-500 to-orange-400",
//   },
// ];

// export default function StatsCards() {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full ">
//       {stats.map((item, index) => (
//         <div
//           key={index}
//           className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col gap-4 relative overflow-hidden"
//         >
//           {/* Gradient Border */}
//           <div
//             className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${item.gradient}`}
//           ></div>

//           {/* Icon & Change % */}
//           <div className="flex justify-between items-start">
//             <div className="p-3 rounded-xl bg-gray-50">{item.icon}</div>
//             <p className="text-green-600 font-semibold text-sm">
//               {item.change}
//             </p>
//           </div>

//           {/* Title */}
//           <p className="text-gray-500 text-sm font-medium">{item.title}</p>

//           {/* Value */}
//           <h2 className="text-3xl font-bold text-gray-900">{item.value}</h2>
//         </div>
//       ))}
//     </div>
//   );
// }

// StatCard.jsx

import React from "react";
import { Loader2 } from "lucide-react";

const statsCard = ({ data, loading = false }) => {
  return (
    <div>
      <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {data.map((item, index) => (
          <Card
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
            change={item.change}
            gradient={item.gradient}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default statsCard;

function Card({ title, value, icon, change, gradient, loading }) {
  return (
    <div className="min-w-0">
      <div className="relative flex h-full min-w-0 flex-col gap-2 overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-md sm:gap-4 sm:p-5 xl:p-6">
        {/* Gradient Border */}
        <div
          className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${gradient}`}
        ></div>

        {/* Icon & Change */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="rounded-xl bg-gray-50 p-2 sm:p-3">{icon}</div>
          <p className={`${String(change).startsWith("-") ? "text-red-600" : "text-green-600"} whitespace-nowrap text-[10px] font-semibold sm:text-xs xl:text-sm`}>{loading ? <span className="text-gray-400">Loading...</span> : change}</p>
        </div>

        <p className="mt-1 truncate text-[11px] font-medium text-gray-500 sm:text-sm" title={title}>{title}</p>

        <h2 className="flex min-h-8 min-w-0 items-center truncate text-xl font-bold text-gray-900 sm:min-h-9 sm:text-2xl xl:text-3xl" title={loading ? undefined : String(value)}>{loading ? <Loader2 aria-label={`Loading ${title}`} className="h-6 w-6 animate-spin text-purple-500" /> : value}</h2>
      </div>
    </div>
  );
}
