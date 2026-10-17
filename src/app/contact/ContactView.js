"use client";

import { useState } from "react";
import { ChevronDown, Clock, Loader2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/ui";
import { FAQS, SHOP } from "@/lib/data";
import { toast } from "@/lib/ui";
import { cn, EMAIL_RE } from "@/lib/utils";

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-3">
      {FAQS.map((f, i) => (
        <div key={f.q} className="card overflow-hidden">
          <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-slate-900 dark:text-white">
            {f.q}
            <ChevronDown size={18} className={cn("shrink-0 text-slate-400 transition", open === i && "rotate-180 text-brand-600")} />
          </button>
          <div className={cn("grid transition-all duration-300", open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
            <div className="overflow-hidden">
              <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ContactView() {
  const [form, setForm] = useState({ name: "", email: "", subject: "Order enquiry", message: "" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast("Please enter your name", "error");
    if (!EMAIL_RE.test(form.email)) return toast("Please enter a valid email", "error");
    if (form.message.trim().length < 10) return toast("Please write a message of at least 10 characters", "error");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setForm({ name: "", email: "", subject: "Order enquiry", message: "" });
      toast("Message sent! We'll get back to you within a few hours.");
    }, 900);
  };

  const cards = [
    [Phone, "Call us 24/7", SHOP.phone, `tel:${SHOP.phone.replace(/[^+\d]/g, "")}`],
    [MessageCircle, "WhatsApp", "Chat with a pharmacist", `https://wa.me/${SHOP.phone.replace(/\D/g, "")}`],
    [Mail, "Email", SHOP.email, `mailto:${SHOP.email}`],
    [MapPin, "Visit our store", SHOP.address, null],
  ];

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Help & contact" }]} />
      <div className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">How can we help?</h1>
        <p className="mt-2 text-slate-500">Our pharmacists and support team are available around the clock.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([Icon, t, v, href]) => {
          const inner = (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950"><Icon size={22} /></span>
              <p className="mt-4 font-semibold text-slate-900 dark:text-white">{t}</p>
              <p className="mt-1 text-sm text-slate-500">{v}</p>
            </>
          );
          return href ? (
            <a key={t} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="card p-5 transition hover:-translate-y-1 hover:shadow-lg">{inner}</a>
          ) : (
            <div key={t} className="card p-5">{inner}</div>
          );
        })}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="section-title mb-5">Frequently asked questions</h2>
          <Faq />
        </div>
        <div>
          <h2 className="section-title mb-5">Send us a message</h2>
          <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="c-name">Name</label>
                <input id="c-name" className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="c-email">Email</label>
                <input id="c-email" type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="c-subject">Subject</label>
              <select id="c-subject" className="input cursor-pointer" value={form.subject} onChange={(e) => set("subject", e.target.value)}>
                {["Order enquiry", "Prescription question", "Returns & refunds", "Product availability", "Other"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="c-msg">Message</label>
              <textarea id="c-msg" className="input min-h-32" value={form.message} onChange={(e) => set("message", e.target.value)} />
            </div>
            <button disabled={busy} className="btn-primary w-full py-3">
              {busy ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Send message"}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400"><Clock size={12} /> Average response time: under 2 hours</p>
          </form>
        </div>
      </div>
    </div>
  );
}
