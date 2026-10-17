"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { compressImage, cn } from "@/lib/utils";
import { toast } from "@/lib/ui";

export default function PrescriptionUploader({ images, onChange, max = 3, error }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const addFiles = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (list.length < files.length) toast("Only image files (JPG, PNG) are supported", "error");
    if (!list.length) return;
    const room = max - images.length;
    if (room <= 0) return toast(`You can upload up to ${max} images`, "error");
    setBusy(true);
    try {
      const out = [];
      for (const f of list.slice(0, room)) {
        if (f.size > 10 * 1024 * 1024) {
          toast(`${f.name} is larger than 10MB`, "error");
          continue;
        }
        out.push({ name: f.name, data: await compressImage(f) });
      }
      onChange([...images, ...out]);
    } catch {
      toast("Could not read that image. Please try another.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
          drag ? "border-brand-500 bg-brand-50 dark:bg-brand-950" : error ? "border-rose-300 bg-rose-50/50 dark:bg-rose-500/5" : "border-slate-300 hover:border-brand-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
        )}
      >
        {busy ? <Loader2 size={32} className="animate-spin text-brand-600" /> : <ImagePlus size={32} className="text-brand-600" />}
        <p className="mt-3 font-semibold text-slate-800 dark:text-slate-100">{busy ? "Processing…" : "Click or drag your prescription here"}</p>
        <p className="mt-1 text-xs text-slate-500">JPG or PNG, up to 10MB each · max {max} images</p>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      </div>
      {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div key={i} className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.data} alt={img.name} className="aspect-square w-full object-cover" />
              <button
                type="button"
                aria-label={`Remove ${img.name}`}
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-rose-600"
              >
                <X size={14} />
              </button>
              <p className="truncate bg-white px-2 py-1 text-[11px] text-slate-500 dark:bg-slate-900">{img.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
