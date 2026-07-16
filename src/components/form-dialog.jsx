import React from "react";
import { X } from "lucide-react";
export default function FormDialog({open,title,children,onClose}) { if(!open)return null; return <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"><div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose} aria-label="Close"><X className="text-slate-400"/></button></div>{children}</div></div>; }
