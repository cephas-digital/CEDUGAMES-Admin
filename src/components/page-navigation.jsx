import React from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function PageNavigation({ items = [], title, description, action }) {
  const navigate = useNavigate();
  return <div className="mb-7">
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
      <Link to="/dashboard" className="hover:text-purple-600">Dashboard</Link>
      {items.map((item, index) => <React.Fragment key={`${item.label}-${index}`}><ChevronRight size={14}/>{item.to ? <Link to={item.to} className="hover:text-purple-600">{item.label}</Link> : <span className="font-medium text-slate-800">{item.label}</span>}</React.Fragment>)}
    </nav>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-start gap-3"><button onClick={()=>navigate(-1)} className="mt-0.5 rounded-lg border bg-white p-2 text-slate-600 hover:border-purple-300 hover:text-purple-600" aria-label="Go back"><ArrowLeft size={18}/></button><div><h1 className="text-2xl font-bold text-slate-900">{title}</h1>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div></div>
      {action}
    </div>
  </div>;
}
