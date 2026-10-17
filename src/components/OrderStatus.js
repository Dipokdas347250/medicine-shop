import { Check, CircleX, ClipboardCheck, Home, PackageCheck, Receipt, Truck } from "lucide-react";
import { ORDER_STATUSES } from "@/lib/store";
import { cn, formatDate } from "@/lib/utils";

const ICONS = { Placed: Receipt, Confirmed: ClipboardCheck, Packed: PackageCheck, Shipped: Truck, Delivered: Home };

export const STATUS_STYLES = {
  Placed: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  Confirmed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  Packed: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Shipped: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  Delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export function StatusBadge({ status }) {
  return <span className={cn("badge px-2.5 py-1", STATUS_STYLES[status])}>{status}</span>;
}

export function OrderTimeline({ order }) {
  if (order.status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
        <CircleX size={24} />
        <div>
          <p className="font-semibold">This order was cancelled</p>
          <p className="text-sm opacity-80">{formatDate(order.history.at(-1).date, true)}</p>
        </div>
      </div>
    );
  }
  const current = ORDER_STATUSES.indexOf(order.status);
  return (
    <ol className="grid grid-cols-5">
      {ORDER_STATUSES.map((s, i) => {
        const Icon = ICONS[s];
        const done = i <= current;
        const when = order.history.find((h) => h.status === s)?.date;
        return (
          <li key={s} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span className="absolute right-1/2 top-5 h-1 w-full -translate-y-1/2 rounded bg-slate-200 dark:bg-slate-800">
                <span className={cn("block h-full rounded bg-brand-500 transition-all duration-700", i <= current ? "w-full" : "w-0")} />
              </span>
            )}
            <span
              className={cn(
                "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 transition",
                done ? "border-brand-100 bg-brand-600 text-white dark:border-brand-900" : "border-white bg-slate-200 text-slate-400 dark:border-slate-900 dark:bg-slate-800",
                i === current && "ring-4 ring-brand-500/20"
              )}
            >
              {done && i < current ? <Check size={16} /> : <Icon size={16} />}
            </span>
            <span className={cn("mt-2 text-xs font-semibold", done ? "text-slate-900 dark:text-white" : "text-slate-400")}>{s}</span>
            {when && <span className="hidden text-[10px] text-slate-400 sm:block">{formatDate(when, true)}</span>}
          </li>
        );
      })}
    </ol>
  );
}
