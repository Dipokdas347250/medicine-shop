"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CreditCard, FileText, MapPin, PackageX, Phone, Printer, RotateCcw, XCircle } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { OrderTimeline, StatusBadge } from "@/components/OrderStatus";
import { Breadcrumbs, EmptyState, PageSkeleton } from "@/components/ui";
import { actions, useHydrated, useStore } from "@/lib/store";
import { toast, uiActions } from "@/lib/ui";
import { SHOP } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/utils";

export default function OrderDetailView() {
  const { id } = useParams();
  const hydrated = useHydrated();
  const order = useStore((s) => s.orders.find((o) => o.id === id));

  if (!hydrated) return <PageSkeleton />;
  if (!order) {
    return (
      <div className="container-x py-16">
        <EmptyState icon={PackageX} title="Order not found" text={`We couldn't find order #${id} on this device.`} action={<Link href="/orders" className="btn-primary">View my orders</Link>} />
      </div>
    );
  }

  const canCancel = ["Placed", "Confirmed"].includes(order.status);

  return (
    <div className="container-x py-8">
      <div className="print:hidden">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My orders", href: "/orders" }, { label: `#${order.id}` }]} />
      </div>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Order #{order.id}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">Placed on {formatDate(order.date, true)}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button onClick={() => window.print()} className="btn-secondary py-2">
            <Printer size={16} /> Invoice
          </button>
          <button
            onClick={() => {
              const n = actions.reorder(order.id);
              if (n) toast(`${n} item(s) added to cart`, "success", { label: "View cart", onClick: uiActions.openCart });
              else toast("These items are currently unavailable", "error");
            }}
            className="btn-secondary py-2"
          >
            <RotateCcw size={16} /> Reorder
          </button>
          {canCancel && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to cancel this order?")) {
                  actions.cancelOrder(order.id);
                  toast("Your order has been cancelled", "info");
                }
              }}
              className="btn py-2 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50 dark:ring-rose-500/30 dark:hover:bg-rose-500/10"
            >
              <XCircle size={16} /> Cancel order
            </button>
          )}
        </div>
      </div>

      <div className="card mt-6 p-6 sm:p-8">
        <OrderTimeline order={order} />
        {order.status !== "Cancelled" && order.status !== "Delivered" && (
          <p className="mt-6 text-center text-sm text-slate-500">
            {order.deliveryType === "express" ? "⚡ Express delivery — expected within 4 hours." : "Your order is being processed. You'll receive an SMS when it ships."}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card">
          <h2 className="border-b border-slate-100 px-6 py-4 font-bold text-slate-900 dark:border-slate-800 dark:text-white">Items ({order.items.length})</h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 px-6 py-4">
                <ProductImage product={i} className="h-16 w-16 shrink-0" rounded="rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{i.name} {i.strength}</p>
                  <p className="text-xs text-slate-500">{i.unit}</p>
                  <p className="text-sm text-slate-500">{i.qty} × {formatPrice(i.price)}</p>
                </div>
                <p className="font-bold text-slate-900 dark:text-white">{formatPrice(i.price * i.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <dl className="ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-600"><dt>Coupon ({order.coupon})</dt><dd>-{formatPrice(order.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-slate-500">Delivery</dt><dd>{order.delivery ? formatPrice(order.delivery) : "FREE"}</dd></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold dark:border-slate-700"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><MapPin size={16} className="text-brand-600" /> Delivery address</h3>
            <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-100">{order.customer.name}</p>
            <p className="text-sm text-slate-500">{[order.customer.address, order.customer.area, order.customer.city].filter(Boolean).join(", ")}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><Phone size={13} /> {order.customer.phone}</p>
            {order.note && <p className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-500 dark:bg-slate-800">Note: {order.note}</p>}
          </div>
          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><CreditCard size={16} className="text-brand-600" /> Payment</h3>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{order.payment.method} {order.payment.detail && <span className="text-slate-500">· {order.payment.detail}</span>}</p>
            <p className={`mt-1 text-xs font-semibold ${order.payment.paid ? "text-emerald-600" : "text-amber-600"}`}>
              {order.payment.paid ? "Paid" : order.status === "Delivered" ? "Paid on delivery" : `Pay ${formatPrice(order.total)} on delivery`}
            </p>
          </div>
          {order.prescription?.length > 0 && (
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><FileText size={16} className="text-brand-600" /> Prescription</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {order.prescription.map((p, i) => (
                  <a key={i} href={p.data} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.data} alt={p.name} className="aspect-square w-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="card p-5 text-sm text-slate-500 print:hidden">
            Need help with this order? Call us at <a href={`tel:${SHOP.phone.replace(/[^+\d]/g, "")}`} className="font-semibold text-brand-600">{SHOP.phone}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
