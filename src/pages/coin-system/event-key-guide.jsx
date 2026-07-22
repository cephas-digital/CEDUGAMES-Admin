const examples = [
  { key: "hint_used", label: "Player uses a hint", detail: "Deduct coins each time a hint feature is used." },
  { key: "question_skipped", label: "Player skips a question", detail: "Deduct coins when a player chooses to skip." },
  { key: "premium_challenge_entered", label: "Player enters a premium challenge", detail: "Charge an entry amount before a premium challenge starts." },
];

export default function EventKeyGuide(){
 return <aside className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5"><h3 className="font-bold text-slate-900">What does “event key” mean?</h3><p className="mt-1 text-sm text-slate-600">It is the saved technical name for <b>when this rule should run</b>. Use one key for one action. The starter rules below can be edited to change their name, amount, frequency, description, or active status.</p><div className="mt-4 grid gap-3 md:grid-cols-3">{examples.map(item=><div key={item.key} className="rounded-xl bg-white p-3 shadow-sm"><p className="font-semibold text-slate-800">{item.label}</p><code className="text-xs text-purple-700">{item.key}</code><p className="mt-1 text-xs text-slate-500">{item.detail}</p></div>)}</div><p className="mt-4 text-xs font-medium text-amber-700">Failed scores and life refills are already controlled by “Failed-level life deduction” above; do not create a second level-failed rule.</p></aside>;
}
