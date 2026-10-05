import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ImagePlus, Loader2, Megaphone, MonitorSmartphone, Trash2 } from "lucide-react";
import PageNavigation from "../../components/page-navigation";

const emptyContent = { advert: { imageUrl: null, enabled: false }, slider: { enabled: false, images: [] } };

function Toggle({ checked, disabled, onChange, label }) {
  return <label className={`inline-flex items-center gap-3 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}><span className="text-sm font-bold text-slate-700">{label}</span><input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)}/><span className="relative h-7 w-12 rounded-full bg-slate-200 transition peer-checked:bg-purple-600 peer-focus-visible:ring-4 peer-focus-visible:ring-purple-200 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"/></label>;
}

export default function FamilyPageContent() {
  const advertInput = useRef(null);
  const slideInput = useRef(null);
  const [content, setContent] = useState(emptyContent);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const load = useCallback(() => axios.get("/admin/family-page/content").then(({ data }) => setContent(data)), []);
  useEffect(() => { load().catch(() => toast.error("Unable to load family page content.")).finally(() => setLoading(false)); }, [load]);

  const updateToggle = async (key, value) => {
    setBusy(key);
    try { const { data } = await axios.patch("/admin/family-page/content", { [key]: value }); setContent(data); toast.success("Display setting updated."); }
    catch (error) { toast.error(error.response?.data?.message || "The setting could not be updated."); }
    finally { setBusy(""); }
  };
  const upload = async (kind, file) => {
    if (!file) return;
    setBusy(kind);
    try { const body = new FormData(); body.append("image", file); const { data } = await axios.post(`/admin/family-page/${kind}`, body); setContent(data); toast.success(kind === "advert" ? "Advert uploaded." : "Slider image added."); }
    catch (error) { toast.error(error.response?.data?.message || "The image could not be uploaded."); }
    finally { setBusy(""); if (advertInput.current) advertInput.current.value = ""; if (slideInput.current) slideInput.current.value = ""; }
  };
  const remove = async (path, message) => {
    if (!window.confirm(message)) return;
    setBusy(path);
    try { const { data } = await axios.delete(`/admin/family-page/${path}`); setContent(data); toast.success("Image removed."); }
    catch (error) { toast.error(error.response?.data?.message || "The image could not be removed."); }
    finally { setBusy(""); }
  };

  return <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8"><div className="mx-auto max-w-6xl">
    <PageNavigation items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Family page" }]} title="Family page content" description="Control the advert popup and the image carousel shown below player profiles."/>
    {loading ? <div className="grid min-h-80 place-items-center rounded-3xl border bg-white"><span className="text-center text-sm font-semibold text-slate-500"><Loader2 className="mx-auto mb-3 animate-spin text-purple-600"/>Loading display settings...</span></div> : <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-purple-100 text-purple-700"><Megaphone/></span><div><h2 className="text-xl font-black text-slate-900">Advert popup</h2><p className="mt-1 text-sm text-slate-500">Shown as a responsive modal when families open the player page.</p></div></div><Toggle label={content.advert.enabled ? "Active" : "Inactive"} checked={content.advert.enabled} disabled={!content.advert.imageUrl || busy === "advertEnabled"} onChange={(value) => updateToggle("advertEnabled", value)}/></div>
        <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_280px] md:p-7"><div className="grid min-h-64 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40">{content.advert.imageUrl ? <img src={content.advert.imageUrl} alt="Current family advert" className="max-h-[420px] w-full object-contain"/> : <div className="p-8 text-center"><MonitorSmartphone className="mx-auto text-purple-400" size={40}/><p className="mt-3 font-bold text-slate-700">No advert uploaded</p><p className="mt-1 text-sm text-slate-500">Landscape or portrait images both resize safely.</p></div>}</div><div className="flex flex-col justify-center gap-3"><input ref={advertInput} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={(event) => upload("advert", event.target.files?.[0])}/><button type="button" disabled={Boolean(busy)} onClick={() => advertInput.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-black text-white hover:bg-purple-700 disabled:opacity-50">{busy === "advert" ? <Loader2 className="animate-spin" size={18}/> : <ImagePlus size={18}/>} {content.advert.imageUrl ? "Replace advert" : "Upload advert"}</button>{content.advert.imageUrl && <button type="button" disabled={Boolean(busy)} onClick={() => remove("advert", "Remove this advert? It will also be deactivated.")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={17}/>Remove advert</button>}<p className="text-xs leading-5 text-slate-400">JPEG, PNG, GIF or WebP, up to 10 MB. The image is contained rather than cropped on every screen.</p></div></div>
      </section>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"><div><h2 className="text-xl font-black text-slate-900">Player-page slider</h2><p className="mt-1 text-sm text-slate-500">Upload up to three images. They rotate continuously below the children.</p></div><Toggle label={content.slider.enabled ? "Active" : "Inactive"} checked={content.slider.enabled} disabled={!content.slider.images.length || busy === "sliderEnabled"} onChange={(value) => updateToggle("sliderEnabled", value)}/></div>
        <div className="p-5 sm:p-7"><div className="grid gap-4 sm:grid-cols-3">{content.slider.images.map((slide, index) => <article key={slide.id} className="group relative overflow-hidden rounded-2xl border bg-slate-100"><div className="aspect-[16/7]"><img src={slide.imageUrl} alt={`Slider item ${index + 1}`} className="h-full w-full object-cover"/></div><span className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-black text-white">{index + 1}</span><button type="button" title="Remove image" disabled={Boolean(busy)} onClick={() => remove(`slides/${slide.id}`, "Remove this slider image?")} className="absolute right-3 top-3 rounded-lg bg-white p-2 text-red-500 shadow transition hover:bg-red-50 disabled:opacity-50"><Trash2 size={16}/></button></article>)}{content.slider.images.length < 3 && <button type="button" disabled={Boolean(busy)} onClick={() => slideInput.current?.click()} className="grid aspect-[16/7] place-items-center rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 text-purple-700 hover:bg-purple-50 disabled:opacity-50"><span className="text-center text-sm font-black">{busy === "slides" ? <Loader2 className="mx-auto mb-2 animate-spin"/> : <ImagePlus className="mx-auto mb-2"/>}Add image</span></button>}</div><input ref={slideInput} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={(event) => upload("slides", event.target.files?.[0])}/><p className="mt-4 text-xs font-semibold text-slate-400">{content.slider.images.length}/3 images uploaded. Slides appear in upload order.</p></div>
      </section>
    </div>}
  </div></div>;
}
