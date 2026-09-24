import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Check, Image, Loader2, Search, X } from "lucide-react";
import { toast } from "react-toastify";

export default function ResourcePicker({ onClose, onSelect }) {
  const requestIdRef = useRef(0);
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    axios.get("/admin/resource-categories").then(({ data }) => setCategories(data.categories || [])).catch(() => toast.error("Unable to load resource categories."));
  }, []);

  useEffect(() => {
    requestIdRef.current += 1;
    const timer = setTimeout(() => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      axios.get("/admin/resources", { params: { categoryId: categoryId || undefined, search: search || undefined, page, limit: 30 } })
        .then(({ data }) => { if (requestId === requestIdRef.current) { setResources(data.resources || []); setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 }); } })
        .catch((error) => { if (requestId === requestIdRef.current && error.code !== "ERR_CANCELED") toast.error("Unable to load resources."); })
        .finally(() => { if (requestId === requestIdRef.current) setLoading(false); });
    }, 250);
    return () => clearTimeout(timer);
  }, [categoryId, search, page]);
  useEffect(() => setPage(1), [categoryId, search]);

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={onClose}>
    <div role="dialog" aria-modal="true" aria-labelledby="resource-picker-title" className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
        <div><h2 id="resource-picker-title" className="text-xl font-black text-slate-900">Choose from Resources</h2><p className="mt-1 text-sm text-slate-500">Reuse an image already available in the library.</p></div>
        <button type="button" onClick={onClose} aria-label="Close resource picker" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={20}/></button>
      </div>
      <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[220px_1fr] sm:px-6">
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-purple-500"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name} ({category.assetCount})</option>)}</select>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-purple-500"><Search size={18} className="text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search images" className="w-full bg-transparent py-3 text-sm outline-none"/></label>
      </div>
      <div className="min-h-64 flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? <div className="grid min-h-64 place-items-center text-sm text-slate-500"><span className="text-center"><Loader2 className="mx-auto mb-2 animate-spin text-purple-600"/>Loading resources...</span></div> : resources.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{resources.map((resource) => <button key={resource.id} type="button" onClick={() => { onSelect(resource); onClose(); }} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-lg">
          <div className="relative aspect-square bg-slate-100"><img src={resource.url} alt={resource.name} className="h-full w-full object-cover" loading="lazy"/><span className="absolute inset-0 grid place-items-center bg-purple-700/0 text-white opacity-0 transition group-hover:bg-purple-700/35 group-hover:opacity-100"><span className="rounded-full bg-white p-2 text-purple-700"><Check size={18}/></span></span></div>
          <div className="p-2.5"><p className="truncate text-xs font-bold text-slate-800">{resource.name}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">{resource.categoryName || "Uncategorised"}</p></div>
        </button>)}</div> : <div className="grid min-h-64 place-items-center text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-purple-50 text-purple-600"><Image/></span><p className="mt-3 font-bold text-slate-800">No matching images</p><p className="mt-1 text-sm text-slate-500">Upload images from the Resources page first.</p></div></div>}
      </div>
      {pagination.totalPages > 1 && <div className="flex items-center justify-center gap-3 border-t border-slate-100 p-4"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-40">Previous</button><span className="text-sm text-slate-500">Page {page} of {pagination.totalPages}</span><button type="button" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-40">Next</button></div>}
    </div>
  </div>;
}
