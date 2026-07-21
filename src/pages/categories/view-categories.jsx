import { useEffect, useState } from "react";
import axios from "axios";
import { Clock3, Eye, Layers3, Pencil, Plus, Sparkles, Trash2, Trophy } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageNavigation from "../../components/page-navigation";
import ConfirmDialog from "../../components/confirm-dialog";
import FormDialog from "../../components/form-dialog";

const blank = { name: "", levelNumber: "", description: "", imageUrl: "", pointsPerQuestion: 10, timeLimitSeconds: 30 };
const field = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100";

export default function CategoryLevels() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ageId = params.get("ageGroup");
  const categoryId = params.get("category");
  const [age, setAge] = useState(null);
  const [category, setCategory] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!ageId || !categoryId) return;
    setLoading(true);
    try {
      const [ageResponse, categoryResponse, levelResponse] = await Promise.all([axios.get("/admin/catalog/age-groups"), axios.get(`/admin/catalog/age-groups/${ageId}/categories`), axios.get(`/admin/catalog/categories/${categoryId}/levels`)]);
      setAge(ageResponse.data.ageGroups.find((item) => item.id === ageId));
      setCategory(categoryResponse.data.categories.find((item) => item.id === categoryId));
      setLevels(levelResponse.data.levels || []);
    } catch { toast.error("Unable to load category levels"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [ageId, categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (level = null) => {
    setEditing(level);
    setForm(level ? { name: level.name, levelNumber: level.level_number, description: level.description || "", imageUrl: level.image_url || "", pointsPerQuestion: level.points_per_question ?? 10, timeLimitSeconds: level.time_limit_seconds ?? 30 } : { ...blank, levelNumber: levels.length + 1 });
    setDialog(true);
  };
  const save = async (event) => {
    event.preventDefault(); setBusy(true);
    const payload = { ...form, categoryId, levelNumber: Number(form.levelNumber), pointsPerQuestion: Number(form.pointsPerQuestion), timeLimitSeconds: Number(form.timeLimitSeconds) };
    try { editing ? await axios.put(`/admin/catalog/levels/${editing.id}`, payload) : await axios.post("/admin/catalog/levels", payload); toast.success(`Level ${editing ? "updated" : "created"}`); setDialog(false); load(); }
    catch (error) { toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.message || "Unable to save level"); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await axios.delete(`/admin/catalog/levels/${deleting.id}`); toast.success("Level deleted"); setDeleting(null); load(); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to delete level"); }
    finally { setBusy(false); }
  };
  const addQuestion = (level) => navigate(`/content/add-question?ageGroup=${ageId}&category=${categoryId}&level=${level.id}`);
  const preview = (level) => navigate(`/categories/level-questions?ageGroup=${ageId}&category=${categoryId}&level=${level.id}`);

  return <div className="mx-auto w-full max-w-[1600px] px-4 pb-10 sm:px-6">
    <PageNavigation items={[{ label: "Age Groups", to: "/categories" }, { label: age?.name || "Categories", to: `/categories/age-categories?ageGroup=${ageId}` }, { label: category?.name || "Levels" }]} title={category?.name || "Category"} description={category?.description || "Manage the levels available in this category."} action={<button onClick={() => open()} className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700"><Plus size={18}/>Add Level</button>} />
    {loading ? <div className="rounded-2xl bg-white p-16 text-center text-slate-400">Loading levels...</div> : levels.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">{levels.map((level) => <LevelCard key={level.id} level={level} onAdd={() => addQuestion(level)} onPreview={() => preview(level)} onEdit={() => open(level)} onDelete={() => setDeleting(level)} />)}</div> : <div className="rounded-2xl border-2 border-dashed bg-white p-16 text-center"><Layers3 className="mx-auto text-purple-400" size={36}/><h2 className="mt-4 text-lg font-bold">No levels created</h2><p className="mt-2 text-sm text-slate-500">Add the first level to this category.</p><button onClick={() => open()} className="mt-5 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white">Add Level</button></div>}
    <FormDialog open={dialog} title={editing ? "Edit level" : "Create level"} onClose={() => setDialog(false)}><form onSubmit={save} className="grid gap-5 sm:grid-cols-2"><Field label="Level number"><input required min="1" type="number" className={`${field} mt-2`} value={form.levelNumber} onChange={(event) => setForm({ ...form, levelNumber: event.target.value })}/></Field><Field label="Level name"><input required className={`${field} mt-2`} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Number Quest"/></Field><Field label="Points per question" help="Awarded for each correct answer."><input required min="1" max="1000" type="number" className={`${field} mt-2`} value={form.pointsPerQuestion} onChange={(event) => setForm({ ...form, pointsPerQuestion: event.target.value })}/></Field><Field label="Time limit per question (seconds)" help="How long a learner has to answer."><input required min="5" max="600" type="number" className={`${field} mt-2`} value={form.timeLimitSeconds} onChange={(event) => setForm({ ...form, timeLimitSeconds: event.target.value })}/></Field><label className="text-sm font-semibold sm:col-span-2">Description<textarea rows="4" className={`${field} mt-2 resize-none`} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })}/></label><label className="text-sm font-semibold sm:col-span-2">Image URL <span className="font-normal text-slate-400">(optional)</span><input type="url" className={`${field} mt-2`} value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}/></label><div className="flex justify-end gap-3 sm:col-span-2"><button type="button" onClick={() => setDialog(false)} className="rounded-xl border px-5 py-3 font-semibold">Cancel</button><button disabled={busy} className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white">{busy ? "Saving..." : "Save level"}</button></div></form></FormDialog>
    <ConfirmDialog open={Boolean(deleting)} loading={busy} onCancel={() => setDeleting(null)} onConfirm={remove} title="Delete level?" message={`Delete ${deleting?.name || "this level"}? This action cannot be undone.`}/>
  </div>;
}

function LevelCard({ level, onAdd, onPreview, onEdit, onDelete }) {
  return <article className="group flex min-h-[290px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl">
    <div className="h-1.5 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-400"/>
    <div className="flex flex-1 flex-col p-4"><div className="flex items-start justify-between gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition group-hover:rotate-3 group-hover:scale-105"><Layers3 size={21}/></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">LEVEL {level.level_number}</span></div>
      <h2 className="mt-4 line-clamp-2 text-base font-extrabold leading-5 text-slate-900">{level.name}</h2><p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{level.description || "No description provided."}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500"><span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1.5 text-amber-700"><Trophy size={12}/>{level.points_per_question ?? 10} pts</span><span className="flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1.5 text-sky-700"><Clock3 size={12}/>{level.time_limit_seconds ?? 30}s</span></div>
      <button onClick={onAdd} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-purple-600"><Sparkles size={14}/>Create question</button>
      <div className="mt-auto grid grid-cols-3 gap-1 border-t border-slate-100 pt-3"><Action icon={Eye} label="Preview" onClick={onPreview} className="text-slate-600 hover:bg-slate-100"/><Action icon={Pencil} label="Edit" onClick={onEdit} className="text-purple-600 hover:bg-purple-50"/><Action icon={Trash2} label="Delete" onClick={onDelete} className="text-red-500 hover:bg-red-50"/></div>
    </div>
  </article>;
}

function Action({ icon: Icon, label, onClick, className }) { return <button onClick={onClick} className={`flex min-w-0 items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-bold transition ${className}`}><Icon size={13}/><span className="truncate">{label}</span></button>; }
function Field({ label, help, children }) { return <label className="text-sm font-semibold">{label}{children}{help && <span className="mt-1 block text-xs font-normal text-slate-400">{help}</span>}</label>; }
