"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowLeft, ChevronDown, ClipboardList, DollarSign, Eye, EyeOff, FileText, LayoutDashboard, Lock, LogOut,
  Package, Pencil, Pill, Plus, RotateCcw, Search, ShoppingBag, Trash2,
} from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { StatusBadge } from "@/components/OrderStatus";
import { Logo } from "@/components/Header";
import { PageSkeleton, RxBadge } from "@/components/ui";
import { actions, ORDER_STATUSES, useHydrated, useStore } from "@/lib/store";
import { toast } from "@/lib/ui";
import { CATEGORIES } from "@/lib/data";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import ProductForm from "./ProductForm";

const LOW_STOCK = 20;

function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-700 to-slate-900 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!actions.adminLogin(pw)) setErr("Incorrect password");
        }}
        className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl animate-pop dark:bg-slate-900"
      >
        <Logo />
        <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Admin panel</h1>
        <p className="mt-1 text-sm text-slate-500">Manage medicines, orders and prescriptions.</p>
        <label className="label mt-6" htmlFor="admin-pw">Password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input id="admin-pw" type="password" autoFocus className={cn("input pl-9", err && "input-error")} value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} />
        </div>
        {err && <p className="mt-1 text-xs font-medium text-rose-600">{err}</p>}
        <button className="btn-primary mt-5 w-full py-3">Sign in</button>
        <p className="mt-4 rounded-lg bg-slate-100 p-2 text-center text-xs text-slate-500 dark:bg-slate-800">Demo password: <b className="font-mono">admin123</b></p>
        <Link href="/" className="mt-4 flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-brand-600">
          <ArrowLeft size={14} /> Back to store
        </Link>
      </form>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-950",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10",
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tones[tone])}><Icon size={20} /></span>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Dashboard({ go }) {
  const products = useStore((s) => s.products);
  const orders = useStore((s) => s.orders);
  const prescriptions = useStore((s) => s.prescriptions);
  const valid = orders.filter((o) => o.status !== "Cancelled");
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const low = products.filter((p) => p.stock < LOW_STOCK).sort((a, b) => a.stock - b.stock);
  const pendingRx = prescriptions.filter((p) => p.status === "Pending review").length;
  const active = orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status)).length;

  const sold = {};
  valid.forEach((o) => o.items.forEach((i) => {
    sold[i.id] = sold[i.id] || { ...i, qty: 0, revenue: 0 };
    sold[i.id].qty += i.qty;
    sold[i.id].revenue += i.qty * i.price;
  }));
  const top = Object.values(sold).sort((a, b) => b.qty - a.qty).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat icon={DollarSign} label="Revenue" value={formatPrice(revenue)} sub={`${valid.length} completed / active orders`} />
        <Stat icon={ShoppingBag} label="Active orders" value={active} sub={`${orders.length} total orders`} tone="violet" />
        <Stat icon={Pill} label="Published medicines" value={`${products.filter((p) => p.published).length}/${products.length}`} sub="visible in store" tone="brand" />
        <Stat icon={AlertTriangle} label="Low / out of stock" value={low.length} sub={`${pendingRx} prescriptions pending`} tone={low.length ? "rose" : "amber"} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent orders</h3>
            <button onClick={() => go("orders")} className="cursor-pointer text-sm font-semibold text-brand-600 hover:underline">View all</button>
          </div>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No orders yet. Place a test order from the store.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span>
                    <span className="block font-semibold text-slate-800 dark:text-slate-100">#{o.id} · {o.customer.name}</span>
                    <span className="block text-xs text-slate-500">{formatDate(o.date, true)}</span>
                  </span>
                  <span className="flex items-center gap-3"><b>{formatPrice(o.total)}</b><StatusBadge status={o.status} /></span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Stock alerts</h3>
            <button onClick={() => go("products")} className="cursor-pointer text-sm font-semibold text-brand-600 hover:underline">Manage</button>
          </div>
          {low.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">All medicines are well stocked.</p>
          ) : (
            <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {low.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <ProductImage product={p} className="h-10 w-10" rounded="rounded-lg" />
                  <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">{p.name} {p.strength}</span>
                  <span className={cn("badge px-2.5 py-1", p.stock === 0 ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300")}>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="card p-5">
        <h3 className="mb-3 font-bold text-slate-900 dark:text-white">Top selling medicines</h3>
        {top.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Sales data will appear once orders are placed.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr><th className="pb-2">Medicine</th><th className="pb-2 text-right">Units sold</th><th className="pb-2 text-right">Revenue</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {top.map((t) => (
                <tr key={t.id}>
                  <td className="py-2 font-medium text-slate-800 dark:text-slate-100">{t.name} {t.strength}</td>
                  <td className="py-2 text-right">{t.qty}</td>
                  <td className="py-2 text-right font-semibold">{formatPrice(t.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Products() {
  const products = useStore((s) => s.products);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState(null); // product | "new" | null

  const shown = products.filter((p) => {
    const hay = `${p.name} ${p.generic} ${p.brand}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (category && p.category !== category) return false;
    if (filter === "published") return p.published;
    if (filter === "draft") return !p.published;
    if (filter === "low") return p.stock < LOW_STOCK;
    if (filter === "rx") return p.rx;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-52 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search medicines…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search medicines" />
        </div>
        <select className="input w-auto cursor-pointer" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input w-auto cursor-pointer" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Status">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Unpublished</option>
          <option value="low">Low stock</option>
          <option value="rx">Prescription only</option>
        </select>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <Plus size={16} /> Add medicine
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Medicine</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Published</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {shown.map((p) => (
              <tr key={p.id} className={cn("transition hover:bg-slate-50 dark:hover:bg-slate-800/40", !p.published && "opacity-60")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductImage product={p} className="h-11 w-11 shrink-0" rounded="rounded-lg" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">{p.name} <span className="font-normal text-slate-400">{p.strength}</span> {p.rx && <RxBadge />}</p>
                      <p className="truncate text-xs text-slate-500">{p.generic} · {p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{CATEGORIES.find((c) => c.id === p.category)?.name}</td>
                <td className="px-4 py-3 text-right">
                  <p className="font-semibold">{formatPrice(p.price)}</p>
                  {p.mrp > p.price && <p className="text-xs text-slate-400 line-through">{formatPrice(p.mrp)}</p>}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    value={p.stock}
                    aria-label={`Stock for ${p.name}`}
                    onChange={(e) => actions.saveProduct({ ...p, stock: Math.max(0, parseInt(e.target.value || "0", 10)) })}
                    className={cn("input mx-auto w-20 px-2 py-1.5 text-center", p.stock === 0 ? "text-rose-600" : p.stock < LOW_STOCK && "text-amber-600")}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    role="switch"
                    aria-checked={p.published}
                    aria-label={`${p.published ? "Unpublish" : "Publish"} ${p.name}`}
                    onClick={() => {
                      actions.togglePublish(p.id);
                      toast(`${p.name} ${p.published ? "unpublished" : "published"}`, p.published ? "info" : "success");
                    }}
                    className={cn("relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition", p.published ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700")}
                  >
                    <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition", p.published ? "translate-x-5" : "translate-x-0.5")} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/product/${p.slug}`} target="_blank" aria-label="View in store" className="icon-btn h-8 w-8">
                      {p.published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </Link>
                    <button aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)} className="icon-btn h-8 w-8"><Pencil size={16} /></button>
                    <button
                      aria-label={`Delete ${p.name}`}
                      onClick={() => {
                        if (window.confirm(`Delete ${p.name}? This cannot be undone.`)) {
                          actions.deleteProduct(p.id);
                          toast(`${p.name} deleted`, "info");
                        }
                      }}
                      className="icon-btn h-8 w-8 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No medicines match your filters.</p>}
      </div>
      <p className="text-xs text-slate-400">Showing {shown.length} of {products.length} medicines</p>

      {editing && <ProductForm key={editing === "new" ? "new" : editing.id} product={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function Orders() {
  const orders = useStore((s) => s.orders);
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState(null);
  const shown = status === "All" ? orders : orders.filter((o) => o.status === status);

  return (
    <div className="space-y-4">
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {["All", ...ORDER_STATUSES, "Cancelled"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={cn("shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition", status === s ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300")}>
            {s} <span className="opacity-60">({s === "All" ? orders.length : orders.filter((o) => o.status === s).length})</span>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="card p-12 text-center text-sm text-slate-500">No orders here yet.</div>
      ) : (
        <div className="space-y-3">
          {shown.map((o) => (
            <div key={o.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 p-4">
                <button onClick={() => setOpen(open === o.id ? null : o.id)} className="flex flex-1 cursor-pointer items-center gap-3 text-left" aria-expanded={open === o.id}>
                  <ChevronDown size={18} className={cn("shrink-0 text-slate-400 transition", open === o.id && "rotate-180")} />
                  <span>
                    <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                      #{o.id} {o.prescription?.length > 0 && <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"><FileText size={10} /> Rx</span>}
                      {o.deliveryType === "express" && <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">Express</span>}
                    </span>
                    <span className="block text-xs text-slate-500">{o.customer.name} · {o.customer.phone} · {formatDate(o.date, true)}</span>
                  </span>
                </button>
                <span className="text-right text-sm">
                  <b className="block">{formatPrice(o.total)}</b>
                  <span className="text-xs text-slate-500">{o.payment.method}</span>
                </span>
                <select
                  value={o.status}
                  onChange={(e) => {
                    const s = e.target.value;
                    if (s === "Cancelled") actions.cancelOrder(o.id) || actions.setOrderStatus(o.id, s);
                    else actions.setOrderStatus(o.id, s);
                    toast(`Order #${o.id} marked as ${s}`);
                  }}
                  disabled={o.status === "Cancelled"}
                  aria-label="Order status"
                  className="input w-auto cursor-pointer py-2"
                >
                  {[...ORDER_STATUSES, "Cancelled"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {open === o.id && (
                <div className="grid gap-6 border-t border-slate-100 bg-slate-50/60 p-5 animate-fade-in md:grid-cols-3 dark:border-slate-800 dark:bg-slate-800/30">
                  <div className="md:col-span-2">
                    <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Items</p>
                    <ul className="space-y-2">
                      {o.items.map((i) => (
                        <li key={i.id} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">{i.name} {i.strength} {i.rx && <RxBadge />} <span className="text-slate-400">× {i.qty}</span></span>
                          <b>{formatPrice(i.qty * i.price)}</b>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm dark:border-slate-700">
                      <p className="flex justify-between"><span className="text-slate-500">Delivery</span><span>{o.delivery ? formatPrice(o.delivery) : "FREE"}</span></p>
                      {o.discount > 0 && <p className="flex justify-between text-emerald-600"><span>Coupon {o.coupon}</span><span>-{formatPrice(o.discount)}</span></p>}
                    </div>
                    {o.prescription?.length > 0 && (
                      <div className="mt-4 flex gap-2">
                        {o.prescription.map((p, idx) => (
                          <a key={idx} href={p.data} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.data} alt={p.name} className="h-20 w-20 rounded-lg border border-slate-200 object-cover dark:border-slate-700" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Ship to</p>
                    <p className="font-medium">{o.customer.name}</p>
                    <p className="text-slate-500">{[o.customer.address, o.customer.area, o.customer.city].filter(Boolean).join(", ")}</p>
                    <p className="text-slate-500">{o.customer.phone}</p>
                    {o.customer.email && <p className="text-slate-500">{o.customer.email}</p>}
                    {o.note && <p className="mt-2 rounded-lg bg-white p-2 text-xs text-slate-500 dark:bg-slate-900">Note: {o.note}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Prescriptions() {
  const list = useStore((s) => s.prescriptions);
  if (list.length === 0) return <div className="card p-12 text-center text-sm text-slate-500">No prescriptions uploaded yet.</div>;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {list.map((p) => (
        <div key={p.id} className="card overflow-hidden">
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 dark:bg-slate-800">
            {p.images.map((img, i) => (
              <a key={i} href={img.data} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.data} alt={img.name} className="aspect-square w-full rounded object-cover" />
              </a>
            ))}
          </div>
          <div className="space-y-2 p-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 dark:text-white">#{p.id}</p>
              <span className="text-xs text-slate-400">{formatDate(p.date, true)}</span>
            </div>
            <p><span className="text-slate-500">Patient:</span> {p.name}</p>
            <p><span className="text-slate-500">Phone:</span> <a className="text-brand-600" href={`tel:${p.phone}`}>{p.phone}</a></p>
            {p.address && <p><span className="text-slate-500">Address:</span> {p.address}</p>}
            {p.note && <p className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{p.note}</p>}
            <div className="grid grid-cols-3 gap-1 pt-2">
              {["Pending review", "Approved", "Rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => actions.setPrescriptionStatus(p.id, s)}
                  className={cn(
                    "cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition",
                    p.status === s
                      ? s === "Approved" ? "bg-emerald-600 text-white" : s === "Rejected" ? "bg-rose-600 text-white" : "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {s === "Pending review" ? "Pending" : s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Medicines", icon: Package },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "prescriptions", label: "Prescriptions", icon: FileText },
];

export default function AdminView() {
  const hydrated = useHydrated();
  const authed = useStore((s) => s.adminAuthed);
  const pendingOrders = useStore((s) => s.orders.filter((o) => o.status === "Placed").length);
  const pendingRx = useStore((s) => s.prescriptions.filter((p) => p.status === "Pending review").length);
  const [tab, setTab] = useState("dashboard");

  if (!hydrated) return <PageSkeleton />;
  if (!authed) return <AdminLogin />;

  const counts = { orders: pendingOrders, prescriptions: pendingRx };
  const current = TABS.find((t) => t.id === tab);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between p-4 lg:p-5">
          <Logo />
          <span className="badge bg-slate-900 text-white dark:bg-white dark:text-slate-900">Admin</span>
        </div>
        <nav className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                tab === t.id ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <t.icon size={18} /> {t.label}
              {counts[t.id] > 0 && <span className="ml-auto badge bg-rose-500 text-white">{counts[t.id]}</span>}
            </button>
          ))}
        </nav>
        <div className="hidden space-y-1 border-t border-slate-100 p-3 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block dark:border-slate-800">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
            <ArrowLeft size={18} /> View store
          </Link>
          <button
            onClick={() => {
              if (window.confirm("Reset all demo data? Products, orders, users and prescriptions will be restored to defaults.")) {
                actions.resetDemo();
                toast("Demo data has been reset", "info");
              }
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw size={18} /> Reset demo data
          </button>
          <button onClick={actions.adminLogout} className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{current.label}</h1>
            <p className="text-sm text-slate-500">
              {tab === "products" ? "Add, edit, publish or unpublish medicines. Only published medicines appear in the store." : tab === "orders" ? "Update order status as you process deliveries." : tab === "prescriptions" ? "Review prescriptions uploaded by customers." : "Overview of your pharmacy."}
            </p>
          </div>
          <div className="flex gap-2 lg:hidden">
            <Link href="/" className="icon-btn" aria-label="View store"><ArrowLeft size={18} /></Link>
            <button onClick={actions.adminLogout} className="icon-btn text-rose-600" aria-label="Sign out"><LogOut size={18} /></button>
          </div>
        </div>
        <div key={tab} className="animate-fade-in">
          {tab === "dashboard" && <Dashboard go={setTab} />}
          {tab === "products" && <Products />}
          {tab === "orders" && <Orders />}
          {tab === "prescriptions" && <Prescriptions />}
        </div>
      </main>
    </div>
  );
}
