import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, FileUp, Loader2, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageNavigation from "../../components/page-navigation";
import { invalidateCatalogPrefix } from "../../data/catalog-cache";

  const EXPECTED_HEADERS = ["Questions", "Option A", "Option B", "Option C", "Option D", "Correct Answer"];
  const TEMPLATE_ROWS = [
    ["What is 2 + 3?", "4", "5", "6", "7", "Option B"],
    ["Which animal says meow?", "Dog", "Cat", "Cow", "Duck", "Option B"],
  ];
  const fieldClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100";

  export default function UploadFiles() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [ageGroups, setAgeGroups] = useState([]), [categories, setCategories] = useState([]), [levels, setLevels] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [learnOptions, setLearnOptions] = useState({ section: [], grade: [], subject: [], topic: [], level: [] });
    const initialLearningLevel = params.get("learningLevel") || "";
    const [form, setForm] = useState({ placementType: initialLearningLevel ? "learn" : "games", ageGroupId: params.get("ageGroup") || "", categoryId: params.get("category") || "", levelId: params.get("level") || "", programId: params.get("program") || "", sectionId: "", gradeId: "", subjectId: "", topicId: "", learningLevelId: initialLearningLevel, status: "published" });
    const [file, setFile] = useState(null), [preview, setPreview] = useState(null), [errors, setErrors] = useState([]), [busy, setBusy] = useState(false);

    const downloadTemplate = () => {
      const escapeCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
      const csv = [EXPECTED_HEADERS, ...TEMPLATE_ROWS].map((row) => row.map(escapeCell).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "cedugames-question-bulk-upload-template.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV template downloaded.");
    };

    useEffect(() => {
      Promise.all([axios.get("/admin/catalog/age-groups"), axios.get("/admin/catalog/programs")])
        .then(([ages, programResponse]) => { setAgeGroups(ages.data.ageGroups || []); setPrograms((programResponse.data.programs || []).filter((item) => item.program_type === "learn")); })
        .catch(() => toast.error("Unable to load learning placements."));
    }, []);
    useEffect(() => {
      setCategories([]); setLevels([]);
      if (!form.ageGroupId) return;
      axios.get(`/admin/catalog/age-groups/${form.ageGroupId}/categories`).then(({ data }) => setCategories(data.categories || [])).catch(() => toast.error("Unable to load categories."));
    }, [form.ageGroupId]);
    useEffect(() => {
      setLevels([]);
      if (!form.categoryId) return;
      axios.get(`/admin/catalog/categories/${form.categoryId}/levels`).then(({ data }) => setLevels(data.levels || [])).catch(() => toast.error("Unable to load levels."));
    }, [form.categoryId]);

    const loadLearningItems = (key, programId, parentId) => {
      setLearnOptions((current) => ({ ...current, [key]: [] }));
      if (!programId || (key !== "section" && !parentId)) return;
      axios.get("/admin/catalog/learning-items", { params: { programId, parentId: parentId || undefined } })
        .then(({ data }) => setLearnOptions((current) => ({ ...current, [key]: data.items || [] })))
        .catch(() => toast.error(`Unable to load ${key}s.`));
    };
    useEffect(() => { loadLearningItems("section", form.programId); }, [form.programId]);
    useEffect(() => { loadLearningItems("grade", form.programId, form.sectionId); }, [form.programId, form.sectionId]);
    useEffect(() => { loadLearningItems("subject", form.programId, form.gradeId); }, [form.programId, form.gradeId]);
    useEffect(() => { loadLearningItems("topic", form.programId, form.subjectId); }, [form.programId, form.subjectId]);
    useEffect(() => { if (!initialLearningLevel) loadLearningItems("level", form.programId, form.topicId); }, [form.programId, form.topicId, initialLearningLevel]);

    const chooseFile = async (event) => {
      const selected = event.target.files?.[0];
      if (!selected) return;
      setFile(selected); setErrors([]);
      try {
        const result = parseCsv(await selected.text());
        setPreview(result);
        setErrors(result.errors);
      } catch { setPreview(null); setErrors(["The selected file could not be read."]); }
      event.target.value = "";
    };

    const validPlacement = form.placementType === "learn" ? form.learningLevelId : form.ageGroupId && form.categoryId && form.levelId;
    const canUpload = Boolean(file && preview?.questions.length && validPlacement && !errors.length);
    const selectedLevel = useMemo(() => form.placementType === "learn" ? learnOptions.level.find((item) => item.id === form.learningLevelId) : levels.find((item) => item.id === form.levelId), [form.placementType, form.learningLevelId, form.levelId, learnOptions.level, levels]);
    const submit = async (event) => {
      event.preventDefault();
      if (!canUpload) return setErrors(["Choose a valid CSV, complete the placement fields, and resolve any row errors."]);
      setBusy(true);
      const body = new FormData();
      body.append("file", file); body.append("status", form.status);
      if (form.placementType === "learn") body.append("learningLevelId", form.learningLevelId);
      else { body.append("ageGroupId", form.ageGroupId); body.append("categoryId", form.categoryId); body.append("levelId", form.levelId); }
      try {
        const { data } = await axios.post("/admin/questions/bulk", body);
        invalidateCatalogPrefix("questions:"); invalidateCatalogPrefix("games:levels:"); invalidateCatalogPrefix("learn:");
        toast.success(data.message);
        navigate(form.placementType === "learn" ? `/categories/level-questions?learningLevel=${form.learningLevelId}&program=${form.programId}` : `/categories/level-questions?ageGroup=${form.ageGroupId}&category=${form.categoryId}&level=${form.levelId}`);
      } catch (error) {
        const messages = error.response?.data?.errors || [error.response?.data?.message || "Questions could not be uploaded."];
        setErrors(messages); toast.error(messages[0]);
      } finally { setBusy(false); }
    };

    return <form onSubmit={submit} className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <PageNavigation items={[{ label: "Content", to: "/content" }, { label: "Bulk upload" }]} title="Bulk upload questions" description="Upload the provided CSV template to add several questions at once." />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3"><span className="rounded-xl bg-purple-100 p-3 text-purple-700"><UploadCloud size={22}/></span><div><h2 className="font-bold text-slate-900">Upload completed CSV</h2><p className="text-sm text-slate-500">Required columns: {EXPECTED_HEADERS.join(", ")}</p></div></div>
              <button type="button" onClick={downloadTemplate} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-bold text-purple-700 transition hover:border-purple-400 hover:bg-purple-100"><Download size={17}/>Download template</button>
            </div>
            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex items-start gap-3"><FileSpreadsheet className="mt-0.5 shrink-0 text-blue-600" size={20}/><div><p className="text-sm font-bold text-slate-800">Start with the downloadable template</p><ol className="mt-2 list-decimal space-y-1 pl-4 text-xs leading-5 text-slate-600"><li>Download and open it in Excel, Google Sheets, or another spreadsheet app.</li><li>Replace the two example rows with your questions. Keep all six column headings unchanged.</li><li>In <strong>Correct Answer</strong>, enter only <strong>Option A</strong>, <strong>Option B</strong>, <strong>Option C</strong>, or <strong>Option D</strong>.</li><li>Save or export the file as CSV, then upload it below.</li></ol></div></div>
            </div>
            <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-6 text-center transition hover:border-purple-400 hover:bg-purple-50">
              <FileUp className="mb-3 text-purple-600" size={30}/><span className="font-bold text-slate-800">{file ? file.name : "Choose your completed CSV file"}</span><span className="mt-1 text-sm text-slate-500">CSV files only. The file will be checked before upload.</span><input type="file" accept=".csv,text/csv" onChange={chooseFile} className="hidden" />
            </label>
            {errors.length > 0 && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p className="flex items-center gap-2 font-bold"><AlertCircle size={17}/>Review before uploading</p><ul className="mt-2 list-disc space-y-1 pl-5">{errors.slice(0, 8).map((error) => <li key={error}>{error}</li>)}</ul>{errors.length > 8 && <p className="mt-1">And {errors.length - 8} more errors.</p>}</div>}
            {preview && !errors.length && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><p className="flex items-center gap-2 font-bold"><CheckCircle2 size={17}/>Ready to upload {preview.questions.length} questions</p><div className="mt-3 max-h-56 overflow-auto rounded-lg bg-white/70"><table className="min-w-[760px] w-full text-left text-xs"><thead><tr className="border-b"><th className="p-2">Question</th><th className="p-2">Option A</th><th className="p-2">Option B</th><th className="p-2">Option C</th><th className="p-2">Option D</th><th className="p-2">Correct answer</th></tr></thead><tbody>{preview.questions.slice(0, 10).map((question) => <tr key={`${question.question}-${question.correctAnswer}`} className="border-b last:border-0"><td className="p-2 font-semibold">{question.question}</td>{question.options.map((option, index) => <td key={index} className={`p-2 ${index === question.correctAnswer ? "font-bold text-emerald-700" : ""}`}>{option}</td>)}<td className="p-2 font-bold">Option {String.fromCharCode(65 + question.correctAnswer)}</td></tr>)}</tbody></table></div>{preview.questions.length > 10 && <p className="mt-2 text-xs">Showing the first 10 rows.</p>}</div>}
          </section>
          <aside className="h-fit space-y-6 lg:sticky lg:top-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">Learning placement</h2><p className="mt-1 text-sm text-slate-500">All uploaded questions will use this placement.</p>
              <Select label="Learning path" value={form.placementType} onChange={(value) => setForm({ ...form, placementType: value })} options={[{ value: "games", label: "CEDUGAMES" }, { value: "learn", label: "CEDU-LEARN" }]}/>
              {form.placementType === "games" ? <>
                <Select label="Age group" value={form.ageGroupId} onChange={(value) => setForm({ ...form, ageGroupId: value, categoryId: "", levelId: "" })} options={ageGroups.map((item) => ({ value: item.id, label: `${item.name} (${item.min_age}-${item.max_age})` }))} placeholder="Select age group"/>
                <Select label="Category" value={form.categoryId} disabled={!form.ageGroupId} onChange={(value) => setForm({ ...form, categoryId: value, levelId: "" })} options={categories.map((item) => ({ value: item.id, label: item.name }))} placeholder="Select category"/>
                <Select label="Level" value={form.levelId} disabled={!form.categoryId} onChange={(value) => setForm({ ...form, levelId: value })} options={levels.map((item) => ({ value: item.id, label: `Level ${item.level_number}: ${item.name}` }))} placeholder="Select level"/>
              </> : <>
                <Select label="Program" value={form.programId} onChange={(value) => setForm({ ...form, programId: value, sectionId: "", gradeId: "", subjectId: "", topicId: "", learningLevelId: "" })} options={programs.map((item) => ({ value: item.id, label: item.title }))} placeholder="Select CEDU-LEARN program"/>
                <Select label="Grade section" value={form.sectionId} disabled={!form.programId} onChange={(value) => setForm({ ...form, sectionId: value, gradeId: "", subjectId: "", topicId: "", learningLevelId: "" })} options={learnOptions.section.map(cardOption)} />
                <Select label="Grade" value={form.gradeId} disabled={!form.sectionId} onChange={(value) => setForm({ ...form, gradeId: value, subjectId: "", topicId: "", learningLevelId: "" })} options={learnOptions.grade.map(cardOption)} />
                <Select label="Subject" value={form.subjectId} disabled={!form.gradeId} onChange={(value) => setForm({ ...form, subjectId: value, topicId: "", learningLevelId: "" })} options={learnOptions.subject.map(cardOption)} />
                <Select label="Topic" value={form.topicId} disabled={!form.subjectId} onChange={(value) => setForm({ ...form, topicId: value, learningLevelId: "" })} options={learnOptions.topic.map(cardOption)} />
                <Select label="Level" value={form.learningLevelId} disabled={!form.topicId && !initialLearningLevel} onChange={(value) => setForm({ ...form, learningLevelId: value })} options={initialLearningLevel && !learnOptions.level.length ? [{ value: initialLearningLevel, label: "Selected CEDU-LEARN level" }] : learnOptions.level.map(cardOption)} />
              </>}
              <Select label="Publish status" value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={[{ value: "published", label: "Publish immediately" }, { value: "draft", label: "Save as drafts" }]}/>
              {selectedLevel && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">{selectedLevel.points_per_question} points per question · {selectedLevel.time_limit_seconds} seconds each.</p>}
            </section>
            <section className="rounded-2xl bg-slate-900 p-6 text-white"><h3 className="font-bold">Ready to upload?</h3><p className="mt-1 text-sm leading-6 text-slate-300">The upload is transactional: if any row fails validation, no questions are added.</p><button disabled={busy || !canUpload} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={18}/> : <UploadCloud size={18}/>} {busy ? "Uploading questions..." : "Upload questions"}</button></section>
          </aside>
        </div>
      </div>
    </form>;
  }

  const cardOption = (item) => ({ value: item.id, label: item.item_type === "level" ? `Level ${item.sort_order}: ${item.title}` : item.title });

  function Select({ label, value, onChange, options, placeholder, disabled }) { return <label className="mt-5 block text-sm font-semibold text-slate-700">{label}<select className={fieldClass} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}><option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }

  function parseCsv(source) {
    const rows = []; let row = [], cell = "", quoted = false;
    for (let index = 0; index < source.length; index += 1) { const character = source[index]; if (character === '"') { if (quoted && source[index + 1] === '"') { cell += '"'; index += 1; } else quoted = !quoted; } else if (character === "," && !quoted) { row.push(cell.trim()); cell = ""; } else if ((character === "\n" || character === "\r") && !quoted) { if (character === "\r" && source[index + 1] === "\n") index += 1; row.push(cell.trim()); cell = ""; if (row.some(Boolean)) rows.push(row); row = []; } else cell += character; }
    if (cell || row.length) { row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); }
    const headers = (rows.shift() || []).map((value) => value.replace(/^\uFEFF/, "").toLowerCase()); const expected = EXPECTED_HEADERS.map((value) => value.toLowerCase());
    const errors = headers.length !== expected.length || headers.some((value, index) => value !== expected[index]) ? [`The CSV headers must be: ${EXPECTED_HEADERS.join(", ")}.`] : [];
    const questions = rows.map((values, index) => { const line = index + 2; if (values.length !== 6) { errors.push(`Row ${line} must contain exactly six columns.`); return null; } const correctAnswer = ["option a", "option b", "option c", "option d"].indexOf(values[5].toLowerCase().replace(/\s+/g, " ")); if (correctAnswer < 0) { errors.push(`Row ${line} must use Option A, Option B, Option C, or Option D.`); return null; } if (!values[0] || values.slice(1, 5).some((value) => !value)) { errors.push(`Row ${line} must include a question and four options.`); return null; } return { question: values[0], options: values.slice(1, 5), correctAnswer }; }).filter(Boolean);
    if (!questions.length && !errors.length) errors.push("The CSV contains no question rows.");
    return { questions, errors };
  }
