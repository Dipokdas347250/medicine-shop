"use client";

import { useState } from "react";
import { BadgeCheck, CheckCircle2, Clock, FileText, Loader2, PhoneCall, ShieldCheck } from "lucide-react";
import PrescriptionUploader from "@/components/PrescriptionUploader";
import { Breadcrumbs } from "@/components/ui";
import { actions, useHydrated, useStore } from "@/lib/store";
import { toast } from "@/lib/ui";
import { cn, formatDate, PHONE_RE } from "@/lib/utils";

function UploadForm({ user }) {
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", address: user?.addresses?.[0]?.address || "", note: "", images: [] });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (form.name.trim().length < 2) err.name = "Enter the patient's name";
    if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, ""))) err.phone = "Enter a valid mobile number";
    if (!form.images.length) err.images = "Please upload at least one prescription image";
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    setTimeout(() => {
      const entry = actions.submitPrescription({ name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim(), note: form.note.trim(), images: form.images });
      setBusy(false);
      setDone(entry);
      toast("Prescription uploaded successfully");
    }, 1000);
  };

  if (done) {
    return (
      <div className="card p-8 text-center animate-pop">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
          <CheckCircle2 size={34} />
        </span>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Prescription received!</h2>
        <p className="mt-2 text-slate-500">
          Reference <b className="text-slate-800 dark:text-slate-100">#{done.id}</b>. Our pharmacist will call you at <b>{done.phone}</b> within 30 minutes to confirm your medicines and price.
        </p>
        <button onClick={() => { setDone(null); setForm((f) => ({ ...f, note: "", images: [] })); }} className="btn-secondary mt-6">
          Upload another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8" noValidate>
      <PrescriptionUploader images={form.images} onChange={(imgs) => set("images", imgs)} error={errors.images} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="rx-name">Patient name *</label>
          <input id="rx-name" className={cn("input", errors.name && "input-error")} value={form.name} onChange={(e) => set("name", e.target.value)} />
          {errors.name && <p className="mt-1 text-xs font-medium text-rose-600">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="rx-phone">Mobile number *</label>
          <input id="rx-phone" className={cn("input", errors.phone && "input-error")} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" />
          {errors.phone && <p className="mt-1 text-xs font-medium text-rose-600">{errors.phone}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="rx-address">Delivery address</label>
          <input id="rx-address" className="input" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="House, road, area, city" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="rx-note">Notes for pharmacist</label>
          <textarea id="rx-note" className="input min-h-24" value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="e.g. Need 1 month supply, prefer a specific brand…" />
        </div>
      </div>
      <button disabled={busy} className="btn-primary w-full py-3 text-base">
        {busy ? <><Loader2 size={18} className="animate-spin" /> Uploading…</> : "Submit prescription"}
      </button>
    </form>
  );
}

export default function UploadView() {
  const hydrated = useHydrated();
  const user = useStore((s) => s.user);
  const history = useStore((s) => s.prescriptions);

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Upload prescription" }]} />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <span className="badge bg-brand-100 px-3 py-1 text-brand-700 dark:bg-brand-900 dark:text-brand-200">Order with prescription</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Upload your prescription, we&apos;ll do the rest</h1>
          <p className="mt-3 text-slate-500">No need to search for each medicine. Send us a clear photo and our registered pharmacist will prepare your order and call to confirm.</p>
          <ol className="mt-8 space-y-5">
            {[
              [FileText, "Upload a clear photo", "Make sure the doctor's details and medicine names are readable."],
              [PhoneCall, "Pharmacist calls you", "We confirm medicines, quantity and price within 30 minutes."],
              [BadgeCheck, "Receive your medicines", "Delivered to your door — pay on delivery."],
            ].map(([Icon, t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
                  <Icon size={20} />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-700 shadow dark:bg-slate-900">{i + 1}</span>
                </span>
                <span>
                  <span className="block font-semibold text-slate-900 dark:text-white">{t}</span>
                  <span className="block text-sm text-slate-500">{d}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-8 flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-xs text-slate-500 dark:bg-slate-900">
            <ShieldCheck size={16} className="shrink-0 text-brand-600" /> Your prescription is confidential and only seen by our licensed pharmacists.
          </p>
        </div>
        <div>
          {hydrated ? <UploadForm user={user} /> : <div className="skeleton h-96" />}
          {hydrated && history.length > 0 && (
            <div className="card mt-6 p-6">
              <h2 className="mb-3 font-bold text-slate-900 dark:text-white">Your uploads</h2>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]?.data} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">#{p.id} · {p.name}</p>
                      <p className="text-xs text-slate-500">{formatDate(p.date, true)}</p>
                    </div>
                    <span className={cn("badge px-2.5 py-1", p.status === "Pending review" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300")}>
                      {p.status === "Pending review" && <Clock size={11} />} {p.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
