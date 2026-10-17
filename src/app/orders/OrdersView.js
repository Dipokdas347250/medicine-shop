"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, PackageSearch, RotateCcw, Search } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { StatusBadge } from "@/components/OrderStatus";
import { Breadcrumbs, EmptyState, PageSkeleton } from "@/components/ui";
import { actions, useHydrated, useStore } from "@/lib/store";
import { toast, uiActions } from "@/lib/ui";
import { cn, formatDate, formatPrice } from "@/lib/utils";

const FILTERS = ["All", "Active", "Delivered", "Cancelled"];

export default function OrdersView() {
  const hydrated = useHydrated();
  const orders = useStore((s) => s.orders);
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [lookup, setLookup] = useState("");

  if (!hydrated) return <PageSkeleton />;

  const shown = orders.filter((o) =>
    filter === "All" ? true : filter === "Active" ? !["Delivered", "Cancelled"].includes(o.status) : o.status === filter
  );

  const track = (e) => {
    e.preventDefault();
    const id = lookup.trim().replace(/^#/, "").toUpperCase();
    if (orders.some((o) => o.id === id)) router.push(`/orders/${id}`);
    else toast("No order found with that ID", "error");
  };

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My orders" }]} />
      <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My orders</h1>
          <p className="mt-1 text-sm text-slate-500">Track, reorder or cancel your recent orders.</p>
        </div>
        <form onSubmit={track} className="flex gap-2 md:w-96">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="Enter order ID, e.g. MC12345678" className="input pl-9" aria-label="Order ID" />
          </div>
          <button className="btn-primary">Track</button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={PackageSearch} title="No orders yet" text="When you place an order, it will appear here so you can track it." action={<Link href="/shop" className="btn-primary">Start shopping</Link>} />
        </div>
      ) : (
        <>
          <div className="scrollbar-none mt-6 flex gap-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn("shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition", filter === f ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300")}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-4">
            {shown.length === 0 && <p className="card p-8 text-center text-sm text-slate-500">No {filter.toLowerCase()} orders.</p>}
            {shown.map((o) => (
              <div key={o.id} className="card overflow-hidden transition hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3 text-sm dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <span><span className="text-slate-500">Order</span> <b className="text-slate-900 dark:text-white">#{o.id}</b></span>
                    <span className="text-slate-500">{formatDate(o.date, true)}</span>
                    <span className="text-slate-500">{o.items.reduce((n, i) => n + i.qty, 0)} items</span>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex -space-x-3">
                      {o.items.slice(0, 4).map((i) => (
                        <ProductImage key={i.id} product={i} className="h-14 w-14 bg-white ring-2 ring-white dark:bg-slate-900 dark:ring-slate-900" rounded="rounded-xl" />
                      ))}
                    </div>
                    <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(o.total)}</p>
                    <button
                      onClick={() => {
                        const n = actions.reorder(o.id);
                        if (n) toast(`${n} item(s) added to cart`, "success", { label: "View cart", onClick: uiActions.openCart });
                        else toast("These items are currently unavailable", "error");
                      }}
                      className="btn-secondary py-2"
                    >
                      <RotateCcw size={14} /> Reorder
                    </button>
                    <Link href={`/orders/${o.id}`} className="btn-primary py-2">
                      Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
