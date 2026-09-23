import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2, Clock3, FileText, ImageIcon, Loader2, Pencil, Plus, Sparkles, Trash2, Trophy, Video, Volume2, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageNavigation from "../../components/page-navigation";
import { useURL } from "../../data/Config";

const assetUrl = (value) => value?.startsWith("/") ? `${useURL}${value}` : value;

export default function LevelQuestions() {
  const [params] = useSearchParams();
  const levelId = params.get("level");
  const ageId = params.get("ageGroup");
  const categoryId = params.get("category");
  const learningLevelId = params.get("learningLevel");
  const programId = params.get("program");
  const selectedLevelId = learningLevelId || levelId;
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatorOpen, setGeneratorOpen] = useState(false);

  useEffect(() => {
    if (!selectedLevelId) { setError("No level was selected."); setLoading(false); return; }
    axios.get(learningLevelId ? `/admin/catalog/learning-items/${learningLevelId}/questions` : `/admin/levels/${levelId}/questions`)
      .then(({ data }) => { setLevel(data.level); setQuestions(data.questions || []); })
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load questions."))
      .finally(() => setLoading(false));
  }, [levelId, learningLevelId, selectedLevelId]);

  const addUrl = learningLevelId ? `/content/add-question?learningLevel=${learningLevelId}&program=${programId}` : `/content/add-question?ageGroup=${ageId}&category=${categoryId}&level=${levelId}`;
  const backUrl = learningLevelId ? `/categories/learn?program=${programId}` : `/categories/view-categories?ageGroup=${ageId}&category=${categoryId}`;

  return <div className="mx-auto w-full max-w-7xl px-6 pb-12">
    <PageNavigation items={[{ label: "Levels", to: backUrl }, { label: level?.name || "Questions" }]} title={level ? `Level ${level.level_number}: ${level.name}` : "Level questions"} description={`${questions.length} question${questions.length === 1 ? "" : "s"} in this level`} action={<div className="flex flex-wrap gap-2"><button onClick={() => setGeneratorOpen(true)} disabled={!levelId || !ageId || !categoryId} className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-100 disabled:opacity-50"><Sparkles size={18}/>Generate with AI</button><Link to={addUrl} className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700"><Plus size={18}/>Add manually</Link></div>} />
    {level && <div className="mb-6 flex flex-wrap gap-3"><Stat icon={Trophy} label={`${level.points_per_question} points per answer`} /><Stat icon={Clock3} label={`${level.time_limit_seconds} seconds per question`} /></div>}
    {loading ? <div className="flex items-center justify-center gap-3 rounded-2xl border bg-white p-20 text-slate-500"><Loader2 className="animate-spin text-purple-600"/>Loading questions...</div> : error ? <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"><AlertCircle/>{error}</div> : questions.length ? <div className="space-y-5">{questions.map((question, index) => <QuestionPreview key={question.id} question={question} number={index + 1} editUrl={`${addUrl}&question=${question.id}`} />)}</div> : <div className="rounded-3xl border-2 border-dashed border-purple-200 bg-white p-16 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600"><FileText size={26}/></span><h2 className="mt-5 text-xl font-bold text-slate-900">No questions in this level</h2><p className="mt-2 text-sm text-slate-500">Create the first question and it will appear here.</p><Link to={addUrl} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white"><Plus size={17}/>Create question</Link></div>}
    {generatorOpen && <QuestionGenerator ageGroupId={ageId} categoryId={categoryId} levelId={levelId} level={level} onClose={() => setGeneratorOpen(false)} onImported={() => { setGeneratorOpen(false); window.location.reload(); }}/>}
  </div>;
}

function QuestionGenerator({ ageGroupId, categoryId, levelId, level, onClose, onImported }) {
  const [count, setCount] = useState(5), [guidance, setGuidance] = useState("");
  const [drafts, setDrafts] = useState([]), [generating, setGenerating] = useState(false), [importing, setImporting] = useState(false);
  const [status, setStatus] = useState("draft");
  const generate = async () => {
    setGenerating(true);
    try {
      const { data } = await axios.post("/admin/questions/ai/generate", { ageGroupId, categoryId, levelId, count: Number(count), guidance });
      setDrafts(data.questions || []); toast.success(`${data.questions.length} editable drafts generated.`);
    } catch (error) { toast.error(error.response?.data?.message || "Questions could not be generated."); }
    finally { setGenerating(false); }
  };
  const update = (questionIndex, key, value) => setDrafts((items) => items.map((item, index) => index === questionIndex ? { ...item, [key]: value } : item));
  const updateOption = (questionIndex, optionIndex, key, value) => setDrafts((items) => items.map((item, index) => index === questionIndex ? { ...item, options: item.options.map((option, position) => position === optionIndex ? { ...option, [key]: value } : key === "isCorrect" && value ? { ...option, isCorrect: false } : option) } : item));
  const importDrafts = async () => {
    if (!drafts.length) return;
    setImporting(true);
    let saved = 0;
    try {
      for (const draft of drafts) {
        const body = new FormData();
        body.append("questionText", draft.questionText); body.append("explanation", draft.explanation);
        body.append("ageGroupId", ageGroupId); body.append("categoryId", categoryId); body.append("levelId", levelId);
        body.append("status", status); body.append("shape", "null"); body.append("questionMediaType", "");
        body.append("options", JSON.stringify(draft.options.map((option) => ({ text: option.text, isCorrect: option.isCorrect, mediaType: null, shape: null }))));
        await axios.post("/admin/questions", body); saved += 1;
      }
      toast.success(`${saved} question${saved === 1 ? "" : "s"} saved as ${status}.`); onImported();
    } catch (error) {
      toast.error(`${saved ? `${saved} saved. ` : ""}${error.response?.data?.message || error.response?.data?.errors?.[0]?.message || "Import stopped because a draft was invalid."}`);
    } finally { setImporting(false); }
  };
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"><div className="mx-auto my-6 max-w-6xl overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
    <header className="flex items-start justify-between gap-4 bg-gradient-to-r from-purple-700 to-fuchsia-600 p-6 text-white"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-purple-100"><Sparkles size={15}/>AI question studio</p><h2 className="mt-2 text-2xl font-black">{level ? `Level ${level.level_number}: ${level.name}` : "Generate question drafts"}</h2><p className="mt-1 text-sm text-purple-100">Generate, review, edit, and then choose whether to save as drafts or publish.</p></div><button onClick={onClose} className="rounded-xl bg-white/15 p-2 hover:bg-white/25"><X/></button></header>
    <div className="p-5 sm:p-7">
      <section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)]"><label className="text-sm font-bold text-slate-700">Number of questions<input type="number" min="1" max="20" value={count} onChange={(e) => setCount(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-3 outline-none focus:border-purple-500"/></label><label className="text-sm font-bold text-slate-700">Guidance prompt <span className="font-normal text-slate-400">(optional)</span><textarea rows="3" maxLength="2000" value={guidance} onChange={(e) => setGuidance(e.target.value)} placeholder="Example: Focus on two-digit addition without carrying. Use familiar classroom and playground situations." className="mt-2 w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-purple-500"/></label></div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="max-w-2xl text-xs leading-5 text-slate-500">AI creates text-only drafts using the selected age group, category, and level. Always review accuracy and age suitability before publishing.</p><button disabled={generating || count < 1 || count > 20} onClick={generate} className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-black text-white disabled:opacity-50">{generating ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>} {generating ? "Generating…" : drafts.length ? "Generate again" : "Generate drafts"}</button></div>
      </section>
      {drafts.length > 0 && <><div className="my-6 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-black text-slate-900">Review {drafts.length} drafts</h3><p className="text-sm text-slate-500">Every field remains editable before saving.</p></div><div className="flex items-center gap-3"><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border bg-white px-4 py-3 text-sm font-bold"><option value="draft">Save as drafts</option><option value="published">Publish immediately</option></select><button disabled={importing} onClick={importDrafts} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-black text-white disabled:opacity-50">{importing ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>} {importing ? "Saving…" : `Save all ${drafts.length}`}</button></div></div>
        <div className="space-y-4">{drafts.map((draft, questionIndex) => <article key={questionIndex} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><span className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">QUESTION {questionIndex + 1}</span><button onClick={() => setDrafts((items) => items.filter((_, index) => index !== questionIndex))} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={17}/></button></div><textarea rows="2" value={draft.questionText} onChange={(e) => update(questionIndex, "questionText", e.target.value)} className="w-full resize-none rounded-xl border px-4 py-3 font-bold outline-none focus:border-purple-500"/>
          <div className="mt-4 grid gap-3 md:grid-cols-2">{draft.options.map((option, optionIndex) => <div key={optionIndex} className={`flex items-center gap-3 rounded-xl border p-3 ${option.isCorrect ? "border-emerald-300 bg-emerald-50" : "bg-slate-50"}`}><button onClick={() => updateOption(questionIndex, optionIndex, "isCorrect", true)} className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black ${option.isCorrect ? "bg-emerald-600 text-white" : "bg-white text-slate-500"}`}>{String.fromCharCode(65 + optionIndex)}</button><input value={option.text} onChange={(e) => updateOption(questionIndex, optionIndex, "text", e.target.value)} className="min-w-0 flex-1 bg-transparent font-semibold outline-none"/></div>)}</div>
          <label className="mt-4 block text-xs font-black uppercase tracking-wide text-slate-400">Teaching explanation<textarea rows="2" value={draft.explanation} onChange={(e) => update(questionIndex, "explanation", e.target.value)} className="mt-2 w-full resize-none rounded-xl border px-4 py-3 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-purple-500"/></label></article>)}</div>
      </>}
    </div>
  </div></div>;
}

function Stat({ icon: Icon, label }) {
  return <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600"><Icon size={15} className="text-purple-600"/>{label}</span>;
}

function QuestionPreview({ question, number, editUrl }) {
  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-sm font-black text-white">{number}</span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Question {number}</p><p className="text-xs text-slate-500">{question.points} points · {question.timeLimit} seconds</p></div></div><div className="flex items-center gap-2"><Link to={editUrl} className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-50"><Pencil size={14}/>Edit</Link><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${question.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{question.status}</span></div></header>
    <div className="p-5 sm:p-6"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto]"><div><div className="rich-content text-lg leading-7 text-slate-900" dangerouslySetInnerHTML={{ __html: question.text || "<p>Visual question</p>" }}/>{question.explanation && <p className="mt-2 text-sm leading-6 text-slate-500">{question.explanation}</p>}</div><div className="flex items-center gap-4"><Shape type={question.shapeType} color={question.shapeColor}/><Media type={question.mediaType} url={question.mediaUrl} label="Question attachment" /></div></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">{question.options.map((option, index) => <div key={option.id} className={`rounded-xl border p-4 ${option.isCorrect ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-start gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${option.isCorrect ? "bg-emerald-600 text-white" : "bg-white text-slate-500"}`}>{String.fromCharCode(65 + index)}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="rich-content font-semibold text-slate-800" dangerouslySetInnerHTML={{ __html: option.text || "<p>Visual answer</p>" }}/>{option.isCorrect && <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={14}/>Correct</span>}</div><Shape type={option.shapeType} color={option.shapeColor} compact/><Media type={option.mediaType} url={option.mediaUrl} label={`Option ${String.fromCharCode(65 + index)}`} compact /></div></div></div>)}</div>
    </div>
  </article>;
}

function Shape({ type, color, compact = false }) {
  if (!type || !color) return null;
  const clips = { circle: "circle(50%)", square: "none", rectangle: "none", triangle: "polygon(50% 0,100% 100%,0 100%)", star: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 93%,50% 72%,21% 93%,32% 57%,2% 35%,39% 35%)", hexagon: "polygon(25% 7%,75% 7%,100% 50%,75% 93%,25% 93%,0 50%)" };
  const size = compact ? 64 : 96;
  return <div className="mt-3 flex justify-center"><span role="img" aria-label={`${color} ${type}`} style={{ display: "block", width: type === "rectangle" ? size * 1.35 : size, height: type === "rectangle" ? size * .7 : size, backgroundColor: color, clipPath: clips[type], borderRadius: type === "square" || type === "rectangle" ? 8 : 0 }}/></div>;
}

function Media({ type, url, label, compact = false }) {
  if (!url) return null;
  const src = assetUrl(url);
  if (type === "image") return <img src={src} alt={label} className={`${compact ? "mt-3 h-24 w-full" : "h-32 w-48"} rounded-xl border bg-white object-contain`} />;
  if (type === "audio") return <div className="mt-3"><span className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-500"><Volume2 size={14}/>Audio</span><audio controls preload="metadata" className="max-w-full"><source src={src}/></audio></div>;
  if (type === "video") return <video controls preload="metadata" className={`${compact ? "mt-3 max-h-32" : "max-h-40 w-64"} rounded-xl bg-slate-900`}><source src={src}/></video>;
  return <a href={src} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700">{type === "image" ? <ImageIcon size={14}/> : type === "video" ? <Video size={14}/> : <FileText size={14}/>}Open attachment</a>;
}
