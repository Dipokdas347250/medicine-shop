"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, BadgeCheck, CheckCircle2, Clock, FileText, PackageX, Share2, ShieldCheck, ShoppingCart, Truck, XCircle, Zap } from "lucide-react";
import ProductCard, { WishlistButton } from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import { Breadcrumbs, EmptyState, PageSkeleton, QuantityPicker, Rating, RxBadge, StarInput } from "@/components/ui";
import { actions, getProductRating, publishedProducts, useHydrated, useStore } from "@/lib/store";
import { toast, uiActions } from "@/lib/ui";
import { CATEGORIES } from "@/lib/data";
import { cn, discountPercent, formatDate, formatPrice } from "@/lib/utils";

function ZoomImage({ product }) {
  const [zoom, setZoom] = useState(null);
  return (
    <div
      className="card relative cursor-zoom-in overflow-hidden p-4"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onMouseLeave={() => setZoom(null)}
    >
      <div className="transition-transform duration-200" style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
        <ProductImage product={product} className="aspect-square w-full" />
      </div>
    </div>
  );
}

function Reviews({ product }) {
  const user = useStore((s) => s.user);
  const reviews = useStore((s) => s.reviews[product.id]) || [];
  const { rating, count } = getProductRating(product, reviews);
  const [form, setForm] = useState({ name: "", rating: 0, comment: "" });
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const name = form.name.trim() || user?.name || "";
    if (!name) return setError("Please enter your name.");
    if (!form.rating) return setError("Please select a star rating.");
    if (form.comment.trim().length < 5) return setError("Please write a short comment (at least 5 characters).");
    actions.addReview(product.id, { name, rating: form.rating, comment: form.comment.trim() });
    setForm({ name: "", rating: 0, comment: "" });
    setError("");
    toast("Thank you! Your review has been posted.");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div>
        <div className="card p-6 text-center">
          <p className="text-5xl font-extrabold text-slate-900 dark:text-white">{rating.toFixed(1)}</p>
          <Rating value={rating} size={18} className="mt-2 justify-center" />
          <p className="mt-1 text-sm text-slate-500">Based on {count} reviews</p>
        </div>
        <form onSubmit={submit} className="card mt-4 space-y-3 p-5">
          <p className="font-semibold text-slate-900 dark:text-white">Write a review</p>
          <StarInput value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
          {!user && <input className="input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Your name" />}
          <textarea className="input min-h-24" placeholder="How did this product work for you?" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} aria-label="Review" />
          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
          <button className="btn-primary w-full">Submit review</button>
        </form>
      </div>
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-500">No written reviews yet. Be the first to share your experience!</div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="card p-5 animate-pop">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-200">{r.name.charAt(0).toUpperCase()}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.name}</p>
                    <p className="text-xs text-slate-400">{formatDate(r.date)}</p>
                  </div>
                </div>
                <Rating value={r.rating} size={13} />
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{r.comment}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600"><BadgeCheck size={13} /> Verified buyer</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Details({ product }) {
  const reviewsCount = useStore((s) => s.reviews[product.id]?.length || 0);
  const [tab, setTab] = useState("overview");
  const tabs = [
    ["overview", "Overview"],
    ["dosage", "Dosage & usage"],
    ["safety", "Side effects"],
    ["reviews", `Reviews (${product.reviews + reviewsCount})`],
  ];
  return (
    <section id="details" className="mt-12 scroll-mt-40">
      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800" role="tablist">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "-mb-px shrink-0 cursor-pointer border-b-2 px-4 py-3 text-sm font-semibold transition",
              tab === id ? "border-brand-600 text-brand-700 dark:text-brand-300" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div key={tab} className="py-6 animate-fade-in">
        {tab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 dark:text-white">About {product.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{product.description}</p>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Generic", product.generic],
                  ["Strength", product.strength || "—"],
                  ["Manufacturer", product.brand],
                  ["Pack size", product.unit],
                  ["Form", product.form.charAt(0).toUpperCase() + product.form.slice(1)],
                  ["Prescription", product.rx ? "Required" : "Not required"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-slate-400">{k}</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-200">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 dark:text-white">Uses</h3>
              <ul className="mt-3 space-y-2">
                {product.uses.map((u) => (
                  <li key={u} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={16} className="shrink-0 text-brand-600" /> {u}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {tab === "dosage" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 dark:text-white">Recommended dosage</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{product.dosage}</p>
              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                Always follow your doctor&apos;s advice. Dosage may differ based on age, weight and medical condition.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 dark:text-white">Storage</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{product.storage}</p>
            </div>
          </div>
        )}
        {tab === "safety" && (
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <AlertTriangle size={18} className="text-amber-500" /> Possible side effects
            </h3>
            {product.sideEffects.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.sideEffects.map((s) => (
                  <li key={s} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{s}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No common side effects reported.</p>
            )}
            <p className="mt-5 text-sm text-slate-500">Stop use and consult a doctor if you experience any severe or allergic reaction.</p>
          </div>
        )}
        {tab === "reviews" && <Reviews product={product} />}
      </div>
    </section>
  );
}

export default function ProductView() {
  const { slug } = useParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const product = useStore((s) => s.products.find((p) => p.slug === slug));
  const all = useStore(publishedProducts);
  const inCart = useStore((s) => s.cart.find((l) => l.id === product?.id)?.qty || 0);
  const reviews = useStore((s) => (product ? s.reviews[product.id] : undefined));
  const [qty, setQty] = useState(1);

  const productId = product?.id;
  useEffect(() => {
    if (productId && hydrated) actions.addRecent(productId);
  }, [productId, hydrated]);

  if (!product) {
    if (!hydrated) return <PageSkeleton />;
    return (
      <div className="container-x py-16">
        <EmptyState icon={PackageX} title="Product not found" text="The medicine you're looking for doesn't exist or has been removed." action={<Link href="/shop" className="btn-primary">Browse medicines</Link>} />
      </div>
    );
  }
  if (!product.published) {
    return (
      <div className="container-x py-16">
        <EmptyState icon={PackageX} title="Currently unavailable" text={`${product.name} is not available for purchase right now. Please check back later or explore alternatives.`} action={<Link href={`/shop?q=${encodeURIComponent(product.generic)}`} className="btn-primary">Find alternatives</Link>} />
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === product.category);
  const { rating, count } = getProductRating(product, reviews);
  const off = discountPercent(product.price, product.mrp);
  const out = product.stock <= 0;
  const maxQty = Math.max(1, product.stock - inCart);
  const alternatives = all.filter((p) => p.id !== product.id && p.generic.toLowerCase() === product.generic.toLowerCase());
  const related = all.filter((p) => p.id !== product.id && p.category === product.category && !alternatives.includes(p)).slice(0, 5);

  const addToCart = () => {
    if (actions.addToCart(product.id, qty)) {
      toast(`${qty} × ${product.name} added to cart`, "success", { label: "View cart", onClick: uiActions.openCart });
      setQty(1);
    }
  };
  const buyNow = () => {
    if (inCart === 0) actions.addToCart(product.id, qty);
    router.push("/checkout");
  };
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied to clipboard", "info");
      }
    } catch {
      // Share dialog dismissed.
    }
  };

  return (
    <div className="container-x py-8 pb-28 lg:pb-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category?.name || "Shop", href: `/shop?category=${product.category}` }, { label: product.name }]} />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative">
          <ZoomImage product={product} />
          <div className="absolute left-4 top-4 flex gap-2">
            {off > 0 && <span className="badge bg-rose-500 px-3 py-1 text-xs text-white">-{off}% OFF</span>}
            {product.rx && <RxBadge className="px-3 py-1 text-xs" />}
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href={`/shop?brand=${encodeURIComponent(product.brand)}`} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
                {product.brand}
              </Link>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {product.name} <span className="text-2xl font-semibold text-slate-400">{product.strength}</span>
              </h1>
              <p className="mt-1 text-slate-500">{product.generic}</p>
            </div>
            <div className="flex gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700">
                <WishlistButton product={product} size={20} />
              </span>
              <button aria-label="Share" onClick={share} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-brand-600 dark:border-slate-700">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <a href="#details" className="mt-3 inline-flex items-center gap-2">
            <Rating value={rating} size={16} />
            <span className="text-sm text-slate-500 hover:underline">{rating.toFixed(1)} · {count} reviews</span>
          </a>

          <div className="mt-6 rounded-2xl bg-slate-100/70 p-5 dark:bg-slate-900">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
              {off > 0 && (
                <>
                  <span className="text-lg text-slate-400 line-through">MRP {formatPrice(product.mrp)}</span>
                  <span className="badge bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Save {formatPrice(product.mrp - product.price)}</span>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">Price per {product.unit.toLowerCase()} · inclusive of all taxes</p>
            <p className={cn("mt-3 flex items-center gap-1.5 text-sm font-semibold", out ? "text-rose-600" : product.stock < 20 ? "text-amber-600" : "text-emerald-600")}>
              {out ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
              {out ? "Out of stock" : product.stock < 20 ? `Hurry! Only ${product.stock} left in stock` : "In stock — ready to ship"}
            </p>
          </div>

          {product.rx && (
            <div className="mt-4 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
              <FileText size={20} className="shrink-0 text-rose-600" />
              <div className="text-sm">
                <p className="font-semibold text-rose-800 dark:text-rose-300">Prescription required</p>
                <p className="text-rose-700/80 dark:text-rose-300/80">You&apos;ll need to upload a valid prescription at checkout. Our pharmacist will verify it before dispatch.</p>
              </div>
            </div>
          )}

          <div className="mt-6 hidden flex-wrap items-center gap-3 lg:flex">
            <QuantityPicker value={Math.min(qty, maxQty)} max={maxQty} onChange={(n) => setQty(Math.max(1, n))} />
            <button onClick={addToCart} disabled={out || inCart >= product.stock} className="btn-primary flex-1 py-3">
              <ShoppingCart size={18} /> {inCart >= product.stock && !out ? "Max quantity in cart" : "Add to cart"}
            </button>
            <button onClick={buyNow} disabled={out} className="btn flex-1 bg-slate-900 py-3 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              <Zap size={18} /> Buy now
            </button>
          </div>
          {inCart > 0 && (
            <p className="mt-3 text-sm text-slate-500">
              <b className="text-slate-700 dark:text-slate-200">{inCart}</b> already in your cart ·{" "}
              <button onClick={uiActions.openCart} className="cursor-pointer font-semibold text-brand-600 hover:underline">View cart</button>
            </p>
          )}

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              [Truck, "Free delivery", "On orders over ৳1,000"],
              [Clock, "Express 2–4h", "Available in Dhaka"],
              [ShieldCheck, "100% genuine", "Pharmacist checked"],
            ].map(([Icon, t, s]) => (
              <li key={t} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <Icon size={20} className="shrink-0 text-brand-600" />
                <span>
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{t}</span>
                  <span className="block text-xs text-slate-500">{s}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {alternatives.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Same composition, other brands</h2>
          <p className="text-sm text-slate-500">Alternatives containing {product.generic}. Consult your doctor before switching.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {alternatives.map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="card flex items-center gap-4 p-3 transition hover:border-brand-300">
                <ProductImage product={p} className="h-16 w-16 shrink-0" rounded="rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">{p.name} {p.strength}</p>
                  <p className="truncate text-xs text-slate-500">{p.brand} · {p.unit}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">{formatPrice(p.price)}</p>
                  {p.price < product.price && <p className="text-xs font-semibold text-emerald-600">Save {formatPrice(product.price - p.price)}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Details product={product} />

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">You may also need</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Mobile sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center gap-2">
          <QuantityPicker size="sm" value={Math.min(qty, maxQty)} max={maxQty} onChange={(n) => setQty(Math.max(1, n))} />
          <button onClick={addToCart} disabled={out || inCart >= product.stock} className="btn-primary flex-1 px-2">
            <ShoppingCart size={16} /> Add
          </button>
          <button onClick={buyNow} disabled={out} className="btn flex-1 bg-slate-900 px-2 text-white dark:bg-white dark:text-slate-900">
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}
