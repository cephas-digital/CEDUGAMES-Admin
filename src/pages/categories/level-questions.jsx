import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2, Clock3, FileText, ImageIcon, Loader2, Plus, Trophy, Video, Volume2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import PageNavigation from "../../components/page-navigation";
import { useURL } from "../../data/Config";

const assetUrl = (value) => value?.startsWith("/") ? `${useURL}${value}` : value;

export default function LevelQuestions() {
  const [params] = useSearchParams();
  const levelId = params.get("level");
  const ageId = params.get("ageGroup");
  const categoryId = params.get("category");
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!levelId) { setError("No level was selected."); setLoading(false); return; }
    axios.get(`/admin/levels/${levelId}/questions`)
      .then(({ data }) => { setLevel(data.level); setQuestions(data.questions || []); })
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load questions."))
      .finally(() => setLoading(false));
  }, [levelId]);

  const addUrl = `/content/add-question?ageGroup=${ageId}&category=${categoryId}&level=${levelId}`;
  const backUrl = `/categories/view-categories?ageGroup=${ageId}&category=${categoryId}`;

  return <div className="mx-auto w-full max-w-7xl px-6 pb-12">
    <PageNavigation items={[{ label: "Levels", to: backUrl }, { label: level?.name || "Questions" }]} title={level ? `Level ${level.level_number}: ${level.name}` : "Level questions"} description={`${questions.length} question${questions.length === 1 ? "" : "s"} in this level`} action={<Link to={addUrl} className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700"><Plus size={18}/>Add question</Link>} />
    {level && <div className="mb-6 flex flex-wrap gap-3"><Stat icon={Trophy} label={`${level.points_per_question} points per answer`} /><Stat icon={Clock3} label={`${level.time_limit_seconds} seconds per question`} /></div>}
    {loading ? <div className="flex items-center justify-center gap-3 rounded-2xl border bg-white p-20 text-slate-500"><Loader2 className="animate-spin text-purple-600"/>Loading questions...</div> : error ? <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"><AlertCircle/>{error}</div> : questions.length ? <div className="space-y-5">{questions.map((question, index) => <QuestionPreview key={question.id} question={question} number={index + 1} />)}</div> : <div className="rounded-3xl border-2 border-dashed border-purple-200 bg-white p-16 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600"><FileText size={26}/></span><h2 className="mt-5 text-xl font-bold text-slate-900">No questions in this level</h2><p className="mt-2 text-sm text-slate-500">Create the first question and it will appear here.</p><Link to={addUrl} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white"><Plus size={17}/>Create question</Link></div>}
  </div>;
}

function Stat({ icon: Icon, label }) {
  return <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600"><Icon size={15} className="text-purple-600"/>{label}</span>;
}

function QuestionPreview({ question, number }) {
  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-sm font-black text-white">{number}</span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Question {number}</p><p className="text-xs text-slate-500">{question.points} points · {question.timeLimit} seconds</p></div></div><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${question.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{question.status}</span></header>
    <div className="p-5 sm:p-6"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto]"><div><h2 className="text-lg font-bold leading-7 text-slate-900">{question.text || "Media-only question"}</h2>{question.explanation && <p className="mt-2 text-sm leading-6 text-slate-500">{question.explanation}</p>}</div><Media type={question.mediaType} url={question.mediaUrl} label="Question attachment" /></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">{question.options.map((option, index) => <div key={option.id} className={`rounded-xl border p-4 ${option.isCorrect ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-start gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${option.isCorrect ? "bg-emerald-600 text-white" : "bg-white text-slate-500"}`}>{String.fromCharCode(65 + index)}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="font-semibold text-slate-800">{option.text || "Media answer"}</p>{option.isCorrect && <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={14}/>Correct</span>}</div><Media type={option.mediaType} url={option.mediaUrl} label={`Option ${String.fromCharCode(65 + index)}`} compact /></div></div></div>)}</div>
    </div>
  </article>;
}

function Media({ type, url, label, compact = false }) {
  if (!url) return null;
  const src = assetUrl(url);
  if (type === "image") return <img src={src} alt={label} className={`${compact ? "mt-3 h-24 w-full" : "h-32 w-48"} rounded-xl border bg-white object-contain`} />;
  if (type === "audio") return <div className="mt-3"><span className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-500"><Volume2 size={14}/>Audio</span><audio controls preload="metadata" className="max-w-full"><source src={src}/></audio></div>;
  if (type === "video") return <video controls preload="metadata" className={`${compact ? "mt-3 max-h-32" : "max-h-40 w-64"} rounded-xl bg-slate-900`}><source src={src}/></video>;
  return <a href={src} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700">{type === "image" ? <ImageIcon size={14}/> : type === "video" ? <Video size={14}/> : <FileText size={14}/>}Open attachment</a>;
}
