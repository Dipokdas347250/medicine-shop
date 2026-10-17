"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, X } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { Modal } from "@/components/ui";
import { actions } from "@/lib/store";
import { toast } from "@/lib/ui";
import { CATEGORIES, FORMS } from "@/lib/data";
import { cn, compressImage } from "@/lib/utils";

const EMPTY = {
  name: "", generic: "", strength: "", brand: "", category: CATEGORIES[0].id, form: "tablet", unit: "Strip of 10 tablets",
  price: "", mrp: "", stock: "", rx: false, featured: false, published: true, color: "#0d9488", image: null,
  description: "", uses: "", dosage: "", sideEffects: "", storage: "Store below 30°C in a dry place, away from direct sunlight. Keep out of reach of children.",
  rating: 0, reviews: 0,
};

export default function ProductForm({ product, onClose }) {
  const fileRef = useRef(null);
  const [f, setF] = useState(() =>
    product ? { ...product, uses: product.uses.join(", "), sideEffects: product.sideEffects.join(", ") } : EMPTY
  );
  const [errors, setErrors] = useState({});
  const set = (k, v) => {
    setF((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const pickImage = async (file) => {
    if (!file?.type.startsWith("image/")) return toast("Please choose an image file", "error");
    try {
      set("image", await compressImage(file, 600, 0.8));
    } catch {
      toast("Could not read that image", "error");
    }
  };

  const save = (e) => {
    e.preventDefault();
    const err = {};
    if (!f.name.trim()) err.name = "Required";
    if (!f.generic.trim()) err.generic = "Required";
    if (!f.brand.trim()) err.brand = "Required";
    if (!(Number(f.price) > 0)) err.price = "Enter a price";
    if (f.mrp !== "" && Number(f.mrp) < Number(f.price)) err.mrp = "MRP must be ≥ price";
    if (f.stock === "" || Number(f.stock) < 0) err.stock = "Enter stock";
    if (!f.unit.trim()) err.unit = "Required";
    setErrors(err);
    if (Object.keys(err).length) return toast("Please fix the highlighted fields", "error");

    const saved = actions.saveProduct({
      ...f,
      id: product?.id || `p${Date.now()}`,
      name: f.name.trim(),
      generic: f.generic.trim(),
      strength: f.strength.trim(),
      brand: f.brand.trim(),
      unit: f.unit.trim(),
      price: Number(f.price),
      mrp: f.mrp === "" ? Number(f.price) : Number(f.mrp),
      stock: Math.floor(Number(f.stock)),
      uses: f.uses.split(",").map((s) => s.trim()).filter(Boolean),
      sideEffects: f.sideEffects.split(",").map((s) => s.trim()).filter(Boolean),
      description: f.description.trim() || `${f.name.trim()} (${f.generic.trim()}) by ${f.brand.trim()}.`,
      dosage: f.dosage.trim() || "As directed by your physician.",
      rating: product?.rating ?? 0,
      reviews: product?.reviews ?? 0,
    });
    toast(product ? `${saved.name} updated` : `${saved.name} added${saved.published ? " and published" : " as draft"}`);
    onClose();
  };

  const field = (k, label, props = {}) => (
    <div className={props.wrap}>
      <label className="label" htmlFor={`f-${k}`}>{label}</label>
      <input id={`f-${k}`} className={cn("input", errors[k] && "input-error")} value={f[k]} onChange={(e) => set(k, e.target.value)} {...props.input} />
      {errors[k] && <p className="mt-1 text-xs text-rose-600">{errors[k]}</p>}
    </div>
  );

  const toggle = (k, label, desc) => (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <span>
        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
        <span className="block text-xs text-slate-500">{desc}</span>
      </span>
      <input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} className="h-5 w-5 accent-brand-600" />
    </label>
  );

  return (
    <Modal open onClose={onClose} className="max-w-4xl" label={product ? "Edit medicine" : "Add medicine"}>
      <form onSubmit={save} noValidate>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{product ? `Edit ${product.name}` : "Add new medicine"}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr]">
          <div className="space-y-3">
            <ProductImage product={{ ...f, name: f.name || "Medicine" }} className="aspect-square w-full border border-slate-200 dark:border-slate-700" />
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { pickImage(e.target.files[0]); e.target.value = ""; }} />
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary w-full py-2 text-xs"><ImagePlus size={14} /> Upload photo</button>
            {f.image && <button type="button" onClick={() => set("image", null)} className="btn-ghost w-full py-2 text-xs text-rose-600"><Trash2 size={14} /> Remove photo</button>}
            {!f.image && (
              <div>
                <label className="label text-xs" htmlFor="f-color">Illustration colour</label>
                <input id="f-color" type="color" value={f.color} onChange={(e) => set("color", e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {field("name", "Brand name *", { wrap: "sm:col-span-2", input: { placeholder: "e.g. Napa" } })}
              {field("strength", "Strength", { input: { placeholder: "500mg" } })}
              {field("generic", "Generic / composition *", { wrap: "sm:col-span-2", input: { placeholder: "Paracetamol" } })}
              {field("brand", "Manufacturer *", { input: { placeholder: "Beximco Pharma" } })}
              <div>
                <label className="label" htmlFor="f-category">Category</label>
                <select id="f-category" className="input cursor-pointer" value={f.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="f-form">Form</label>
                <select id="f-form" className="input cursor-pointer capitalize" value={f.form} onChange={(e) => set("form", e.target.value)}>
                  {FORMS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              {field("unit", "Pack size *", { input: { placeholder: "Strip of 10 tablets" } })}
              {field("price", "Selling price (৳) *", { input: { type: "number", min: 0, step: "any" } })}
              {field("mrp", "MRP (৳)", { input: { type: "number", min: 0, step: "any", placeholder: "Same as price" } })}
              {field("stock", "Stock quantity *", { input: { type: "number", min: 0 } })}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {toggle("published", "Published", "Visible & purchasable")}
              {toggle("rx", "Prescription", "Requires Rx upload")}
              {toggle("featured", "Featured", "Show on home page")}
            </div>
            <div>
              <label className="label" htmlFor="f-description">Description</label>
              <textarea id="f-description" className="input min-h-20" value={f.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("uses", "Uses (comma separated)", { input: { placeholder: "Fever, Headache" } })}
              {field("sideEffects", "Side effects (comma separated)", { input: { placeholder: "Nausea, Dizziness" } })}
              {field("dosage", "Dosage", { wrap: "sm:col-span-2" })}
              {field("storage", "Storage", { wrap: "sm:col-span-2" })}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button className="btn-primary px-6">{product ? "Save changes" : "Add medicine"}</button>
        </div>
      </form>
    </Modal>
  );
}
