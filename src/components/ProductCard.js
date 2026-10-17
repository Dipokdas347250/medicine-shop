"use client";

import Link from "next/link";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import ProductImage from "./ProductImage";
import { QuantityPicker, Rating, RxBadge } from "./ui";
import { actions, getProductRating, useStore } from "@/lib/store";
import { toast, uiActions } from "@/lib/ui";
import { cn, discountPercent, formatPrice } from "@/lib/utils";

export function useCartActions(product) {
  const qty = useStore((s) => s.cart.find((l) => l.id === product.id)?.qty || 0);
  const add = (n = 1) => {
    if (actions.addToCart(product.id, n)) {
      toast(`${product.name} added to cart`, "success", { label: "View cart", onClick: uiActions.openCart });
    } else {
      toast("Sorry, this item is out of stock", "error");
    }
  };
  return { qty, add, setQty: (n) => actions.setQty(product.id, n) };
}

export function WishlistButton({ product, className, size = 18 }) {
  const active = useStore((s) => s.wishlist.includes(product.id));
  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        const added = actions.toggleWishlist(product.id);
        toast(added ? "Saved to your wishlist" : "Removed from wishlist", added ? "success" : "info");
      }}
      className={cn("cursor-pointer transition hover:scale-110", active ? "text-rose-500" : "text-slate-400 hover:text-rose-500", className)}
    >
      <Heart size={size} className={active ? "fill-rose-500" : ""} />
    </button>
  );
}

export default function ProductCard({ product, layout = "grid" }) {
  const { qty, add, setQty } = useCartActions(product);
  const reviews = useStore((s) => s.reviews[product.id]);
  const { rating, count } = getProductRating(product, reviews);
  const off = discountPercent(product.price, product.mrp);
  const outOfStock = product.stock <= 0;
  const href = `/product/${product.slug}`;

  const cartControl = outOfStock ? (
    <button disabled className="btn-secondary w-full py-2 text-xs">Out of stock</button>
  ) : qty > 0 ? (
    <QuantityPicker size="sm" value={qty} max={product.stock} onChange={setQty} className="w-full justify-between" />
  ) : (
    <button onClick={() => add()} className="btn-primary w-full py-2 text-xs">
      <ShoppingCart size={15} /> Add to cart
    </button>
  );

  if (layout === "list") {
    return (
      <div className="card group flex gap-4 p-3 transition hover:shadow-md sm:p-4">
        <Link href={href} className="relative shrink-0">
          <ProductImage product={product} className="h-28 w-28 sm:h-36 sm:w-36" />
          {off > 0 && <span className="badge absolute left-2 top-2 bg-rose-500 text-white">-{off}%</span>}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">{product.brand}</p>
              <Link href={href} className="line-clamp-1 font-semibold text-slate-900 hover:text-brand-600 dark:text-white">
                {product.name} <span className="font-normal text-slate-500">{product.strength}</span>
              </Link>
              <p className="line-clamp-1 text-sm text-slate-500 dark:text-slate-400">{product.generic}</p>
            </div>
            <WishlistButton product={product} />
          </div>
          <p className="mt-1 hidden text-sm text-slate-500 sm:line-clamp-2 dark:text-slate-400">{product.description}</p>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
            <div>
              <div className="flex items-center gap-2">
                <Rating value={rating} count={count} size={12} />
                {product.rx && <RxBadge />}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
                {off > 0 && <span className="text-sm text-slate-400 line-through">{formatPrice(product.mrp)}</span>}
                <span className="text-xs text-slate-500">/ {product.unit}</span>
              </div>
            </div>
            <div className="w-36">{cartControl}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card group relative flex flex-col overflow-hidden p-3 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/30">
      <div className="relative">
        <Link href={href} aria-label={product.name}>
          <ProductImage product={product} className={cn("aspect-square w-full transition duration-500 group-hover:scale-[1.03]", outOfStock && "opacity-50 grayscale")} />
        </Link>
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {off > 0 && <span className="badge bg-rose-500 text-white">-{off}%</span>}
          {product.rx && <RxBadge />}
        </div>
        {outOfStock && <span className="badge absolute bottom-2 left-2 bg-slate-800 text-white">Out of stock</span>}
        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-slate-800/90">
            <WishlistButton product={product} size={16} />
          </span>
          <button
            type="button"
            aria-label="Quick view"
            onClick={() => uiActions.openQuickView(product.id)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-500 opacity-100 shadow-sm transition hover:text-brand-600 sm:translate-x-2 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 dark:bg-slate-800/90"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-1 flex-col">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">{product.brand}</p>
        <Link href={href} className="mt-0.5 line-clamp-1 font-semibold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">
          {product.name} <span className="text-sm font-normal text-slate-500">{product.strength}</span>
        </Link>
        <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{product.generic}</p>
        <Rating value={rating} count={count} size={12} className="mt-1.5" />
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
          {off > 0 && <span className="text-xs text-slate-400 line-through">{formatPrice(product.mrp)}</span>}
        </div>
        <p className="mb-3 truncate text-[11px] text-slate-500">{product.unit}</p>
        <div className="mt-auto">{cartControl}</div>
      </div>
    </div>
  );
}
