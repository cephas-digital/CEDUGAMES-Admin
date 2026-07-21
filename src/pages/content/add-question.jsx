import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  AlertCircle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  FileText,
  Image,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Music2,
  Paperclip,
  Trash2,
  Underline,
  Video,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageNavigation from "../../components/page-navigation";

const EMPTY_OPTIONS = ["", "", "", ""];
const EMPTY_SHAPES = { question: null, option0: null, option1: null, option2: null, option3: null };
const SHAPES = ["circle", "square", "rectangle", "triangle", "star", "hexagon"];
const MEDIA_TYPES = [
  { id: "image", label: "Image", help: "JPG, PNG, WEBP or GIF", accept: "image/*", icon: Image },
  { id: "audio", label: "Audio", help: "MP3, WAV, M4A or OGG", accept: "audio/*", icon: Music2 },
  { id: "video", label: "Video", help: "MP4, WEBM or MOV", accept: "video/*", icon: Video },
  { id: "document", label: "Document", help: "PDF or text document", accept: ".pdf,.txt,.doc,.docx", icon: FileText },
];

const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100";

export default function AddQuestion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    questionText: "",
    explanation: "",
    ageGroupId: searchParams.get("ageGroup") || "",
    categoryId: searchParams.get("category") || "",
    levelId: searchParams.get("level") || "",
    status: "published",
  });
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [shapes, setShapes] = useState(EMPTY_SHAPES);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [ageGroups, setAgeGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [attachments, setAttachments] = useState({ question: null, option0: null, option1: null, option2: null, option3: null });
  const attachmentsRef = useRef(attachments);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  useEffect(() => {
    axios
      .get("/admin/catalog/age-groups")
      .then(({ data }) => setAgeGroups(data.ageGroups || []))
      .catch(() => toast.error("Unable to load age groups."))
      .finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    if (!form.ageGroupId) {
      setCategories([]);
      return;
    }
    axios
      .get(`/admin/catalog/age-groups/${form.ageGroupId}/categories`)
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => toast.error("Unable to load categories."));
  }, [form.ageGroupId]);

  useEffect(() => {
    if (!form.categoryId) {
      setLevels([]);
      return;
    }
    axios
      .get(`/admin/catalog/categories/${form.categoryId}/levels`)
      .then(({ data }) => setLevels(data.levels || []))
      .catch(() => toast.error("Unable to load levels."));
  }, [form.categoryId]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => () => {
    Object.values(attachmentsRef.current).forEach((item) => item && URL.revokeObjectURL(item.preview));
  }, []);

  const completeness = useMemo(() => {
    const checks = [plainText(form.questionText) || attachments.question || shapes.question, options.every((option, index) => plainText(option) || attachments[`option${index}`] || shapes[`option${index}`]), correctAnswer !== null, form.ageGroupId, form.categoryId, form.levelId];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, options, correctAnswer, attachments, shapes]);

  const validate = () => {
    const next = {};
    if (!attachments.question && !shapes.question && plainText(form.questionText).length < 5) next.questionText = "Enter a clear question, attach media, or add a shape.";
    if (options.some((option, index) => !plainText(option) && !attachments[`option${index}`] && !shapes[`option${index}`])) next.options = "Add text, media, or a shape for every answer option.";
    const textOptions = options.map((option) => plainText(option).toLowerCase()).filter(Boolean);
    if (new Set(textOptions).size !== textOptions.length) next.options = "Text answer options must be unique.";
    if (correctAnswer === null) next.correctAnswer = "Select the correct answer.";
    if (!form.ageGroupId) next.ageGroupId = "Select an age group.";
    if (!form.categoryId) next.categoryId = "Select a category.";
    if (!form.levelId) next.levelId = "Select a level.";
    setErrors(next);
    if (Object.keys(next).length) window.scrollTo({ top: 0, behavior: "smooth" });
    return !Object.keys(next).length;
  };

  const setAttachment = (target, file, type) => {
    setAttachments((current) => {
      if (current[target]) URL.revokeObjectURL(current[target].preview);
      return { ...current, [target]: file ? { file, type, preview: URL.createObjectURL(file) } : null };
    });
    setErrors((current) => ({ ...current, [target === "question" ? "questionText" : "options"]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const body = new FormData();
    body.append("questionText", form.questionText);
    body.append("explanation", form.explanation.trim());
    body.append("ageGroupId", form.ageGroupId);
    body.append("categoryId", form.categoryId);
    body.append("levelId", form.levelId);
    body.append("status", form.status);
    body.append("shape", JSON.stringify(shapes.question));
    body.append("options", JSON.stringify(options.map((text, index) => ({ text, isCorrect: index === correctAnswer, mediaType: attachments[`option${index}`]?.type || null, shape: shapes[`option${index}`] }))));
    if (attachments.question) body.append("questionMedia", attachments.question.file, attachments.question.file.name);
    body.append("questionMediaType", attachments.question?.type || "");
    options.forEach((_, index) => { const item = attachments[`option${index}`]; if (item) body.append(`optionMedia${index}`, item.file, item.file.name); });
    try {
      await axios.post("/admin/questions", body);
      toast.success(form.status === "draft" ? "Question saved as draft." : "Question published successfully.");
      navigate("/content");
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.message || "Question could not be saved. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <PageNavigation
          items={[{ label: "Content", to: "/content" }, { label: "Add Question" }]}
          title="Add New Question"
          description="Build a complete, learner-ready question in one place."
        />

        {Object.keys(errors).length > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <div><p className="font-bold">This question needs a little more information.</p><p className="mt-1">Review the highlighted fields before saving.</p></div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700">1</span><div><h2 className="font-bold text-slate-900">Question and answers</h2><p className="text-sm text-slate-500">Write one clear prompt and four distinct choices.</p></div></div>
              <div className="flex items-center justify-between gap-3"><label className="text-sm font-semibold text-slate-700">Question <span className="text-red-500">*</span></label><MediaButton target="question" attachment={attachments.question} onChange={setAttachment} /></div>
              <RichTextEditor value={form.questionText} onChange={(value) => update("questionText", value)} placeholder="Type the question, add formatting, media, or a shape..." error={errors.questionText} />
              <ShapePicker value={shapes.question} onChange={(shape) => setShapes((current) => ({ ...current, question: shape }))} />
              {attachments.question && <AttachmentPreview attachment={attachments.question} onRemove={() => setAttachment("question", null)} />}
              <div className="mt-1 flex justify-between text-xs"><span className="text-red-500">{errors.questionText}</span><span className="text-slate-400">Rich text supported</span></div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {options.map((option, index) => (
                  <div key={index} className={`rounded-xl border p-3 transition ${correctAnswer === index ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}`}>
                    <div className="mb-3 flex items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">Option {String.fromCharCode(65 + index)}</span><div className="flex items-center gap-2"><MediaButton compact target={`option${index}`} attachment={attachments[`option${index}`]} onChange={setAttachment} /><button type="button" onClick={() => { setCorrectAnswer(index); setErrors((current) => ({ ...current, correctAnswer: "" })); }} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${correctAnswer === index ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-emerald-100"}`}><Check size={13} />{correctAnswer === index ? "Correct" : "Mark correct"}</button></div></div>
                    <RichTextEditor compact value={option} onChange={(value) => { const next = [...options]; next[index] = value; setOptions(next); setErrors((current) => ({ ...current, options: "" })); }} placeholder="Type and format an answer..." />
                    <ShapePicker compact value={shapes[`option${index}`]} onChange={(shape) => setShapes((current) => ({ ...current, [`option${index}`]: shape }))} />
                    {attachments[`option${index}`] && <AttachmentPreview attachment={attachments[`option${index}`]} onRemove={() => setAttachment(`option${index}`, null)} compact />}
                  </div>
                ))}
              </div>
              {(errors.options || errors.correctAnswer) && <p className="mt-2 text-xs text-red-500">{errors.options || errors.correctAnswer}</p>}

              <label className="mt-6 block text-sm font-semibold text-slate-700">Answer explanation <span className="font-normal text-slate-400">(recommended)</span></label>
              <textarea rows="3" maxLength="1000" value={form.explanation} onChange={(e) => update("explanation", e.target.value)} placeholder="Explain why the selected answer is correct. Learners can see this after answering." className={`${fieldClass} resize-none`} />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700">2</span><div><h2 className="font-bold text-slate-900">Learning placement</h2><p className="text-sm text-slate-500">Choose where learners will encounter this question.</p></div></div>
              <div className="grid gap-5 md:grid-cols-3">
                <SelectField label="Age group" value={form.ageGroupId} disabled={catalogLoading} error={errors.ageGroupId} onChange={(value) => { setForm((current) => ({ ...current, ageGroupId: value, categoryId: "", levelId: "" })); setErrors((current) => ({ ...current, ageGroupId: "" })); }} options={ageGroups.map((item) => ({ value: item.id, label: `${item.name} (${item.min_age}-${item.max_age})` }))} placeholder="Select age group" />
                <SelectField label="Category" value={form.categoryId} disabled={!form.ageGroupId} error={errors.categoryId} onChange={(value) => { setForm((current) => ({ ...current, categoryId: value, levelId: "" })); setErrors((current) => ({ ...current, categoryId: "" })); }} options={categories.map((item) => ({ value: item.id, label: item.name }))} placeholder="Select category" />
                <SelectField label="Level" value={form.levelId} disabled={!form.categoryId} error={errors.levelId} onChange={(value) => update("levelId", value)} options={levels.map((item) => ({ value: item.id, label: `Level ${item.level_number}: ${item.name}` }))} placeholder="Select level" />
              </div>
            </section>

          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between"><h2 className="font-bold text-slate-900">Question status</h2><span className="text-xs font-bold text-purple-600">{completeness}% complete</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${completeness}%` }} /></div>
              <div className="mt-6 space-y-5">
                <SelectField label="Publish status" value={form.status} onChange={(value) => update("status", value)} options={[{ value: "published", label: "Publish immediately" }, { value: "draft", label: "Save as draft" }]} />
                <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Difficulty, points, and time limits are inherited from the selected level.</p>
              </div>
            </section>
            <section className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm"><h3 className="font-bold">Ready to add it?</h3><p className="mt-1 text-sm leading-6 text-slate-300">Required fields are marked with an asterisk. You can edit the question later.</p><button disabled={submitting} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 px-5 py-3 font-bold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}{submitting ? "Saving question..." : form.status === "draft" ? "Save draft" : "Add question"}</button><button type="button" onClick={() => navigate("/content")} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"><X size={16} />Cancel</button></section>
          </aside>
        </div>
      </div>
    </form>
  );
}

function MediaButton({ target, attachment, onChange, compact = false }) {
  const [open, setOpen] = useState(false);
  const inputs = useRef({});
  return <div className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} className={`flex items-center gap-1.5 rounded-lg border font-semibold transition ${attachment ? "border-purple-300 bg-purple-50 text-purple-700" : "border-slate-200 bg-white text-slate-500 hover:border-purple-300 hover:text-purple-600"} ${compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"}`} aria-label="Attach media" aria-expanded={open}>
      <Paperclip size={compact ? 14 : 16} />{!compact && <span>{attachment ? "Replace media" : "Add media"}</span>}
    </button>
    {open && <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
      <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Choose media type</p>
      {MEDIA_TYPES.map(({ id, label, help, accept, icon: Icon }) => <React.Fragment key={id}>
        <input ref={(node) => { inputs.current[id] = node; }} type="file" accept={accept} className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onChange(target, file, id); event.target.value = ""; setOpen(false); }} />
        <button type="button" onClick={() => inputs.current[id]?.click()} className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left hover:bg-purple-50"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Icon size={18} /></span><span><span className="block text-sm font-semibold text-slate-700">{label}</span><span className="block text-xs text-slate-400">{help}</span></span></button>
      </React.Fragment>)}
    </div>}
  </div>;
}

function AttachmentPreview({ attachment, onRemove, compact = false }) {
  const TypeIcon = MEDIA_TYPES.find((type) => type.id === attachment.type)?.icon || Paperclip;
  return <div className={`mt-3 flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50/60 ${compact ? "p-2" : "p-3"}`}>
    {attachment.type === "image" ? <img src={attachment.preview} alt="Attached preview" className={`${compact ? "h-10 w-10" : "h-14 w-14"} rounded-lg object-cover`} /> : <span className={`flex ${compact ? "h-10 w-10" : "h-14 w-14"} shrink-0 items-center justify-center rounded-lg bg-white text-purple-600`}><TypeIcon size={20} /></span>}
    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-700">{attachment.file.name}</p><p className="mt-0.5 text-xs capitalize text-slate-400">{attachment.type} · {(attachment.file.size / 1024 / 1024).toFixed(2)} MB</p></div>
    <button type="button" onClick={onRemove} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label={`Remove ${attachment.file.name}`}><Trash2 size={16} /></button>
  </div>;
}

function RichTextEditor({ value, onChange, placeholder, error, compact = false }) {
  const editorRef = useRef(null);
  useEffect(() => { if (editorRef.current && editorRef.current.innerHTML !== value && document.activeElement !== editorRef.current) editorRef.current.innerHTML = value; }, [value]);
  const command = (name, commandValue) => { editorRef.current?.focus(); document.execCommand(name, false, commandValue); onChange(editorRef.current?.innerHTML || ""); };
  const tools = [
    [Bold, "Bold", "bold"], [Italic, "Italic", "italic"], [Underline, "Underline", "underline"],
    [List, "Bullet list", "insertUnorderedList"], [ListOrdered, "Numbered list", "insertOrderedList"],
    [AlignLeft, "Align left", "justifyLeft"], [AlignCenter, "Align center", "justifyCenter"], [AlignRight, "Align right", "justifyRight"],
  ];
  return <div className={`mt-2 overflow-hidden rounded-xl border bg-white transition focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100 ${error ? "border-red-400" : "border-slate-200"}`}>
    <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50 p-1.5">{tools.map(([Icon, label, name]) => <button key={name} type="button" title={label} aria-label={label} onMouseDown={(event) => { event.preventDefault(); command(name); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-purple-600 hover:shadow-sm"><Icon size={15}/></button>)}</div>
    <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" data-placeholder={placeholder} onInput={(event) => onChange(event.currentTarget.innerHTML)} className={`${compact ? "min-h-16 p-2.5" : "min-h-28 p-4"} rich-editor text-sm leading-6 text-slate-800 outline-none empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]`} />
  </div>;
}

function ShapePicker({ value, onChange, compact = false }) {
  const [open, setOpen] = useState(false);
  const color = value?.color || "#8b5cf6";
  return <div className="mt-3"><button type="button" onClick={() => setOpen((current) => !current)} className={`flex items-center gap-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 transition hover:border-purple-300 ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}><ShapeVisual type={value?.type || "circle"} color={color} size={18}/>{value ? `Edit ${value.type}` : "Add shape"}</button>
    {open && <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex flex-wrap gap-2">{SHAPES.map((type) => <button key={type} type="button" title={type} onClick={() => onChange({ type, color })} className={`flex h-10 w-10 items-center justify-center rounded-lg border bg-white transition ${value?.type === type ? "border-purple-500 ring-2 ring-purple-100" : "border-slate-200 hover:border-purple-300"}`}><ShapeVisual type={type} color={color} size={25}/></button>)}</div><div className="mt-3 flex items-center gap-3"><label className="text-xs font-bold text-slate-500">Fill color</label><input type="color" value={color} onChange={(event) => onChange({ type: value?.type || "circle", color: event.target.value })} className="h-9 w-12 cursor-pointer rounded border border-slate-200 bg-white p-1"/>{value && <button type="button" onClick={() => { onChange(null); setOpen(false); }} className="ml-auto text-xs font-bold text-red-500">Remove shape</button>}</div></div>}
    {value && <div className="mt-2 flex min-h-20 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white"><ShapeVisual type={value.type} color={value.color} size={compact ? 58 : 76}/></div>}
  </div>;
}

function ShapeVisual({ type, color, size }) {
  const clips = { circle: "circle(50%)", square: "none", rectangle: "none", triangle: "polygon(50% 0,100% 100%,0 100%)", star: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 93%,50% 72%,21% 93%,32% 57%,2% 35%,39% 35%)", hexagon: "polygon(25% 7%,75% 7%,100% 50%,75% 93%,25% 93%,0 50%)" };
  const width = type === "rectangle" ? size * 1.35 : size;
  const height = type === "rectangle" ? size * 0.7 : size;
  return <span aria-label={`${color} ${type}`} role="img" style={{ display: "inline-block", width, height, backgroundColor: color, clipPath: clips[type], borderRadius: type === "square" || type === "rectangle" ? Math.max(3, size / 10) : 0 }} />;
}

function plainText(value) {
  const element = document.createElement("div"); element.innerHTML = value || ""; return (element.textContent || "").trim();
}

function SelectField({ label, value, onChange, options = [], placeholder, disabled, error }) {
  return <div><label className="text-sm font-semibold text-slate-700">{label} {placeholder && <span className="text-red-500">*</span>}</label><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} appearance-none disabled:cursor-not-allowed disabled:bg-slate-100 ${error ? "border-red-400" : ""}`}><option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{error && <p className="mt-1 text-xs text-red-500">{error}</p>}</div>;
}
