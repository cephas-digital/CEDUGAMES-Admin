import { Link } from "react-router-dom";
const rankColors=["bg-[#F59E0B]","bg-[#9CA3AF]","bg-[#EA580C]","bg-[#D1D5DB]"];
const cardColors=["from-[#FFFBEB] to-[#FEF3C7]","from-[#F9FAFB] to-[#F3F4F6]","from-[#FFF7ED] to-[#FFEDD5]","from-[#F9FAFB] to-[#E5E7EB]"];
export default function TopPlayers({data=[],loading=false}){
 return <div className="bg-white p-5 rounded-xl shadow-sm border"><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">Top Players</h2><Link to="/leaderboard"><button className="text-[#4F46E5] font-semibold text-sm">View Leaderboard</button></Link></div><div className="space-y-3">
 {data.map((player,idx)=><div key={player.id} className={`flex items-center justify-between bg-gradient-to-r ${cardColors[idx%cardColors.length]} p-3 rounded-xl`}><div className="flex items-center gap-3"><span className={`w-8 h-8 flex items-center justify-center ${rankColors[idx%rankColors.length]} text-white rounded-full`}>{player.rank}</span><span className="grid w-8 h-8 place-items-center rounded-full bg-white/80 font-bold text-purple-700">{player.name?.[0]?.toUpperCase()||"?"}</span><div><p className="font-medium">{player.name}</p><p className="text-xs text-gray-500">{player.highest_level?`Level ${player.highest_level}`:`${player.completed_levels} levels completed`}</p></div></div><div><p className="font-semibold">{Number(player.total_xp).toLocaleString()}</p><p className="text-xss">Points</p></div></div>)}
 {!data.length&&<p className="py-12 text-center text-sm text-slate-400">{loading?"Loading players...":"No ranked players yet."}</p>}
 </div></div>;
}
