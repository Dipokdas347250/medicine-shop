"use client";

import Link from "next/link";
import { ChevronRight, Minus, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value, count, size = 14, className }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"}
          />
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-slate-500 dark:text-slate-400">({count})</span>}
    </div>
  );
}

export function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          type="button"
          key={i}
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          onClick={() => onChange(i)}
          className="cursor-pointer transition hover:scale-110"
        >
          <Star size={26} className={i <= value ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"} />
        </button>
      ))}
    </div>
  );
}

export function QuantityPicker({ value, onChange, max = 99, size = "md", className }) {
  const s = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className={cn("inline-flex items-center rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800", className)}>
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(value - 1)} className={cn(s, "flex cursor-pointer items-center justify-center rounded-l-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700")}>
        <Minus size={14} />
      </button>
      <input
        type="number"
        aria-label="Quantity"
        value={value}
        min={1}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(Math.max(1, Math.min(max, n)));
        }}
        className={cn("w-10 bg-transparent text-center text-sm font-semibold outline-none", size === "sm" && "w-8")}
      />
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className={cn(s, "flex cursor-pointer items-center justify-center rounded-r-xl text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700")}>
        <Plus size={14} />
      </button>
    </div>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} className="text-slate-400" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-brand-600 dark:hover:text-brand-400">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center animate-pop">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
        <Icon size={36} />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      {text && <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function RxBadge({ className }) {
  return (
    <span title="Prescription required" className={cn("badge bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", className)}>
      Rx
    </span>
  );
}

export function PageSkeleton() {
  return (
    <div className="container-x py-10">
      <div className="skeleton mb-6 h-8 w-48" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="skeleton h-72 lg:col-span-2" />
        <div className="skeleton h-72" />
      </div>
    </div>
  );
}

export function Modal({ open, onClose, children, className, label }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn("relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl animate-pop sm:rounded-3xl dark:bg-slate-900", className)}>
        {children}
      </div>
    </div>
  );
}
