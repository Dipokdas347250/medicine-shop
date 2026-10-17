"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, Clock, CreditCard, Mail, MapPin, Phone, RotateCcw, Send, Truck } from "lucide-react";
import { Logo } from "./Header";
import { CATEGORIES, SHOP } from "@/lib/data";
import { toast } from "@/lib/ui";
import { EMAIL_RE } from "@/lib/utils";

const YEAR = new Date().getFullYear();

const PERKS = [
  { icon: BadgeCheck, title: "100% Genuine", text: "Sourced from licensed manufacturers" },
  { icon: Truck, title: "Fast Delivery", text: "Within 24 hours in Dhaka" },
  { icon: RotateCcw, title: "Easy Returns", text: "7-day hassle-free returns" },
  { icon: CreditCard, title: "Secure Payment", text: "COD, cards & mobile banking" },
];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  if (pathname.startsWith("/admin")) return null;

  const subscribe = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return toast("Please enter a valid email address", "error");
    toast("Thanks for subscribing! Check your inbox for health tips & offers.");
    setEmail("");
  };

  return (
    <footer className="mt-16 print:hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="container-x grid grid-cols-2 gap-6 border-b border-slate-200 py-8 lg:grid-cols-4 dark:border-slate-800">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Icon size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
              <p className="text-xs text-slate-500">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="container-x grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {SHOP.tagline}. Genuine medicines and healthcare products delivered to your doorstep, checked by registered pharmacists.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" /> {SHOP.address}</li>
            <li className="flex gap-2"><Phone size={16} className="shrink-0 text-brand-600" /> {SHOP.phone}</li>
            <li className="flex gap-2"><Mail size={16} className="shrink-0 text-brand-600" /> {SHOP.email}</li>
            <li className="flex gap-2"><Clock size={16} className="shrink-0 text-brand-600" /> Open 24 hours, 7 days a week</li>
          </ul>
        </div>
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Shop</h3>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/shop?category=${c.id}`} className="text-slate-500 hover:text-brand-600 dark:text-slate-400">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Help</h3>
          <ul className="space-y-2 text-sm">
            {[
              ["/account", "My account"],
              ["/orders", "Track order"],
              ["/upload-prescription", "Upload prescription"],
              ["/wishlist", "Wishlist"],
              ["/contact", "FAQs & contact"],
              ["/admin", "Admin panel"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-slate-500 hover:text-brand-600 dark:text-slate-400">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Newsletter</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Get health tips, refill reminders and exclusive offers.</p>
          <form onSubmit={subscribe} className="mt-4 flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" aria-label="Email address" className="input" />
            <button className="btn-primary shrink-0" aria-label="Subscribe">
              <Send size={16} />
            </button>
          </form>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">We accept</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Cash on Delivery", "Visa", "Mastercard", "bKash", "Nagad", "Rocket"].map((m) => (
              <span key={m} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">{m}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 py-5 dark:border-slate-800">
        <div className="container-x flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
          <p>© {YEAR} {SHOP.name} Pharmacy. All rights reserved.</p>
          <p>Medicines marked Rx are dispensed only against a valid prescription.</p>
        </div>
      </div>
    </footer>
  );
}
