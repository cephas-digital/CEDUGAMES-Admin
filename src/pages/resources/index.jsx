import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Edit3, FolderPlus, Image, Loader2, Plus, Search, Trash2, Upload, X } from "lucide-react";
import PageNavigation from "../../components/page-navigation";

const blankCategory = { name: "", description: "" };

export default function Resources() {
  const inputRef = useRef(null);
  const requestIdRef = useRef(0);
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categoryForm, setCategoryForm] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [allTotal, setAllTotal] = useState(0);

  const loadCategories = useCallback(() => axios.get("/admin/resource-categories").then(({ data }) => { setCategories(data.categories || []); setAllTotal(data.total || 0); }), []);
  const loadResources = useCallback(() => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    return axios.get("/admin/resources", { params: { page, search: search || undefined, categoryId: categoryId || undefined } })
      .then(({ data }) => { if (requestId === requestIdRef.current) { setResources(data.resources || []); setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 }); } })
      .catch((error) => { if (requestId === requestIdRef.current && error.code !== "ERR_CANCELED") toast.error("Unable to load resources."); })
      .finally(() => { if (requestId === requestIdRef.current) setLoading(false); });
  }, [page, search, categoryId]);

  useEffect(() => { loadCategories().catch(() => toast.error("Unable to load resource categories.")); }, [loadCategories]);
  useEffect(() => { requestIdRef.current += 1; const timer = setTimeout(loadResources, 250); return () => clearTimeout(timer); }, [loadResources]);
  useEffect(() => setPage(1), [search, categoryId]);

  const uploadFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    let completed = 0;
    try {
      for (const file of files) {
        const body = new FormData(); body.append("image", file); if (categoryId) body.append("categoryId", categoryId);
        await axios.post("/admin/resources", body); completed += 1;
      }
      toast.success(`${completed} image${completed === 1 ? "" : "s"} uploaded successfully.`);
      await loadCategories();
      if (page === 1) await loadResources(); else setPage(1);
    } catch (error) { toast.error(error.response?.data?.message || `${completed} images uploaded before an error occurred.`); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    if (savingCategory) return;
    setSavingCategory(true);
    try {
      if (editingCategory) await axios.patch(`/admin/resource-categories/${editingCategory.id}`, categoryForm); else await axios.post("/admin/resource-categories", categoryForm);
      toast.success(editingCategory ? "Category updated." : "Category created."); setCategoryForm(null); setEditingCategory(null); await loadCategories();
    } catch (error) { toast.error(error.response?.data?.message || "Category could not be saved."); }
    finally { setSavingCategory(false); }
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`Delete "${category.name}"? Its images will remain in All resources.`)) return;
    try { await axios.delete(`/admin/resource-categories/${category.id}`); await loadCategories(); if (categoryId === category.id) setCategoryId(""); else await loadResources(); toast.success("Category removed."); } catch (error) { toast.error(error.response?.data?.message || "Category could not be removed."); }
  };

  const deleteResource = async (resource) => {
    if (!window.confirm(`Delete "${resource.name}" permanently?`)) return;
    try { await axios.delete(`/admin/resources/${resource.id}`); toast.success("Resource deleted."); await loadCategories(); if (resources.length === 1 && page > 1) setPage((value) => value - 1); else await loadResources(); } catch (error) { toast.error(error.response?.data?.message || "Resource could not be deleted."); }
  };

  return <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
    <div className="mx-auto max-w-[1500px]">
      <PageNavigation items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Resources" }]} title="Resources" description="Upload, organise, and reuse images across questions and answer options." />
      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
          <div className="flex items-center justify-between"><h2 className="font-black text-slate-900">Categories</h2><button type="button" onClick={() => { setEditingCategory(null); setCategoryForm(blankCategory); }} title="Create category" className="rounded-lg p-2 text-purple-600 hover:bg-purple-50"><FolderPlus size={18}/></button></div>
          <button type="button" onClick={() => setCategoryId("")} className={`mt-4 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold ${!categoryId ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}><span>All resources</span><span>{allTotal}</span></button>
          <div className="mt-1 space-y-1">{categories.map((category) => <div key={category.id} className={`group flex items-center rounded-xl ${categoryId === category.id ? "bg-purple-100" : "hover:bg-slate-50"}`}><button type="button" onClick={() => setCategoryId(category.id)} className={`min-w-0 flex-1 px-3 py-2.5 text-left text-sm font-semibold ${categoryId === category.id ? "text-purple-700" : "text-slate-600"}`}><span className="block truncate">{category.name}</span><span className="text-xs font-normal text-slate-400">{category.assetCount} image{category.assetCount === 1 ? "" : "s"}</span></button><button type="button" title="Edit category" onClick={() => { setEditingCategory(category); setCategoryForm({ name: category.name, description: category.description || "" }); }} className="p-1.5 text-slate-400 opacity-0 hover:text-purple-600 group-hover:opacity-100"><Edit3 size={14}/></button><button type="button" title="Delete category" onClick={() => deleteCategory(category)} className="mr-1 p-1.5 text-slate-400 opacity-0 hover:text-red-500 group-hover:opacity-100"><Trash2 size={14}/></button></div>)}</div>
          <button type="button" onClick={() => { setEditingCategory(null); setCategoryForm(blankCategory); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-purple-300 px-3 py-2.5 text-sm font-bold text-purple-600 hover:bg-purple-50"><Plus size={16}/>New category</button>
        </aside>

        <section className="min-w-0">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-purple-500"><Search size={18} className="text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search resources" className="w-full bg-transparent py-3 text-sm outline-none"/></label>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="hidden" onChange={(event) => uploadFiles([...event.target.files])}/>
            <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-black text-white hover:bg-purple-700 disabled:opacity-60">{uploading ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18}/>} {uploading ? "Uploading..." : "Upload images"}</button>
          </div>
          <p className="px-1 py-4 text-sm text-slate-500">{pagination.total} image{pagination.total === 1 ? "" : "s"}{categoryId ? " in this category" : ""}. New images attached to questions appear here automatically.</p>
          {loading ? <div className="grid min-h-80 place-items-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500"><span className="text-center"><Loader2 className="mx-auto mb-2 animate-spin text-purple-600"/>Loading resources...</span></div> : resources.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{resources.map((resource) => <article key={resource.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative aspect-square bg-slate-100"><img src={resource.url} alt={resource.name} loading="lazy" className="h-full w-full object-cover"/><button type="button" onClick={() => deleteResource(resource)} title="Delete resource" className="absolute right-2 top-2 rounded-lg bg-white/95 p-2 text-slate-500 opacity-0 shadow hover:text-red-500 group-hover:opacity-100 focus:opacity-100"><Trash2 size={16}/></button>{resource.usageCount > 0 && <span className="absolute bottom-2 left-2 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-bold text-white">Used {resource.usageCount} times</span>}</div>
            <div className="p-3"><p className="truncate text-sm font-bold text-slate-800" title={resource.name}>{resource.name}</p><p className="mt-1 truncate text-xs text-slate-400">{resource.categoryName || (resource.source === "question" ? "Question uploads" : "Uncategorised")}</p></div>
          </article>)}</div> : <div className="grid min-h-80 place-items-center rounded-2xl border-2 border-dashed border-purple-200 bg-white text-center"><div className="p-8"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-purple-50 text-purple-600"><Image size={28}/></span><h3 className="mt-4 text-lg font-black text-slate-900">No images here yet</h3><p className="mt-1 text-sm text-slate-500">Upload reusable images or attach them while creating questions.</p><button type="button" onClick={() => inputRef.current?.click()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white"><Upload size={17}/>Upload images</button></div></div>}
          {pagination.totalPages > 1 && <div className="mt-6 flex items-center justify-center gap-3"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border bg-white px-4 py-2 text-sm font-bold disabled:opacity-40">Previous</button><span className="text-sm text-slate-500">Page {page} of {pagination.totalPages}</span><button disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border bg-white px-4 py-2 text-sm font-bold disabled:opacity-40">Next</button></div>}
        </section>
      </div>
    </div>
    {categoryForm && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/50 p-4" onMouseDown={() => !savingCategory && setCategoryForm(null)}><form onSubmit={saveCategory} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-black text-slate-900">{editingCategory ? "Edit category" : "New resource category"}</h2><button type="button" disabled={savingCategory} onClick={() => setCategoryForm(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-40"><X size={19}/></button></div><label className="mt-5 block text-sm font-bold text-slate-700">Name<input autoFocus required minLength="2" maxLength="120" value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" placeholder="e.g. Animals"/></label><label className="mt-4 block text-sm font-bold text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span><textarea maxLength="500" value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500" rows="3" placeholder="What belongs in this category?"/></label><button disabled={savingCategory} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-black text-white hover:bg-purple-700 disabled:opacity-60">{savingCategory && <Loader2 className="animate-spin" size={18}/>} {savingCategory ? "Saving..." : editingCategory ? "Save changes" : "Create category"}</button></form></div>}
  </div>;
}
