import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, FileQuestion, Loader2, Pencil, Plus, Search, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmDialog from "../../components/confirm-dialog";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 15, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true); setError("");
    axios.get("/admin/questions", { params: { page, search: debouncedSearch || undefined } })
      .then(({ data }) => {
        setQuestions(data.questions || []);
        setPagination(data.pagination || { page, pageSize: 15, total: data.questions?.length || 0, totalPages: 1 });
      })
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load questions."))
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try { await axios.delete(`/admin/questions/${deleting.id}`); toast.success("Question deleted."); setDeleting(null); if (questions.length === 1 && page > 1) setPage((current) => current - 1); else load(); }
    catch (requestError) { toast.error(requestError.response?.data?.message || "Unable to delete question."); }
    finally { setBusy(false); }
  };

  return <div className="mx-3 w-auto max-w-7xl rounded-2xl bg-white p-4 font-Outfit shadow-sm sm:mx-5 sm:p-6 lg:mx-6 lg:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-black text-slate-900">Questions</h1><p className="mt-1 text-sm text-slate-500">{pagination.total} question{pagination.total === 1 ? "" : "s"} · newest uploads appear first</p></div><div className="flex flex-wrap gap-2"><Link to="/content/upload-files" className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-100"><UploadCloud size={18}/>Bulk upload</Link><Link to="/content/add-question?ai=true" className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-100"><Sparkles size={18}/>Create with AI</Link><Link to="/content/add-question" className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"><Plus size={18}/>Add manually</Link></div></div>
    <div className="relative mt-7"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/><input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Search by question, category, level, or status" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"/></div>
    <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
      {loading ? <State icon={Loader2} message="Loading questions..." spin/> : error ? <State icon={FileQuestion} message={error} action={<button onClick={load} className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white">Try again</button>}/> : questions.length ? <table className="w-full min-w-[900px] text-left"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Question</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Level</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Uploaded</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{questions.map((question) => <QuestionRow key={question.id} question={question} onDelete={() => setDeleting(question)}/>)}</tbody></table> : <State icon={FileQuestion} message={debouncedSearch ? "No questions match your search." : "No questions have been added yet."} />}
    </div>
    {pagination.totalPages > 1 && <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">Showing {(page - 1) * pagination.pageSize + 1}–{Math.min(page * pagination.pageSize, pagination.total)} of {pagination.total}</p><div className="flex items-center gap-2"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1 || loading} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16}/>Previous</button><span className="min-w-24 text-center text-sm font-semibold text-slate-600">Page {page} of {pagination.totalPages}</span><button type="button" onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))} disabled={page >= pagination.totalPages || loading} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40">Next<ChevronRight size={16}/></button></div></div>}
    <ConfirmDialog open={Boolean(deleting)} loading={busy} onCancel={() => setDeleting(null)} onConfirm={remove} title="Delete question?" message={`Delete “${deleting?.text || "this question"}”? This cannot be undone.`}/>
  </div>;
}

function QuestionRow({ question, onDelete }) {
  const editUrl = `/content/add-question?ageGroup=${question.ageGroupId}&category=${question.categoryId}&level=${question.levelId}&question=${question.id}`;
  return <tr className="transition hover:bg-purple-50/30"><td className="max-w-xl px-5 py-4"><p className="line-clamp-2 font-semibold text-slate-900">{question.text}</p></td><td className="px-5 py-4 text-sm text-slate-600">{question.category}</td><td className="px-5 py-4"><p className="text-sm font-semibold text-slate-700">{question.level}</p><p className="text-xs text-slate-400">Level {question.levelNumber}</p></td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${question.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{question.status}</span></td><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{formatDate(question.createdAt)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Link to={editUrl} className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-purple-600 transition hover:bg-purple-50"><Pencil size={14}/>Edit</Link><button onClick={onDelete} className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"><Trash2 size={14}/>Delete</button></div></td></tr>;
}

function State({ icon: Icon, message, spin = false, action }) { return <div className="flex min-h-64 flex-col items-center justify-center p-10 text-center text-slate-500"><Icon className={spin ? "animate-spin text-purple-600" : "text-purple-400"} size={30}/><p className="mt-3 text-sm font-semibold">{message}</p>{action}</div>; }
function formatDate(value) { if (!value) return "—"; return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
