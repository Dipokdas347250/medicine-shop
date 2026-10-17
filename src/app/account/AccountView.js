"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, FileText, Heart, LogOut, MapPin, Package, Plus, ShieldCheck, Trash2, User } from "lucide-react";
import { StatusBadge } from "@/components/OrderStatus";
import { PageSkeleton } from "@/components/ui";
import { actions, useHydrated, useStore } from "@/lib/store";
import { toast } from "@/lib/ui";
import { cn, EMAIL_RE, formatDate, formatPrice, PHONE_RE } from "@/lib/utils";

function AuthForms() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [mode, setMode] = useState("login");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (mode === "register") {
      if (form.name.trim().length < 2) err.name = "Enter your full name";
      if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, ""))) err.phone = "Enter a valid mobile number";
      if (form.password.length < 6) err.password = "Password must be at least 6 characters";
      if (form.password !== form.confirm) err.confirm = "Passwords do not match";
    }
    if (!EMAIL_RE.test(form.email)) err.email = "Enter a valid email address";
    if (mode === "login" && !form.password) err.password = "Enter your password";
    setErrors(err);
    if (Object.keys(err).length) return;

    const res = mode === "login" ? actions.login(form.email, form.password) : actions.register(form);
    if (res.error) return setErrors({ form: res.error });
    toast(mode === "login" ? `Welcome back, ${res.user.name.split(" ")[0]}!` : "Account created successfully!");
    if (next?.startsWith("/")) router.push(next);
  };

  const input = (k, label, props = {}) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      <input id={k} className={cn("input", errors[k] && "input-error")} value={form[k]} onChange={(e) => set(k, e.target.value)} {...props} />
      {errors[k] && <p className="mt-1 text-xs font-medium text-rose-600">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="container-x grid max-w-5xl items-center gap-10 py-12 lg:grid-cols-2">
      <div className="hidden lg:block">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Your health,
          <br />
          <span className="text-brand-600">one tap away.</span>
        </h1>
        <p className="mt-4 text-slate-500">Create an account to save addresses, track orders, reorder in one click and manage your prescriptions.</p>
        <ul className="mt-8 space-y-4">
          {[
            [Package, "Track all your orders in real time"],
            [MapPin, "Save multiple delivery addresses"],
            [Heart, "Keep a wishlist of your regular medicines"],
            [ShieldCheck, "Your health data stays private"],
          ].map(([Icon, t]) => (
            <li key={t} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950"><Icon size={18} /></span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-6 sm:p-8">
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {[["login", "Log in"], ["register", "Create account"]].map(([m, l]) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setErrors({});
              }}
              className={cn("cursor-pointer rounded-lg py-2 text-sm font-semibold transition", mode === m ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white" : "text-slate-500")}
            >
              {l}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {mode === "register" && input("name", "Full name", { autoComplete: "name" })}
          {input("email", "Email address", { type: "email", autoComplete: "email" })}
          {mode === "register" && input("phone", "Mobile number", { inputMode: "tel", placeholder: "01XXXXXXXXX", autoComplete: "tel" })}
          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <input id="password" type={show ? "text" : "password"} className={cn("input pr-10", errors.password && "input-error")} value={form.password} onChange={(e) => set("password", e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
              <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs font-medium text-rose-600">{errors.password}</p>}
          </div>
          {mode === "register" && input("confirm", "Confirm password", { type: show ? "text" : "password", autoComplete: "new-password" })}
          {errors.form && <p className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{errors.form}</p>}
          <button className="btn-primary w-full py-3">{mode === "login" ? "Log in" : "Create account"}</button>
          <p className="text-center text-xs text-slate-400">Demo accounts are stored only in this browser.</p>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ user }) {
  const orders = useStore((s) => s.orders);
  const wishCount = useStore((s) => s.wishlist.length);
  const prescriptions = useStore((s) => s.prescriptions);
  const [profile, setProfile] = useState({ name: user.name, phone: user.phone || "" });
  const [addr, setAddr] = useState(null);

  const saveProfile = (e) => {
    e.preventDefault();
    if (profile.name.trim().length < 2) return toast("Please enter your name", "error");
    if (profile.phone && !PHONE_RE.test(profile.phone.replace(/[\s-]/g, ""))) return toast("Please enter a valid mobile number", "error");
    actions.updateProfile({ name: profile.name.trim(), phone: profile.phone.trim() });
    toast("Profile updated");
  };

  const saveAddr = (e) => {
    e.preventDefault();
    if (addr.address.trim().length < 6) return toast("Please enter a full address", "error");
    actions.saveAddress({ address: addr.address.trim(), area: addr.area.trim(), city: addr.city.trim() || "Dhaka" });
    setAddr(null);
    toast("Address saved");
  };

  const spent = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);

  return (
    <div className="container-x py-8">
      <div className="card flex flex-col items-start justify-between gap-4 bg-gradient-to-br from-brand-600 to-emerald-500 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-extrabold backdrop-blur">{user.name.charAt(0).toUpperCase()}</span>
          <div>
            <p className="text-sm text-brand-50">Welcome back,</p>
            <h1 className="text-2xl font-extrabold">{user.name}</h1>
            <p className="text-sm text-brand-50/80">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            actions.logout();
            toast("You have been logged out", "info");
          }}
          className="btn border border-white/40 text-white hover:bg-white/10"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          [Package, "Orders", orders.length, "/orders"],
          [Heart, "Wishlist", wishCount, "/wishlist"],
          [FileText, "Prescriptions", prescriptions.length, "/upload-prescription"],
          [ShieldCheck, "Total spent", formatPrice(spent), "/orders"],
        ].map(([Icon, l, v, href]) => (
          <Link key={l} href={href} className="card flex items-center gap-4 p-5 transition hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950"><Icon size={22} /></span>
            <span>
              <span className="block text-xl font-extrabold text-slate-900 dark:text-white">{v}</span>
              <span className="block text-xs text-slate-500">{l}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white">Recent orders</h2>
              <Link href="/orders" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>
            </div>
            {orders.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No orders yet. <Link href="/shop" className="font-semibold text-brand-600">Start shopping</Link></p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.id}>
                    <Link href={`/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                      <span>
                        <span className="block text-sm font-semibold text-slate-900 dark:text-white">#{o.id}</span>
                        <span className="block text-xs text-slate-500">{formatDate(o.date)} · {o.items.length} items</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-sm font-bold">{formatPrice(o.total)}</span>
                        <StatusBadge status={o.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><MapPin size={18} className="text-brand-600" /> Saved addresses</h2>
              {!addr && (
                <button onClick={() => setAddr({ address: "", area: "", city: "Dhaka" })} className="btn-secondary py-1.5 text-xs">
                  <Plus size={14} /> Add address
                </button>
              )}
            </div>
            {addr && (
              <form onSubmit={saveAddr} className="mb-4 grid gap-3 rounded-xl bg-slate-50 p-4 animate-fade-in sm:grid-cols-3 dark:bg-slate-800/60">
                <input className="input sm:col-span-3" placeholder="House, road, block" value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} aria-label="Street address" />
                <input className="input" placeholder="Area" value={addr.area} onChange={(e) => setAddr({ ...addr, area: e.target.value })} aria-label="Area" />
                <input className="input" placeholder="City" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} aria-label="City" />
                <div className="flex gap-2">
                  <button className="btn-primary flex-1">Save</button>
                  <button type="button" onClick={() => setAddr(null)} className="btn-ghost">Cancel</button>
                </div>
              </form>
            )}
            {(user.addresses || []).length === 0 && !addr ? (
              <p className="py-4 text-center text-sm text-slate-500">No saved addresses yet. Addresses are saved automatically at checkout.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {(user.addresses || []).map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="text-sm">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{a.address}</p>
                      <p className="text-slate-500">{[a.area, a.city].filter(Boolean).join(", ")}</p>
                    </div>
                    <button aria-label="Remove address" onClick={() => actions.removeAddress(a.id)} className="cursor-pointer text-slate-400 hover:text-rose-500">
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <form onSubmit={saveProfile} className="card h-fit space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><User size={18} className="text-brand-600" /> Profile</h2>
          <div>
            <label className="label" htmlFor="pname">Full name</label>
            <input id="pname" className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="pemail">Email</label>
            <input id="pemail" className="input opacity-60" value={user.email} disabled />
          </div>
          <div>
            <label className="label" htmlFor="pphone">Mobile number</label>
            <input id="pphone" className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </div>
          <p className="text-xs text-slate-400">Member since {formatDate(user.joined)}</p>
          <button className="btn-primary w-full">Save changes</button>
        </form>
      </div>
    </div>
  );
}

export default function AccountView() {
  const hydrated = useHydrated();
  const user = useStore((s) => s.user);
  if (!hydrated) return <PageSkeleton />;
  return user ? <Dashboard key={user.email} user={user} /> : <AuthForms />;
}
