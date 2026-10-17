"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { actions } from "@/lib/store";
import { toast } from "@/lib/ui";
import { COUPONS } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export function CouponBox({ totals }) {
  const [code, setCode] = useState("");
  const apply = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    if (actions.applyCoupon(code)) {
      toast(`Coupon ${code.trim().toUpperCase()} applied`);
      setCode("");
    } else {
      toast("Invalid coupon code", "error");
    }
  };

  const applied = totals.coupon || totals.couponError;
  return (
    <div>
      {applied ? (
        <div className={`flex items-center justify-between rounded-xl border border-dashed p-3 ${totals.couponError ? "border-amber-300 bg-amber-50 dark:bg-amber-500/10" : "border-emerald-300 bg-emerald-50 dark:bg-emerald-500/10"}`}>
          <div className="flex items-center gap-2 text-sm">
            <Tag size={16} className={totals.couponError ? "text-amber-600" : "text-emerald-600"} />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100">{totals.couponCode}</p>
              <p className={`text-xs ${totals.couponError ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"}`}>
                {totals.couponError || COUPONS[totals.coupon].label}
              </p>
            </div>
          </div>
          <button aria-label="Remove coupon" onClick={actions.removeCoupon} className="cursor-pointer text-slate-400 hover:text-rose-500">
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={apply} className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" className="input uppercase placeholder:normal-case" />
            <button className="btn-secondary shrink-0">Apply</button>
          </form>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.keys(COUPONS).map((c) => (
              <button key={c} type="button" onClick={() => actions.applyCoupon(c) && toast(`Coupon ${c} applied`)} className="cursor-pointer rounded-md border border-dashed border-brand-300 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-950">
                {c}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function TotalsRows({ totals }) {
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between">
        <dt className="text-slate-500">Subtotal ({totals.itemCount} items)</dt>
        <dd className="font-medium">{formatPrice(totals.subtotal)}</dd>
      </div>
      {totals.savings > 0 && (
        <div className="flex justify-between text-emerald-600">
          <dt>Product discount</dt>
          <dd className="font-medium">-{formatPrice(totals.savings)}</dd>
        </div>
      )}
      {totals.discount > 0 && (
        <div className="flex justify-between text-emerald-600">
          <dt>Coupon ({totals.coupon})</dt>
          <dd className="font-medium">-{formatPrice(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-slate-500">Delivery</dt>
        <dd className="font-medium">{totals.delivery === 0 ? <span className="text-emerald-600">FREE</span> : formatPrice(totals.delivery)}</dd>
      </div>
      <div className="flex justify-between border-t border-slate-200 pt-3 text-base dark:border-slate-700">
        <dt className="font-bold text-slate-900 dark:text-white">Total</dt>
        <dd className="text-xl font-extrabold text-slate-900 dark:text-white">{formatPrice(totals.total)}</dd>
      </div>
    </dl>
  );
}
