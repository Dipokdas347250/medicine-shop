"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Banknote, Check, CheckCircle2, CreditCard, FileText, Loader2, Lock, MapPin, Package, ShoppingBag, Smartphone, Truck, Zap } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import PrescriptionUploader from "@/components/PrescriptionUploader";
import { CouponBox, TotalsRows } from "@/components/OrderSummary";
import { EmptyState, PageSkeleton, RxBadge } from "@/components/ui";
import { actions, computeTotals, useHydrated, useStore } from "@/lib/store";
import { toast } from "@/lib/ui";
import { SHOP } from "@/lib/data";
import { cn, EMAIL_RE, formatPrice, PHONE_RE } from "@/lib/utils";

const CITIES = ["Dhaka", "Chattogram", "Gazipur", "Narayanganj", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh", "Cumilla"];

const PAYMENTS = [
  { id: "cod", label: "Cash on delivery", desc: "Pay when you receive your order", icon: Banknote },
  { id: "card", label: "Credit / Debit card", desc: "Visa, Mastercard, Amex", icon: CreditCard },
  { id: "mobile", label: "Mobile banking", desc: "bKash, Nagad, Rocket", icon: Smartphone },
];

function Field({ label, error, children, className }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function Stepper({ steps, current, onJump }) {
  return (
    <ol className="flex items-center">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
            <button
              type="button"
              disabled={!done}
              onClick={() => onJump(i)}
              className={cn("flex items-center gap-2", done && "cursor-pointer")}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition",
                  done ? "bg-brand-600 text-white" : active ? "bg-brand-100 text-brand-700 ring-4 ring-brand-100/60 dark:bg-brand-900 dark:text-brand-200 dark:ring-brand-900/40" : "bg-slate-200 text-slate-500 dark:bg-slate-800"
                )}
              >
                {done ? <Check size={16} /> : i + 1}
              </span>
              <span className={cn("hidden text-sm font-semibold sm:block", active ? "text-slate-900 dark:text-white" : "text-slate-500")}>{s}</span>
            </button>
            {i < steps.length - 1 && <span className={cn("mx-2 h-0.5 flex-1 rounded sm:mx-4", done ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-800")} />}
          </li>
        );
      })}
    </ol>
  );
}

function Success({ order }) {
  return (
    <div className="container-x max-w-2xl py-12">
      <div className="card overflow-hidden text-center animate-pop">
        <div className="bg-gradient-to-br from-brand-600 to-emerald-500 px-6 py-10 text-white">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-brand-600 shadow-xl">
            <CheckCircle2 size={44} />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold">Order placed successfully!</h1>
          <p className="mt-2 text-brand-50">Thank you, {order.customer.name.split(" ")[0]}. We&apos;ve received your order.</p>
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 text-left text-sm sm:grid-cols-3 dark:bg-slate-800/60">
            <div>
              <p className="text-xs text-slate-500">Order ID</p>
              <p className="font-bold text-slate-900 dark:text-white">#{order.id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="font-bold text-slate-900 dark:text-white">{formatPrice(order.total)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Estimated delivery</p>
              <p className="font-bold text-slate-900 dark:text-white">{order.deliveryType === "express" ? "Within 4 hours" : order.customer.city === "Dhaka" ? "Within 24 hours" : "2–3 working days"}</p>
            </div>
          </div>
          {order.items.some((i) => i.rx) && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-left text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              <FileText size={18} className="shrink-0" /> Our pharmacist will verify your prescription and may call you at {order.customer.phone} before dispatch.
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/orders/${order.id}`} className="btn-primary flex-1 py-3">
              <Package size={18} /> Track order
            </Link>
            <Link href="/shop" className="btn-secondary flex-1 py-3">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutFlow({ user }) {
  const totalsBase = useStore((s) => s);
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [errors, setErrors] = useState({});
  const saved = user?.addresses || [];
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: saved[0]?.address || "",
    area: saved[0]?.area || "",
    city: saved[0]?.city || "Dhaka",
    deliveryType: "standard",
    note: "",
    saveAddress: true,
    payment: "cod",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvc: "",
    mobileProvider: "bKash",
    mobileNumber: "",
    prescription: [],
    agree: false,
  }));

  const totals = computeTotals(totalsBase, form.deliveryType);
  const steps = ["Delivery", ...(totals.needsRx ? ["Prescription"] : []), "Payment", "Review"];
  const stepName = steps[step];

  if (placed) return <Success order={placed} />;

  if (totals.lines.length === 0) {
    return (
      <div className="container-x py-12">
        <EmptyState icon={ShoppingBag} title="Nothing to checkout" text="Your cart is empty. Add some products first." action={<Link href="/shop" className="btn-primary">Browse medicines</Link>} />
      </div>
    );
  }

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (name) => {
    const e = {};
    if (name === "Delivery") {
      if (form.name.trim().length < 2) e.name = "Please enter your full name";
      if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a valid mobile number (e.g. 01712345678)";
      if (form.email && !EMAIL_RE.test(form.email)) e.email = "Enter a valid email address";
      if (form.address.trim().length < 6) e.address = "Please enter your full address";
      if (!form.city) e.city = "Select a city";
      if (form.deliveryType === "express" && form.city !== "Dhaka") e.deliveryType = "Express delivery is only available in Dhaka";
    }
    if (name === "Prescription" && form.prescription.length === 0) e.prescription = "Please upload a photo of your prescription";
    if (name === "Payment") {
      if (form.payment === "card") {
        const digits = form.cardNumber.replace(/\s/g, "");
        if (!/^\d{15,16}$/.test(digits)) e.cardNumber = "Enter a valid card number";
        if (form.cardName.trim().length < 2) e.cardName = "Enter the name on the card";
        const m = form.cardExpiry.match(/^(\d{2})\/(\d{2})$/);
        const now = new Date();
        if (!m || +m[1] < 1 || +m[1] > 12 || new Date(2000 + +m[2], +m[1]) <= now) e.cardExpiry = "Invalid or expired date";
        if (!/^\d{3,4}$/.test(form.cardCvc)) e.cardCvc = "Invalid CVC";
      }
      if (form.payment === "mobile" && !PHONE_RE.test(form.mobileNumber.replace(/[\s-]/g, ""))) e.mobileNumber = `Enter your ${form.mobileProvider} account number`;
    }
    if (name === "Review" && !form.agree) e.agree = "Please accept the terms to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(stepName)) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const place = () => {
    if (!validate("Review")) return;
    setPlacing(true);
    setTimeout(() => {
      const customer = { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), address: form.address.trim(), area: form.area.trim(), city: form.city };
      if (user && form.saveAddress) actions.saveAddress({ address: customer.address, area: customer.area, city: customer.city });
      const payment =
        form.payment === "card"
          ? { method: "Card", detail: `•••• ${form.cardNumber.replace(/\s/g, "").slice(-4)}`, paid: true }
          : form.payment === "mobile"
            ? { method: form.mobileProvider, detail: form.mobileNumber, paid: true }
            : { method: "Cash on delivery", detail: "", paid: false };
      const order = actions.placeOrder({
        customer,
        deliveryType: form.deliveryType,
        payment,
        prescription: totals.needsRx ? form.prescription : null,
        note: form.note.trim(),
      });
      setPlacing(false);
      if (order) {
        setPlaced(order);
        window.scrollTo({ top: 0 });
      } else {
        toast("Something went wrong. Please try again.", "error");
      }
    }, 1400);
  };

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Checkout</h1>
        <p className="hidden items-center gap-1.5 text-sm text-slate-500 sm:flex">
          <Lock size={14} /> Secure checkout
        </p>
      </div>
      <div className="card mb-6 p-4 sm:p-5">
        <Stepper steps={steps} current={step} onJump={setStep} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div key={stepName} className="card p-5 animate-fade-in sm:p-8">
          {stepName === "Delivery" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                  <MapPin size={20} className="text-brand-600" /> Delivery details
                </h2>
                {!user && (
                  <Link href="/account?next=/checkout" className="text-sm font-semibold text-brand-600 hover:underline">
                    Have an account? Log in
                  </Link>
                )}
              </div>
              {saved.length > 0 && (
                <div>
                  <p className="label">Saved addresses</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {saved.map((a) => {
                      const active = form.address === a.address && form.city === a.city;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, address: a.address, area: a.area, city: a.city }))}
                          className={cn("cursor-pointer rounded-xl border p-3 text-left text-sm transition", active ? "border-brand-500 bg-brand-50 dark:bg-brand-950" : "border-slate-200 hover:border-brand-300 dark:border-slate-700")}
                        >
                          <p className="font-medium text-slate-800 dark:text-slate-100">{a.address}</p>
                          <p className="text-xs text-slate-500">{[a.area, a.city].filter(Boolean).join(", ")}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name *" error={errors.name}>
                  <input className={cn("input", errors.name && "input-error")} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
                </Field>
                <Field label="Mobile number *" error={errors.phone}>
                  <input className={cn("input", errors.phone && "input-error")} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" />
                </Field>
                <Field label="Email (for order updates)" error={errors.email} className="sm:col-span-2">
                  <input className={cn("input", errors.email && "input-error")} value={form.email} onChange={(e) => set("email", e.target.value)} type="email" autoComplete="email" />
                </Field>
                <Field label="Street address *" error={errors.address} className="sm:col-span-2">
                  <input className={cn("input", errors.address && "input-error")} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="House, road, block" autoComplete="street-address" />
                </Field>
                <Field label="Area / Thana">
                  <input className="input" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Dhanmondi" />
                </Field>
                <Field label="City *" error={errors.city}>
                  <select className="input cursor-pointer" value={form.city} onChange={(e) => set("city", e.target.value)}>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div>
                <p className="label">Delivery option</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: "standard", icon: Truck, title: "Standard delivery", desc: form.city === "Dhaka" ? "Within 24 hours" : "2–3 working days", price: totals.subtotal >= SHOP.freeDeliveryOver || totals.coupon === "FREESHIP" ? "FREE" : formatPrice(SHOP.deliveryFee) },
                    { id: "express", icon: Zap, title: "Express delivery", desc: "2–4 hours · Dhaka only", price: `+${formatPrice(SHOP.expressFee)}` },
                  ].map((o) => (
                    <label key={o.id} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition", form.deliveryType === o.id ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20 dark:bg-brand-950" : "border-slate-200 hover:border-brand-300 dark:border-slate-700")}>
                      <input type="radio" name="delivery" checked={form.deliveryType === o.id} onChange={() => set("deliveryType", o.id)} className="accent-brand-600" />
                      <o.icon size={20} className="text-brand-600" />
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{o.title}</span>
                        <span className="block text-xs text-slate-500">{o.desc}</span>
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{o.price}</span>
                    </label>
                  ))}
                </div>
                {errors.deliveryType && <p className="mt-2 text-xs font-medium text-rose-600">{errors.deliveryType}</p>}
              </div>
              <Field label="Order note (optional)">
                <textarea className="input min-h-20" value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="Landmark, preferred delivery time, etc." />
              </Field>
              {user && (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={form.saveAddress} onChange={(e) => set("saveAddress", e.target.checked)} className="h-4 w-4 accent-brand-600" /> Save this address to my account
                </label>
              )}
            </div>
          )}

          {stepName === "Prescription" && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <FileText size={20} className="text-brand-600" /> Upload prescription
              </h2>
              <p className="text-sm text-slate-500">The following items require a valid prescription from a registered doctor:</p>
              <ul className="flex flex-wrap gap-2">
                {totals.lines.filter((l) => l.product.rx).map((l) => (
                  <li key={l.product.id} className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                    {l.product.name} {l.product.strength}
                  </li>
                ))}
              </ul>
              <PrescriptionUploader images={form.prescription} onChange={(imgs) => set("prescription", imgs)} error={errors.prescription} />
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                <p className="font-semibold text-slate-800 dark:text-slate-100">A valid prescription should include:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-slate-500">
                  <li>Doctor&apos;s name, registration number and signature</li>
                  <li>Patient&apos;s name and date</li>
                  <li>Medicine name, strength and dosage</li>
                </ul>
              </div>
            </div>
          )}

          {stepName === "Payment" && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <CreditCard size={20} className="text-brand-600" /> Payment method
              </h2>
              <div className="grid gap-3">
                {PAYMENTS.map((p) => (
                  <label key={p.id} className={cn("flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition", form.payment === p.id ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20 dark:bg-brand-950" : "border-slate-200 hover:border-brand-300 dark:border-slate-700")}>
                    <input type="radio" name="payment" checked={form.payment === p.id} onChange={() => set("payment", p.id)} className="accent-brand-600" />
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm dark:bg-slate-800">
                      <p.icon size={20} />
                    </span>
                    <span>
                      <span className="block font-semibold text-slate-800 dark:text-slate-100">{p.label}</span>
                      <span className="block text-xs text-slate-500">{p.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
              {form.payment === "card" && (
                <div className="grid gap-4 rounded-2xl border border-slate-200 p-5 animate-fade-in sm:grid-cols-2 dark:border-slate-700">
                  <Field label="Card number" error={errors.cardNumber} className="sm:col-span-2">
                    <input
                      className={cn("input font-mono tracking-wider", errors.cardNumber && "input-error")}
                      value={form.cardNumber}
                      inputMode="numeric"
                      placeholder="4242 4242 4242 4242"
                      autoComplete="cc-number"
                      onChange={(e) => set("cardNumber", e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "))}
                    />
                  </Field>
                  <Field label="Name on card" error={errors.cardName} className="sm:col-span-2">
                    <input className={cn("input", errors.cardName && "input-error")} value={form.cardName} onChange={(e) => set("cardName", e.target.value)} autoComplete="cc-name" />
                  </Field>
                  <Field label="Expiry (MM/YY)" error={errors.cardExpiry}>
                    <input
                      className={cn("input font-mono", errors.cardExpiry && "input-error")}
                      value={form.cardExpiry}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                        set("cardExpiry", d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                      }}
                    />
                  </Field>
                  <Field label="CVC" error={errors.cardCvc}>
                    <input className={cn("input font-mono", errors.cardCvc && "input-error")} value={form.cardCvc} placeholder="123" inputMode="numeric" autoComplete="cc-csc" onChange={(e) => set("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))} />
                  </Field>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400 sm:col-span-2">
                    <Lock size={12} /> Demo only — no real payment is processed.
                  </p>
                </div>
              )}
              {form.payment === "mobile" && (
                <div className="space-y-4 rounded-2xl border border-slate-200 p-5 animate-fade-in dark:border-slate-700">
                  <div className="grid grid-cols-3 gap-2">
                    {["bKash", "Nagad", "Rocket"].map((m) => (
                      <button key={m} type="button" onClick={() => set("mobileProvider", m)} className={cn("cursor-pointer rounded-xl border py-3 text-sm font-bold transition", form.mobileProvider === m ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300")}>
                        {m}
                      </button>
                    ))}
                  </div>
                  <Field label={`${form.mobileProvider} account number`} error={errors.mobileNumber}>
                    <input className={cn("input", errors.mobileNumber && "input-error")} value={form.mobileNumber} onChange={(e) => set("mobileNumber", e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" />
                  </Field>
                  <p className="text-xs text-slate-400">You&apos;ll receive a payment request on your phone after placing the order (simulated in this demo).</p>
                </div>
              )}
            </div>
          )}

          {stepName === "Review" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review your order</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
                  <div className="mb-2 flex justify-between">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">Deliver to</p>
                    <button onClick={() => setStep(0)} className="cursor-pointer text-xs font-semibold text-brand-600 hover:underline">Edit</button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200">{form.name}</p>
                  <p className="text-slate-500">{form.phone}</p>
                  <p className="text-slate-500">{[form.address, form.area, form.city].filter(Boolean).join(", ")}</p>
                  <p className="mt-2 text-xs font-medium text-brand-700 dark:text-brand-300">{form.deliveryType === "express" ? "⚡ Express delivery (2–4 hours)" : "Standard delivery"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
                  <div className="mb-2 flex justify-between">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">Payment</p>
                    <button onClick={() => setStep(steps.indexOf("Payment"))} className="cursor-pointer text-xs font-semibold text-brand-600 hover:underline">Edit</button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200">{PAYMENTS.find((p) => p.id === form.payment).label}</p>
                  {form.payment === "card" && <p className="text-slate-500">•••• {form.cardNumber.slice(-4)}</p>}
                  {form.payment === "mobile" && <p className="text-slate-500">{form.mobileProvider} · {form.mobileNumber}</p>}
                  {totals.needsRx && <p className="mt-2 text-xs font-medium text-emerald-600">✓ {form.prescription.length} prescription image(s) attached</p>}
                </div>
              </div>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
                {totals.lines.map(({ product, qty }) => (
                  <li key={product.id} className="flex items-center gap-3 p-3">
                    <ProductImage product={product} className="h-12 w-12 shrink-0" rounded="rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{product.name} {product.strength}</p>
                      <p className="text-xs text-slate-500">{qty} × {formatPrice(product.price)}</p>
                    </div>
                    <p className="text-sm font-bold">{formatPrice(product.price * qty)}</p>
                  </li>
                ))}
              </ul>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-600" />
                <span>I confirm the details are correct and agree to the terms of service. I understand prescription medicines are dispensed only after pharmacist verification.</span>
              </label>
              {errors.agree && <p className="-mt-4 text-xs font-medium text-rose-600">{errors.agree}</p>}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
            {step > 0 ? (
              <button onClick={() => setStep((s) => s - 1)} className="btn-ghost">
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <Link href="/cart" className="btn-ghost">
                <ArrowLeft size={16} /> Cart
              </Link>
            )}
            {stepName === "Review" ? (
              <button onClick={place} disabled={placing} className="btn-primary px-8 py-3 text-base">
                {placing ? <><Loader2 size={18} className="animate-spin" /> Placing order…</> : <>Place order · {formatPrice(totals.total)}</>}
              </button>
            ) : (
              <button onClick={next} className="btn-primary px-8 py-3">
                Continue <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        <aside>
          <div className="card sticky top-44 space-y-5 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Order summary</h2>
            <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {totals.lines.map(({ product, qty }) => (
                <li key={product.id} className="flex items-center gap-3">
                  <div className="relative">
                    <ProductImage product={product} className="h-14 w-14" rounded="rounded-lg" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px] font-bold text-white">{qty}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      <span className="truncate">{product.name} {product.strength}</span> {product.rx && <RxBadge />}
                    </p>
                    <p className="text-xs text-slate-500">{product.unit}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(product.price * qty)}</p>
                </li>
              ))}
            </ul>
            <CouponBox totals={totals} />
            <TotalsRows totals={totals} />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutView() {
  const hydrated = useHydrated();
  const user = useStore((s) => s.user);
  if (!hydrated) return <PageSkeleton />;
  return <CheckoutFlow user={user} />;
}
