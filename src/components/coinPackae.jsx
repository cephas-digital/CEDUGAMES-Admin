const colors=[["bg-[#D97706]","from-[#FFFBEB] to-[#FEF3C7]"],["bg-[#9333EA]","from-[#FAF5FF] to-[#F3E8FF]"],["bg-[#4F46E5]","from-[#EEF2FF] to-[#E0E7FF]"],["bg-[#DB2777]","from-[#FDF2F8] to-[#FDF2F8]"]];
const money=(minor,currency)=>new Intl.NumberFormat("en-NG",{style:"currency",currency:currency||"NGN"}).format(Number(minor||0)/100);
export default function CoinPackages({data=[],loading=false}){
 return <div className="bg-white p-5 rounded-xl shadow-sm border"><h2 className="text-lg font-semibold mb-4">Popular Coin Packages</h2><div className="space-y-3">
 {data.map((pkg,idx)=>{const[soldColor,color]=colors[idx%colors.length];return <div key={pkg.id} className={`p-4 rounded-xl text-white bg-gradient-to-r ${color}`}><div className="flex justify-between items-center"><h3 className="text-base text-[#1F2937] font-semibold">{Number(pkg.coins).toLocaleString()} Coins</h3><span className={`text-sm ${soldColor} px-3 py-1 rounded-full`}>{Number(pkg.sold).toLocaleString()} sold</span></div><p className="text-sm text-[#1F2937] mt-2">{money(pkg.price_minor,pkg.currency)}</p></div>})}
 {!data.length&&<p className="py-12 text-center text-sm text-slate-400">{loading?"Loading packages...":"No active packages."}</p>}
 </div></div>;
}
