"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FileText, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import ProductImage from "./ProductImage";
import { QuantityPicker } from "./ui";
import { actions, computeTotals, useStore } from "@/lib/store";
import { uiActions, useUI } from "@/lib/ui";
import { SHOP } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export function FreeDeliveryProgress({ subtotal }) {
  const remaining = SHOP.freeDeliveryOver - subtotal;
  const pct = Math.min(100, (subtotal / SHOP.freeDeliveryOver) * 100);
  return (
    <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-950/60">
      <p className="flex items-center gap-2 text-xs font-medium text-brand-800 dark:text-brand-200">
        <Truck size={16} />
        {remaining > 0 ? (
          <span>
            Add <b>{formatPrice(remaining)}</b> more for <b>FREE delivery</b>
          </span>
        ) : (
          <span>You&apos;ve unlocked <b>FREE delivery!</b> 🎉</span>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900">
        <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const totals = useStore((s) => computeTotals(s));

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && uiActions.closeCart();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in" onClick={uiActions.closeCart} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in dark:bg-slate-900">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <ShoppingBag size={20} /> Your cart
            <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200">{totals.itemCount}</span>
          </h2>
          <button aria-label="Close cart" onClick={uiActions.closeCart} className="icon-btn">
            <X size={20} />
          </button>
        </header>

        {totals.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950">
              <ShoppingBag size={34} />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">Your cart is empty</p>
            <p className="mt-1 text-sm text-slate-500">Browse our medicines and health products.</p>
            <Link href="/shop" onClick={uiActions.closeCart} className="btn-primary mt-6">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="px-5 pt-4">
              <FreeDeliveryProgress subtotal={totals.subtotal} />
            </div>
            <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5 dark:divide-slate-800">
              {totals.lines.map(({ product, qty }) => (
                <li key={product.id} className="flex gap-3 py-4">
                  <ProductImage product={product} className="h-20 w-20 shrink-0" rounded="rounded-xl" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link href={`/product/${product.slug}`} onClick={uiActions.closeCart} className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-brand-600 dark:text-white">
                        {product.name} {product.strength}
                      </Link>
                      <button aria-label={`Remove ${product.name}`} onClick={() => actions.removeFromCart(product.id)} className="cursor-pointer text-slate-400 hover:text-rose-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">{product.unit}</p>
                    {product.rx && <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-rose-600"><FileText size={12} /> Prescription required</p>}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityPicker size="sm" value={qty} max={product.stock} onChange={(n) => actions.setQty(product.id, n)} />
                      <span className="font-bold text-slate-900 dark:text-white">{formatPrice(product.price * qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="space-y-3 border-t border-slate-200 p-5 dark:border-slate-800">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold">{formatPrice(totals.subtotal)}</span>
              </div>
              {totals.savings > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>You save</span>
                  <span className="font-semibold">{formatPrice(totals.savings)}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link href="/cart" onClick={uiActions.closeCart} className="btn-secondary">
                  View cart
                </Link>
                <Link href="/checkout" onClick={uiActions.closeCart} className="btn-primary">
                  Checkout
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
