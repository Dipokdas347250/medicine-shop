"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, Check, Copy, FileCheck2, PackageCheck, Quote, ShieldCheck, Truck, Zap } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import SearchBox from "@/components/SearchBox";
import CategoryIcon from "@/components/CategoryIcon";
import { Rating } from "@/components/ui";
import { publishedProducts, useHydrated, useStore } from "@/lib/store";
import { CATEGORIES, COUPONS, TESTIMONIALS } from "@/lib/data";
import { toast } from "@/lib/ui";
import { cn, discountPercent } from "@/lib/utils";

const TABS = [
  { id: "featured", label: "Featured", pick: (list) => list.filter((p) => p.featured) },
  { id: "best", label: "Best sellers", pick: (list) => [...list].sort((a, b) => b.reviews - a.reviews) },
  { id: "deals", label: "Top deals", pick: (list) => [...list].sort((a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp)) },
  { id: "new", label: "New arrivals", pick: (list) => list.slice().reverse() },
];

function Hero({ products }) {
  const showcase = ["p13", "p10", "p16", "p41"].map((id) => products.find((p) => p.id === id)).filter(Boolean);
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-500 text-white">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="container-x relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
        <div className="animate-pop">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <ShieldCheck size={14} /> Licensed pharmacy · Pharmacist verified
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Genuine medicines,
            <br />
            <span className="text-emerald-200">delivered</span> to your door.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-brand-50/90">
            Order prescription and over-the-counter medicines, vitamins and health devices online. Save up to 20% on every order.
          </p>
          <SearchBox className="mt-8 hidden max-w-xl md:block text-slate-800 [&_input]:h-14 [&_input]:bg-white [&_input]:shadow-xl dark:[&_input]:bg-slate-900" />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className="btn bg-white px-6 py-3 text-brand-700 shadow-lg hover:bg-brand-50">
              Shop now <ArrowRight size={16} />
            </Link>
            <Link href="/upload-prescription" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">
              <Camera size={16} /> Upload prescription
            </Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
            {[
              ["10k+", "Happy customers"],
              ["24h", "Dhaka delivery"],
              ["4.8★", "Average rating"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-2xl font-extrabold">{v}</dt>
                <dd className="text-xs text-brand-50/80">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative hidden lg:block">
          <div className="absolute inset-x-6 inset-y-10 rounded-[3rem] bg-white/10 backdrop-blur-sm" />
          <div className="relative mx-auto grid max-w-md grid-cols-2 gap-x-8 gap-y-6 pb-12">
            {showcase.map((p, i) => (
              <div key={p.id} className={cn(i % 2 === 1 && "translate-y-12")}>
                <Link
                  href={`/product/${p.slug}`}
                  className="block rounded-3xl bg-white p-3 shadow-2xl transition hover:scale-105 dark:bg-slate-900"
                  style={{ animation: `float 6s ease-in-out ${i * 1.3}s infinite` }}
                >
                  <ProductImage product={p} className="aspect-4/3 w-full" />
                  <p className="mt-2 truncate text-sm font-bold text-slate-900 dark:text-white">{p.name} <span className="font-normal text-slate-400">{p.strength}</span></p>
                  <p className="text-xs text-slate-500">{p.unit}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Categories({ products }) {
  return (
    <section className="container-x mt-14">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="section-title">Shop by category</h2>
          <p className="mt-1 text-sm text-slate-500">Find exactly what you need, fast.</p>
        </div>
        <Link href="/shop" className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:underline sm:flex dark:text-brand-400">
          View all <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {CATEGORIES.map((c) => {
          const count = products.filter((p) => p.category === c.id).length;
          return (
            <Link
              key={c.id}
              href={`/shop?category=${c.id}`}
              className="card group flex flex-col items-center p-4 text-center transition hover:-translate-y-1 hover:border-transparent hover:shadow-lg"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110" style={{ background: `${c.color}1a`, color: c.color }}>
                <CategoryIcon name={c.icon} size={26} />
              </span>
              <span className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{c.name}</span>
              <span className="text-xs text-slate-400">{count} items</span>
            </Link>
          );
        })}
        <Link href="/upload-prescription" className="group flex flex-col items-center justify-center rounded-2xl bg-brand-600 p-4 text-center text-white transition hover:-translate-y-1 hover:bg-brand-700 hover:shadow-lg">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 transition group-hover:scale-110">
            <FileCheck2 size={26} />
          </span>
          <span className="mt-3 text-sm font-semibold">Order with prescription</span>
          <span className="text-xs text-brand-100">Upload & relax</span>
        </Link>
      </div>
    </section>
  );
}

function Offers() {
  const [copied, setCopied] = useState(null);
  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard may be unavailable; still show the code as copied.
    }
    setCopied(code);
    toast(`Coupon ${code} copied — apply it at checkout`);
    setTimeout(() => setCopied(null), 2000);
  };
  const styles = ["from-rose-500 to-orange-400", "from-violet-600 to-indigo-500", "from-sky-500 to-cyan-400"];
  return (
    <section className="container-x mt-14 grid gap-4 md:grid-cols-3">
      {Object.entries(COUPONS).map(([code, c], i) => (
        <div key={code} className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-lg", styles[i])}>
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15" />
          <div className="absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/10" />
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">Limited offer</p>
          <p className="mt-2 text-2xl font-extrabold">{c.label}</p>
          <button onClick={() => copy(code)} className="relative mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-white/60 bg-white/10 px-4 py-2 font-mono text-sm font-bold tracking-wider backdrop-blur transition hover:bg-white/20">
            {code} {copied === code ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      ))}
    </section>
  );
}

function ProductTabs({ products }) {
  const [tab, setTab] = useState("featured");
  const list = TABS.find((t) => t.id === tab).pick(products).slice(0, 10);
  return (
    <section className="container-x mt-16">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title">Popular right now</h2>
          <p className="mt-1 text-sm text-slate-500">Trusted by thousands of families every month.</p>
        </div>
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition",
                tab === t.id ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div key={tab} className="grid grid-cols-2 gap-3 animate-fade-in sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/shop" className="btn-secondary px-6">
          Browse all medicines <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Camera, title: "Upload prescription", text: "Snap a photo of your prescription or search for your medicines." },
    { icon: BadgeCheck, title: "Pharmacist verifies", text: "Our registered pharmacist reviews your order and calls if needed." },
    { icon: PackageCheck, title: "Fast doorstep delivery", text: "Sealed, temperature-safe packaging delivered in hours." },
  ];
  return (
    <section className="container-x mt-20">
      <div className="overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white sm:p-12 dark:bg-slate-800">
        <div className="grid gap-10 lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-2">
            <span className="badge bg-brand-500/20 text-brand-300">How it works</span>
            <h2 className="mt-3 text-3xl font-bold">Ordering medicine has never been easier</h2>
            <p className="mt-3 text-slate-400">Have a prescription? Upload it and we&apos;ll prepare your order — no need to search item by item.</p>
            <Link href="/upload-prescription" className="btn-primary mt-6 px-6 py-3">
              Upload now <ArrowRight size={16} />
            </Link>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3 lg:col-span-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <span className="absolute right-4 top-3 text-4xl font-black text-white/10">0{i + 1}</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white">
                  <Icon size={22} />
                </span>
                <p className="mt-4 font-semibold">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function RecentlyViewed({ products }) {
  const hydrated = useHydrated();
  const recent = useStore((s) => s.recent);
  const list = recent.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 5);
  if (!hydrated || list.length === 0) return null;
  return (
    <section className="container-x mt-16">
      <h2 className="section-title mb-6">Recently viewed</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="container-x mt-20">
      <div className="text-center">
        <h2 className="section-title">Loved by our customers</h2>
        <p className="mt-1 text-sm text-slate-500">Real reviews from real people.</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="card p-6">
            <Quote size={28} className="text-brand-200 dark:text-brand-800" />
            <blockquote className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">“{t.text}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-200">{t.name.charAt(0)}</span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">{t.name}</span>
                <span className="block text-xs text-slate-500">{t.city}</span>
              </span>
              <Rating value={t.rating} size={12} />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Brands({ products }) {
  const brands = [...new Set(products.map((p) => p.brand))].slice(0, 12);
  return (
    <section className="container-x mt-20">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">Top brands we carry</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {brands.map((b) => (
          <Link key={b} href={`/shop?brand=${encodeURIComponent(b)}`} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            {b}
          </Link>
        ))}
      </div>
    </section>
  );
}

function ExpressBanner() {
  return (
    <section className="container-x mt-16">
      <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:flex-row sm:p-8 dark:border-amber-500/20 dark:bg-amber-500/10">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-amber-950">
            <Zap size={26} />
          </span>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">Need it urgently? Try Express Delivery</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Get your medicines within 2–4 hours inside Dhaka city.</p>
          </div>
        </div>
        <Link href="/shop" className="btn shrink-0 bg-slate-900 px-6 py-3 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
          <Truck size={16} /> Order now
        </Link>
      </div>
    </section>
  );
}

export default function HomeView() {
  const products = useStore(publishedProducts);
  return (
    <>
      <Hero products={products} />
      <Categories products={products} />
      <Offers />
      <ProductTabs products={products} />
      <ExpressBanner />
      <HowItWorks />
      <RecentlyViewed products={products} />
      <Testimonials />
      <Brands products={products} />
    </>
  );
}
