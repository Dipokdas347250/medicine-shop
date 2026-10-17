"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, Heart, Lock, ShoppingBag, Trash2 } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import { FreeDeliveryProgress } from "@/components/CartDrawer";
import { CouponBox, TotalsRows } from "@/components/OrderSummary";
import { Breadcrumbs, EmptyState, PageSkeleton, QuantityPicker, RxBadge } from "@/components/ui";
import { actions, computeTotals, publishedProducts, useHydrated, useStore } from "@/lib/store";
import { toast } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";

export default function CartView() {
  const hydrated = useHydrated();
  const totals = useStore((s) => computeTotals(s));
  const products = useStore(publishedProducts);

  if (!hydrated) return <PageSkeleton />;

  const inCart = new Set(totals.lines.map((l) => l.product.id));
  const suggestions = products.filter((p) => !inCart.has(p.id) && !p.rx && p.stock > 0 && p.price < 400).slice(0, 5);

  if (totals.lines.length === 0) {
    return (
      <div className="container-x py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          text="Looks like you haven't added any medicines yet. Explore our catalog to get started."
          action={<Link href="/shop" className="btn-primary px-6">Start shopping</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <div className="mt-4 flex items-end justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Shopping cart</h1>
        <button
          onClick={() => {
            if (window.confirm("Remove all items from your cart?")) {
              actions.clearCart();
              toast("Cart cleared", "info");
            }
          }}
          className="cursor-pointer text-sm font-semibold text-slate-500 hover:text-rose-600"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <FreeDeliveryProgress subtotal={totals.subtotal} />
          {totals.needsRx && (
            <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-500/20 dark:bg-rose-500/10">
              <FileText size={20} className="shrink-0 text-rose-600" />
              <p className="text-rose-800 dark:text-rose-300">
                Your cart contains prescription medicines. Please keep a photo of your prescription ready — you&apos;ll upload it at checkout.
              </p>
            </div>
          )}
          <ul className="card divide-y divide-slate-100 dark:divide-slate-800">
            {totals.lines.map(({ product, qty }) => (
              <li key={product.id} className="flex gap-4 p-4 sm:p-5">
                <Link href={`/product/${product.slug}`} className="shrink-0">
                  <ProductImage product={product} className="h-24 w-24 sm:h-28 sm:w-28" rounded="rounded-xl" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/product/${product.slug}`} className="font-semibold text-slate-900 hover:text-brand-600 dark:text-white">
                        {product.name} {product.strength}
                      </Link>
                      <p className="text-sm text-slate-500">{product.generic}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                        {product.unit} {product.rx && <RxBadge />}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">{formatPrice(product.price * qty)}</p>
                      {product.mrp > product.price && <p className="text-xs text-slate-400 line-through">{formatPrice(product.mrp * qty)}</p>}
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="flex items-center gap-3">
                      <QuantityPicker size="sm" value={qty} max={product.stock} onChange={(n) => actions.setQty(product.id, n)} />
                      {product.stock <= 20 && <span className="text-xs text-amber-600">Only {product.stock} left</span>}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <button
                        onClick={() => {
                          actions.removeFromCart(product.id);
                          actions.addToWishlist(product.id);
                          toast("Moved to wishlist", "info");
                        }}
                        className="flex cursor-pointer items-center gap-1 text-slate-500 hover:text-brand-600"
                      >
                        <Heart size={14} /> <span className="hidden sm:inline">Save for later</span>
                      </button>
                      <button
                        onClick={() => {
                          actions.removeFromCart(product.id);
                          toast(`${product.name} removed`, "info", { label: "Undo", onClick: () => actions.addToCart(product.id, qty) });
                        }}
                        className="flex cursor-pointer items-center gap-1 text-slate-500 hover:text-rose-600"
                      >
                        <Trash2 size={14} /> <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            <ArrowLeft size={16} /> Continue shopping
          </Link>
        </div>

        <aside>
          <div className="card sticky top-44 space-y-5 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Order summary</h2>
            <CouponBox totals={totals} />
            <TotalsRows totals={totals} />
            {totals.savings + totals.discount > 0 && (
              <p className="rounded-xl bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                🎉 You&apos;re saving {formatPrice(totals.savings + totals.discount)} on this order
              </p>
            )}
            <Link href="/checkout" className="btn-primary w-full py-3.5 text-base">
              Proceed to checkout <ArrowRight size={18} />
            </Link>
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Lock size={12} /> Secure checkout · Cash on delivery available
            </p>
          </div>
        </aside>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Frequently added together</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {suggestions.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
