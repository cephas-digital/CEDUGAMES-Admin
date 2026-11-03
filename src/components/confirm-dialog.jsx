import React, { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({ open, title="Confirm deletion", message, confirmLabel="Delete", loading=false, onCancel, onConfirm, confirmationText }) {
  const [typed, setTyped] = useState("");
  useEffect(() => { if (open) setTyped(""); }, [open, confirmationText]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex justify-between"><span className="rounded-full bg-red-100 p-3 text-red-600"><AlertTriangle size={24}/></span><button onClick={onCancel} aria-label="Close"><X className="text-slate-400"/></button></div>
      <h2 className="mt-5 text-xl font-bold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
      {confirmationText && <label className="mt-4 block text-sm font-semibold text-slate-700">Type <span className="font-black text-red-700">{confirmationText}</span> to confirm<input autoComplete="off" value={typed} onChange={(event) => setTyped(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100" aria-label={"Type " + confirmationText + " to confirm deletion"} /></label>}<div className="mt-6 flex justify-end gap-3"><button disabled={loading} onClick={onCancel} className="rounded-xl border px-5 py-2.5 text-sm font-semibold">Cancel</button><button disabled={loading || Boolean(confirmationText && typed.trim() !== confirmationText)} onClick={() => onConfirm(typed)} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading?"Deleting...":confirmLabel}</button></div>
    </div>
  </div>;
}
