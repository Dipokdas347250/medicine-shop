"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import ProductImage from "./ProductImage";
import { publishedProducts, useStore } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";

export function searchProducts(products, query) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  const terms = q.split(/\s+/);
  return products.filter((p) => {
    const hay = `${p.name} ${p.generic} ${p.brand} ${p.strength} ${p.category} ${(p.uses || []).join(" ")}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export default function SearchBox({ className, autoFocus, onNavigate }) {
  const router = useRouter();
  const products = useStore(publishedProducts);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const blurTimer = useRef(null);

  const results = query.trim() ? searchProducts(products, query).slice(0, 6) : [];

  const go = (href) => {
    setOpen(false);
    setActive(-1);
    onNavigate?.();
    router.push(href);
  };

  const submit = (e) => {
    e.preventDefault();
    if (active >= 0 && results[active]) return go(`/product/${results[active].slug}`);
    go(query.trim() ? `/shop?q=${encodeURIComponent(query.trim())}` : "/shop");
  };

  const onKeyDown = (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <form onSubmit={submit} role="search" className={cn("relative", className)}>
      <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => (blurTimer.current = setTimeout(() => setOpen(false), 150))}
        onKeyDown={onKeyDown}
        placeholder="Search medicines, brands, symptoms…"
        aria-label="Search products"
        aria-expanded={open && results.length > 0}
        aria-controls="search-suggestions"
        role="combobox"
        autoComplete="off"
        className="input h-11 rounded-full bg-slate-100 pl-10 pr-24 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-900 [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-20 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      )}
      <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
        Search
      </button>

      {open && query.trim() && (
        <div
          id="search-suggestions"
          onMouseDown={() => clearTimeout(blurTimer.current)}
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-pop dark:border-slate-700 dark:bg-slate-900"
        >
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">No medicines found for “{query}”</p>
          ) : (
            <ul role="listbox">
              {results.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(`/product/${p.slug}`)}
                    className={cn("flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left", i === active && "bg-brand-50 dark:bg-slate-800")}
                  >
                    <ProductImage product={p} className="h-11 w-11 shrink-0" rounded="rounded-lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {p.name} {p.strength}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {p.generic} · {p.brand}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-brand-700 dark:text-brand-400">{formatPrice(p.price)}</span>
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => go(`/shop?q=${encodeURIComponent(query.trim())}`)} className="w-full cursor-pointer border-t border-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-brand-600 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                  See all results for “{query}”
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
