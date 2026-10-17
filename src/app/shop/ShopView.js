"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutGrid, List, SearchX, SlidersHorizontal, Star, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import CategoryIcon from "@/components/CategoryIcon";
import { searchProducts } from "@/components/SearchBox";
import { Breadcrumbs, EmptyState } from "@/components/ui";
import { getProductRating, publishedProducts, useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/data";
import { cn, discountPercent, formatPrice } from "@/lib/utils";

const PAGE_SIZE = 12;

const SORTS = [
  { id: "relevance", label: "Relevance" },
  { id: "popular", label: "Most popular" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "discount", label: "Biggest discount" },
  { id: "rating", label: "Top rated" },
  { id: "name", label: "Name: A to Z" },
];

const PRICE_PRESETS = [
  [0, 100],
  [100, 500],
  [500, 1000],
  [1000, null],
];

function useFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const list = (k) => (params.get(k) ? params.get(k).split(",").filter(Boolean) : []);
  const num = (k) => (params.get(k) !== null && params.get(k) !== "" ? Number(params.get(k)) : null);

  const filters = {
    q: params.get("q") || "",
    categories: list("category"),
    brands: list("brand"),
    type: params.get("type") || "all",
    inStock: params.get("stock") === "1",
    onSale: params.get("sale") === "1",
    rating: num("rating"),
    min: num("min"),
    max: num("max"),
    sort: params.get("sort") || "relevance",
    view: params.get("view") || "grid",
    page: Math.max(1, num("page") || 1),
  };

  const update = (patch, { keepPage = false } = {}) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => {
      const value = Array.isArray(v) ? v.join(",") : v;
      if (value === null || value === undefined || value === "" || value === false) next.delete(k);
      else next.set(k, value === true ? "1" : String(value));
    });
    if (!keepPage) next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return { filters, update };
}

function applyFilters(products, reviews, f) {
  let list = searchProducts(products, f.q);
  if (f.categories.length) list = list.filter((p) => f.categories.includes(p.category));
  if (f.brands.length) list = list.filter((p) => f.brands.includes(p.brand));
  if (f.type === "rx") list = list.filter((p) => p.rx);
  if (f.type === "otc") list = list.filter((p) => !p.rx);
  if (f.inStock) list = list.filter((p) => p.stock > 0);
  if (f.onSale) list = list.filter((p) => p.mrp > p.price);
  if (f.min !== null) list = list.filter((p) => p.price >= f.min);
  if (f.max !== null) list = list.filter((p) => p.price <= f.max);
  const rated = (p) => getProductRating(p, reviews[p.id]).rating;
  if (f.rating) list = list.filter((p) => rated(p) >= f.rating);

  const sorted = [...list];
  switch (f.sort) {
    case "popular": sorted.sort((a, b) => b.reviews - a.reviews); break;
    case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
    case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
    case "discount": sorted.sort((a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp)); break;
    case "rating": sorted.sort((a, b) => rated(b) - rated(a)); break;
    case "name": sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: sorted.sort((a, b) => (b.stock > 0) - (a.stock > 0));
  }
  return sorted;
}

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-slate-100 py-5 first:pt-0 last:border-0 dark:border-slate-800">
      <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      {children}
    </div>
  );
}

function Checkbox({ checked, onChange, children, count }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 cursor-pointer rounded accent-brand-600" />
      <span className="flex-1">{children}</span>
      {count !== undefined && <span className="text-xs text-slate-400">{count}</span>}
    </label>
  );
}

function PriceFilter({ min, max, onApply }) {
  const [lo, setLo] = useState(min ?? "");
  const [hi, setHi] = useState(max ?? "");
  const apply = (e) => {
    e?.preventDefault();
    onApply(lo === "" ? null : Number(lo), hi === "" ? null : Number(hi));
  };
  return (
    <div>
      <form onSubmit={apply} className="flex items-center gap-2">
        <input type="number" min={0} placeholder="Min" value={lo} onChange={(e) => setLo(e.target.value)} className="input px-2.5 py-2" aria-label="Minimum price" />
        <span className="text-slate-400">–</span>
        <input type="number" min={0} placeholder="Max" value={hi} onChange={(e) => setHi(e.target.value)} className="input px-2.5 py-2" aria-label="Maximum price" />
        <button className="btn-secondary px-3 py-2">Go</button>
      </form>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {PRICE_PRESETS.map(([a, b]) => {
          const active = min === a && max === b;
          return (
            <button
              key={a}
              onClick={() => onApply(active ? null : a, active ? null : b)}
              className={cn(
                "cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition",
                active ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300" : "border-slate-200 text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:text-slate-300"
              )}
            >
              {b === null ? `${formatPrice(a)}+` : `${formatPrice(a)} – ${formatPrice(b)}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Filters({ filters: f, update, products }) {
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const toggle = (key, arr, value) => update({ [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] });

  return (
    <div>
      <FilterSection title="Category">
        <div className="space-y-0.5">
          {CATEGORIES.map((c) => (
            <Checkbox key={c.id} checked={f.categories.includes(c.id)} onChange={() => toggle("category", f.categories, c.id)} count={products.filter((p) => p.category === c.id).length}>
              <span className="flex items-center gap-2">
                <CategoryIcon name={c.icon} size={14} style={{ color: c.color }} /> {c.name}
              </span>
            </Checkbox>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Price range">
        <PriceFilter key={`${f.min}-${f.max}`} min={f.min} max={f.max} onApply={(min, max) => update({ min, max })} />
      </FilterSection>
      <FilterSection title="Medicine type">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {[
            ["all", "All"],
            ["otc", "OTC"],
            ["rx", "Rx only"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => update({ type: v === "all" ? null : v })}
              className={cn("cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition", f.type === v ? "bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300" : "text-slate-500")}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">OTC = no prescription needed</p>
      </FilterSection>
      <FilterSection title="Availability & offers">
        <Checkbox checked={f.inStock} onChange={() => update({ stock: !f.inStock })}>In stock only</Checkbox>
        <Checkbox checked={f.onSale} onChange={() => update({ sale: !f.onSale })}>On sale</Checkbox>
      </FilterSection>
      <FilterSection title="Customer rating">
        {[4.5, 4, 3].map((r) => (
          <button
            key={r}
            onClick={() => update({ rating: f.rating === r ? null : r })}
            className={cn("flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm", f.rating === r ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800")}
          >
            <Star size={14} className="fill-amber-400 text-amber-400" /> {r}+ stars
          </button>
        ))}
      </FilterSection>
      <FilterSection title="Brand">
        <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
          {brands.map((b) => (
            <Checkbox key={b} checked={f.brands.includes(b)} onChange={() => toggle("brand", f.brands, b)} count={products.filter((p) => p.brand === b).length}>
              {b}
            </Checkbox>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      <button aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)} className="btn-secondary h-10 w-10 p-0">
        <ChevronLeft size={16} />
      </button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
          <button
            onClick={() => onChange(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn("h-10 min-w-10 cursor-pointer rounded-xl px-3 text-sm font-semibold transition", n === page ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300")}
          >
            {n}
          </button>
        </span>
      ))}
      <button aria-label="Next page" disabled={page === pages} onClick={() => onChange(page + 1)} className="btn-secondary h-10 w-10 p-0">
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export default function ShopView() {
  const products = useStore(publishedProducts);
  const reviews = useStore((s) => s.reviews);
  const { filters: f, update } = useFilters();
  const [drawer, setDrawer] = useState(false);

  const results = applyFilters(products, reviews, f);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(f.page, pages);
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const singleCategory = f.categories.length === 1 ? CATEGORIES.find((c) => c.id === f.categories[0]) : null;
  const title = f.q ? `Results for “${f.q}”` : singleCategory ? singleCategory.name : "All medicines";

  const chips = [
    ...(f.q ? [{ label: `“${f.q}”`, clear: () => update({ q: null }) }] : []),
    ...f.categories.map((id) => ({ label: CATEGORIES.find((c) => c.id === id)?.name || id, clear: () => update({ category: f.categories.filter((x) => x !== id) }) })),
    ...f.brands.map((b) => ({ label: b, clear: () => update({ brand: f.brands.filter((x) => x !== b) }) })),
    ...(f.type !== "all" ? [{ label: f.type === "rx" ? "Prescription only" : "Over the counter", clear: () => update({ type: null }) }] : []),
    ...(f.inStock ? [{ label: "In stock", clear: () => update({ stock: null }) }] : []),
    ...(f.onSale ? [{ label: "On sale", clear: () => update({ sale: null }) }] : []),
    ...(f.rating ? [{ label: `${f.rating}+ stars`, clear: () => update({ rating: null }) }] : []),
    ...(f.min !== null || f.max !== null
      ? [{ label: `${f.min !== null ? formatPrice(f.min) : "৳0"} – ${f.max !== null ? formatPrice(f.max) : "any"}`, clear: () => update({ min: null, max: null }) }]
      : []),
  ];

  const clearAll = () => update({ q: null, category: null, brand: null, type: null, stock: null, sale: null, rating: null, min: null, max: null });

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, ...(singleCategory ? [{ label: singleCategory.name }] : [])]} />
      <div className="mt-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {results.length} product{results.length === 1 ? "" : "s"} found
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-44 max-h-[calc(100vh-12rem)] overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <SlidersHorizontal size={16} /> Filters
              </p>
              {chips.length > 0 && (
                <button onClick={clearAll} className="cursor-pointer text-xs font-semibold text-brand-600 hover:underline">
                  Clear all
                </button>
              )}
            </div>
            <Filters filters={f} update={update} products={products} />
          </div>
        </aside>

        <div>
          <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
            <button onClick={() => setDrawer(true)} className="btn-secondary py-2 lg:hidden">
              <SlidersHorizontal size={16} /> Filters {chips.length > 0 && <span className="badge bg-brand-600 text-white">{chips.length}</span>}
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm text-slate-500">
              <span className="hidden sm:inline">Sort by</span>
              <select value={f.sort} onChange={(e) => update({ sort: e.target.value === "relevance" ? null : e.target.value })} className="input w-auto cursor-pointer py-2 pr-8">
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {[
                ["grid", LayoutGrid],
                ["list", List],
              ].map(([v, Icon]) => (
                <button
                  key={v}
                  aria-label={`${v} view`}
                  aria-pressed={f.view === v}
                  onClick={() => update({ view: v === "grid" ? null : v }, { keepPage: true })}
                  className={cn("cursor-pointer rounded-lg p-1.5 transition", f.view === v ? "bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300" : "text-slate-400")}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button key={c.label} onClick={c.clear} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300">
                  {c.label} <X size={12} />
                </button>
              ))}
              <button onClick={clearAll} className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-rose-600">Clear all</button>
            </div>
          )}

          {visible.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No medicines match your filters"
              text="Try a different search term or remove some filters. You can also upload your prescription and we'll find it for you."
              action={<button onClick={clearAll} className="btn-primary">Clear all filters</button>}
            />
          ) : f.view === "list" ? (
            <div className="space-y-3">
              {visible.map((p) => <ProductCard key={p.id} product={p} layout="list" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <Pagination
            page={page}
            pages={pages}
            onChange={(n) => {
              update({ page: n > 1 ? n : null }, { keepPage: true });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-slate-950/50 animate-fade-in" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-white animate-pop dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-white">Filters</p>
              <button aria-label="Close filters" onClick={() => setDrawer(false)} className="icon-btn">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <Filters filters={f} update={update} products={products} />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4 dark:border-slate-800">
              <button onClick={clearAll} className="btn-secondary">Clear all</button>
              <button onClick={() => setDrawer(false)} className="btn-primary">Show {results.length} results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
