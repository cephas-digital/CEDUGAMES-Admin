import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageNavigation from "../../components/page-navigation";
import FormDialog from "../../components/form-dialog";
import ConfirmDialog from "../../components/confirm-dialog";
import ImageUploadField from "../../components/image-upload-field";
import CatalogLoadingState from "../../components/catalog-loading-state";
import { uploadCatalogImage } from "../../data/media";
import { loadCatalogData, readCatalogCache } from "../../data/catalog-cache";

const cacheKey = "games:age-groups";
const empty = { name: "", displayLabel: "", minAge: "", maxAge: "", subtitle: "", description: "", imageUrl: "" };
const field = "mt-2 w-full rounded-xl border bg-slate-50 px-4 py-3";

export default function AgeGroups() {
  const navigate = useNavigate();
  const cached = readCatalogCache(cacheKey);
  const [items, setItems] = useState(cached || []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (force = false) => {
    setLoading(true); setError("");
    try {
      const ageGroups = await loadCatalogData(cacheKey, async () => (await axios.get("/admin/catalog/age-groups")).data.ageGroups || [], { force });
      setItems(ageGroups);
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to load age groups"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (!cached) load(); }, [cached, load]);

  const open = (item = null) => {
    setEditing(item);
    setForm(item ? { name: item.name, displayLabel: item.display_label, minAge: item.min_age, maxAge: item.max_age, subtitle: item.subtitle || "", description: item.description || "", imageUrl: item.image_url || "" } : empty);
    setFile(null); setDialog(true);
  };
  const save = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      const body = { ...form, minAge: Number(form.minAge), maxAge: Number(form.maxAge), imageUrl: file ? await uploadCatalogImage(file) : form.imageUrl };
      if (editing) await axios.put(`/admin/catalog/age-groups/${editing.id}`, body);
      else await axios.post("/admin/catalog/age-groups", body);
      setDialog(false); await load(true);
    } catch (requestError) { toast.error(requestError.response?.data?.message || "Unable to save"); }
    finally { setBusy(false); }
  };
  const remove = async () => { setBusy(true); try { await axios.delete(`/admin/catalog/age-groups/${deleting.id}`); setDeleting(null); await load(true); } catch (requestError) { toast.error(requestError.response?.data?.message || "Unable to delete age group"); } finally { setBusy(false); } };

  return <div className="mx-auto w-full max-w-screen-2xl px-3 pb-10 sm:px-5 lg:px-6">
    <PageNavigation items={[{ label: "Categories & Levels", to: "/categories" }, { label: "CEDUGAMES" }]} title="Age Groups" description="Manage learning paths by age range." action={<button onClick={() => open()} className="flex gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white"><Plus size={18}/>Add Age Group</button>}/>
    {loading ? <CatalogLoadingState label="Loading age groups..."/> : error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700"><p>{error}</p><button onClick={() => load(true)} className="mt-4 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white">Try again</button></div> : <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[1100px] table-fixed text-left"><colgroup><col className="w-[19%]"/><col className="w-[9%]"/><col/><col className="w-[13%]"/><col className="w-[11%]"/></colgroup><thead className="bg-slate-50"><tr><th className="whitespace-nowrap px-6 py-4">Age group</th><th className="whitespace-nowrap px-6 py-4">Range</th><th className="whitespace-nowrap px-6 py-4">Description</th><th className="whitespace-nowrap px-6 py-4">Contents</th><th className="whitespace-nowrap px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y">{items.map((item) => <tr key={item.id}><td className="px-6 py-4"><div className="flex min-w-0 items-center gap-3"><img src={item.image_url} alt="" className="h-12 w-16 shrink-0 rounded object-cover"/><b className="truncate" title={item.name}>{item.name}</b></div></td><td className="whitespace-nowrap px-6 py-4">{item.min_age}–{item.max_age}</td><td className="px-6 py-4 text-sm"><div className="truncate" title={item.description || undefined}>{item.description || "—"}</div></td><td className="whitespace-nowrap px-6 py-4">{item.category_count} categories</td><td className="px-6 py-4"><div className="flex justify-end gap-3"><button onClick={() => navigate(`/categories/age-categories?ageGroup=${item.id}`)}><Eye size={16}/></button><button onClick={() => open(item)} className="text-purple-600"><Pencil size={16}/></button><button onClick={() => setDeleting(item)} className="text-red-500"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>}
    <FormDialog open={dialog} title="Age group" onClose={() => setDialog(false)}><form onSubmit={save} className="grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2">Title *<input required className={field} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}/></label><label className="sm:col-span-2">Card label *<input required className={field} value={form.displayLabel} onChange={(event) => setForm({ ...form, displayLabel: event.target.value })}/></label><label>Minimum age<input required type="number" className={field} value={form.minAge} onChange={(event) => setForm({ ...form, minAge: event.target.value })}/></label><label>Maximum age<input required type="number" className={field} value={form.maxAge} onChange={(event) => setForm({ ...form, maxAge: event.target.value })}/></label><label className="sm:col-span-2">Subtitle<input className={field} value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })}/></label><label className="sm:col-span-2">Description<textarea className={field} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })}/></label><div className="sm:col-span-2"><ImageUploadField file={file} currentUrl={form.imageUrl} onChange={setFile}/></div><button disabled={busy} className="sm:col-span-2 rounded-xl bg-purple-600 py-3 font-bold text-white disabled:opacity-60">{busy ? "Saving..." : "Save"}</button></form></FormDialog>
    <ConfirmDialog open={Boolean(deleting)} loading={busy} onCancel={() => setDeleting(null)} onConfirm={remove} title="Delete age group?" message="All categories and levels below it will also be deleted."/>
  </div>;
}
