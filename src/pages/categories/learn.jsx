import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageNavigation from "../../components/page-navigation";
import FormDialog from "../../components/form-dialog";
import ConfirmDialog from "../../components/confirm-dialog";
import ImageUploadField from "../../components/image-upload-field";
import { uploadCatalogImage } from "../../data/media";
import CatalogEmptyState from "../../components/catalog-empty-state";

const order = ["section", "grade", "subject", "topic", "level"];
const labels = { section: "Grade Section", grade: "Grade", subject: "Subject", topic: "Topic", level: "Level" };
const empty = { title: "", tag: "", description: "", imageUrl: "", sortOrder: 0, pointsPerQuestion: 10, timeLimitSeconds: 30, questionsPerPlay: 10 };
const field = "mt-2 w-full rounded-xl border bg-slate-50 px-4 py-3";

export default function Learn() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const programId = params.get("program"), parentId = params.get("parent"), type = params.get("type") || "section";
  const [items, setItems] = useState([]), [parent, setParent] = useState(null), [questions, setQuestions] = useState([]);
  const [dialog, setDialog] = useState(false), [editing, setEditing] = useState(null), [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(empty), [file, setFile] = useState(null), [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      if (parentId) setParent((await axios.get(`/admin/catalog/learning-items/${parentId}`)).data.item);
      if (type === "questions") setQuestions((await axios.get(`/admin/catalog/learning-items/${parentId}/questions`)).data.questions || []);
      else setItems((await axios.get("/admin/catalog/learning-items", { params: { programId, parentId: parentId || undefined } })).data.items || []);
    } catch { toast.error("Unable to load learning content"); }
  }, [programId, parentId, type]);
  useEffect(() => { load(); }, [load]);

  const open = (item = null) => {
    setEditing(item); setFile(null);
    setForm(item ? { title: item.title, tag: item.tag || "", description: item.description || "", imageUrl: item.image_url, sortOrder: item.sort_order, pointsPerQuestion: item.points_per_question || 10, timeLimitSeconds: item.time_limit_seconds || 30, questionsPerPlay: item.questions_per_play || 10 } : empty);
    setDialog(true);
  };
  const save = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      const imageUrl = file ? await uploadCatalogImage(file) : form.imageUrl;
      if (!imageUrl) throw new Error("Card image is required.");
      const body = { ...form, sortOrder: Number(form.sortOrder), pointsPerQuestion: Number(form.pointsPerQuestion), timeLimitSeconds: Number(form.timeLimitSeconds), questionsPerPlay: Number(form.questionsPerPlay), imageUrl, programId, parentId: parentId || null, itemType: type };
      if (editing) await axios.put(`/admin/catalog/learning-items/${editing.id}`, body); else await axios.post("/admin/catalog/learning-items", body);
      setDialog(false); await load();
    } catch (error) { toast.error(error.response?.data?.message || error.message); }
    finally { setBusy(false); }
  };
  const remove = async () => { await axios.delete(`/admin/catalog/learning-items/${deleting.id}`); setDeleting(null); load(); };
  const enter = item => { const index = order.indexOf(item.item_type); if (index === 4) navigate(`/categories/level-questions?learningLevel=${item.id}&program=${programId}`); else setParams({ program: programId, parent: item.id, type: order[index + 1] }); };
  const questionUrl = question => `/content/add-question?learningLevel=${parentId}&program=${programId}${question ? `&question=${question.id}` : ""}`;
  const removeQuestion = async question => { await axios.delete(`/admin/questions/${question.id}`); load(); };
  const rows = type === "questions" ? questions : items;

  return <div className="mx-auto w-full max-w-7xl px-6 pb-10">
    <PageNavigation items={[{ label: "Categories & Levels", to: "/categories" }, { label: parent?.title || labels[type] || "CEDU-LEARN" }]} title={type === "questions" ? `${parent?.title || "Level"} Questions` : `${labels[type]}s`} description={type === "questions" ? "Create and manage full multimedia questions for this level." : `Manage ${labels[type].toLowerCase()} cards. Title and image are required.`} action={<button onClick={() => type === "questions" ? navigate(questionUrl()) : open()} className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white"><Plus size={18}/>Add {type === "questions" ? "Question" : labels[type]}</button>}/>
    {!rows.length && <CatalogEmptyState title={type === "questions" ? "No questions in this level" : `No ${labels[type].toLowerCase()}s yet`} message={type === "questions" ? "Use the full question builder to add the first learner-ready question." : `Add the first ${labels[type].toLowerCase()} to continue this learning path.`} actionLabel={`Add ${type === "questions" ? "question" : labels[type]}`} onAction={() => type === "questions" ? navigate(questionUrl()) : open()}/>}<div className={`${rows.length ? "" : "hidden"} overflow-hidden rounded-2xl border bg-white`}><table className="w-full text-left"><thead className="bg-slate-50"><tr><th className="px-6 py-4">{type === "questions" ? "Question" : "Card"}</th>{type !== "questions" && <><th className="px-6 py-4">Tag</th><th className="px-6 py-4">Description</th><th className="px-6 py-4">Contents</th></>}<th className="px-6 py-4 text-right">Actions</th></tr></thead>
      <tbody className="divide-y">{rows.map(item => <tr key={item.id}><td className="px-6 py-4">{type === "questions" ? <b>{item.question_text}</b> : <div className="flex items-center gap-3"><img className="h-12 w-16 rounded object-cover" src={item.image_url} alt=""/><b>{item.title}</b></div>}</td>{type !== "questions" && <><td className="px-6 py-4">{item.tag || "—"}</td><td className="px-6 py-4 text-sm">{item.description || "—"}</td><td className="px-6 py-4">{item.item_type === "level" ? `${item.question_count} questions` : `${item.child_count} items`}</td></>}<td className="px-6 py-4"><div className="flex justify-end gap-3">{type !== "questions" && <button onClick={() => enter(item)} className="flex gap-1"><Eye size={16}/>Open</button>}<button onClick={() => type === "questions" ? navigate(questionUrl(item)) : open(item)} className="flex gap-1 text-purple-600"><Pencil size={16}/>Edit</button><button onClick={() => type === "questions" ? removeQuestion(item) : setDeleting(item)} className="flex gap-1 text-red-500"><Trash2 size={16}/>Delete</button></div></td></tr>)}</tbody></table></div>
    <FormDialog open={dialog} title={`${editing ? "Edit" : "Add"} ${labels[type]}`} onClose={() => setDialog(false)}><form onSubmit={save} className="space-y-4"><label className="block font-semibold">Card title *<input required className={field} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })}/></label><label className="block">Card tag (optional)<input className={field} value={form.tag} onChange={event => setForm({ ...form, tag: event.target.value })}/></label><label className="block">Description (optional)<textarea className={field} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })}/></label>{type === "level" && <div className="grid gap-4 sm:grid-cols-2"><label className="block font-semibold">Level number<input required min="1" type="number" className={field} value={form.sortOrder} onChange={event => setForm({ ...form, sortOrder: event.target.value })}/></label><label className="block font-semibold">Points per question<input required min="1" max="1000" type="number" className={field} value={form.pointsPerQuestion} onChange={event => setForm({ ...form, pointsPerQuestion: event.target.value })}/></label><label className="block font-semibold">Time per question (seconds)<input required min="5" max="600" type="number" className={field} value={form.timeLimitSeconds} onChange={event => setForm({ ...form, timeLimitSeconds: event.target.value })}/></label><label className="block font-semibold">Questions per play<input required min="1" max="200" type="number" className={field} value={form.questionsPerPlay} onChange={event => setForm({ ...form, questionsPerPlay: event.target.value })}/></label></div>}<ImageUploadField file={file} currentUrl={form.imageUrl} onChange={setFile}/><button disabled={busy} className="w-full rounded-xl bg-purple-600 py-3 font-bold text-white disabled:opacity-60">{busy ? "Saving…" : "Save"}</button></form></FormDialog>
    <ConfirmDialog open={Boolean(deleting)} onCancel={() => setDeleting(null)} onConfirm={remove} title="Delete item?" message="This also deletes all content below it."/>
  </div>;
}
