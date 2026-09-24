import { Loader2 } from "lucide-react";

export default function CatalogLoadingState({ label = "Loading content..." }) {
  return <div className="grid min-h-72 place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm" role="status" aria-live="polite">
    <div>
      <Loader2 className="mx-auto animate-spin text-purple-600" size={36}/>
      <h2 className="mt-4 text-lg font-bold text-slate-900">{label}</h2>
      <p className="mt-1 text-sm text-slate-500">Please wait while the latest data is prepared.</p>
    </div>
  </div>;
}
