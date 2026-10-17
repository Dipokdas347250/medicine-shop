"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShoppingCart, X } from "lucide-react";
import ProductImage from "./ProductImage";
import { WishlistButton } from "./ProductCard";
import { Modal, QuantityPicker, Rating, RxBadge } from "./ui";
import { actions, getProductRating, useStore } from "@/lib/store";
import { toast, uiActions, useUI } from "@/lib/ui";
import { discountPercent, formatPrice } from "@/lib/utils";

function QuickViewBody({ product }) {
  const [qty, setQty] = useState(1);
  const reviews = useStore((s) => s.reviews[product.id]);
  const { rating, count } = getProductRating(product, reviews);
  const off = discountPercent(product.price, product.mrp);
  const out = product.stock <= 0;

  return (
    <div className="grid gap-6 p-6 sm:grid-cols-2">
      <ProductImage product={product} className="aspect-square w-full" />
      <div className="flex flex-col">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{product.brand}</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          {product.name} <span className="text-lg font-medium text-slate-500">{product.strength}</span>
        </h2>
        <p className="text-sm text-slate-500">{product.generic}</p>
        <div className="mt-2 flex items-center gap-2">
          <Rating value={rating} count={count} />
          {product.rx && <RxBadge />}
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
          {off > 0 && (
            <>
              <span className="text-slate-400 line-through">{formatPrice(product.mrp)}</span>
              <span className="badge bg-rose-100 text-rose-600 dark:bg-rose-500/15">{off}% OFF</span>
            </>
          )}
        </div>
        <p className="text-xs text-slate-500">{product.unit}</p>
        <p className="mt-4 line-clamp-4 text-sm text-slate-600 dark:text-slate-300">{product.description}</p>
        <p className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${out ? "text-rose-600" : "text-emerald-600"}`}>
          <CheckCircle2 size={16} /> {out ? "Out of stock" : product.stock < 20 ? `Only ${product.stock} left` : "In stock"}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-6">
          <QuantityPicker value={qty} max={Math.max(1, product.stock)} onChange={(n) => setQty(Math.max(1, n))} />
          <button
            disabled={out}
            onClick={() => {
              actions.addToCart(product.id, qty);
              toast(`${qty} × ${product.name} added to cart`, "success", { label: "View cart", onClick: uiActions.openCart });
              uiActions.closeQuickView();
            }}
            className="btn-primary flex-1"
          >
            <ShoppingCart size={16} /> Add to cart
          </button>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700">
            <WishlistButton product={product} />
          </span>
        </div>
        <Link href={`/product/${product.slug}`} onClick={uiActions.closeQuickView} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
          View full details <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function QuickView() {
  const id = useUI((s) => s.quickViewId);
  const product = useStore((s) => s.products.find((p) => p.id === id));

  useEffect(() => {
    if (!id) return;
    const onKey = (e) => e.key === "Escape" && uiActions.closeQuickView();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [id]);

  return (
    <Modal open={Boolean(product)} onClose={uiActions.closeQuickView} className="max-w-3xl" label="Quick view">
      <button aria-label="Close" onClick={uiActions.closeQuickView} className="icon-btn absolute right-3 top-3 z-10">
        <X size={20} />
      </button>
      {product && <QuickViewBody key={product.id} product={product} />}
    </Modal>
  );
}
