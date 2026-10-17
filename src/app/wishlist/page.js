"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Breadcrumbs, EmptyState, PageSkeleton } from "@/components/ui";
import { actions, useHydrated, useStore } from "@/lib/store";
import { toast, uiActions } from "@/lib/ui";

export default function WishlistPage() {
  const hydrated = useHydrated();
  const items = useStore((s) => s.wishlist.map((id) => s.products.find((p) => p.id === id && p.published)).filter(Boolean));

  if (!hydrated) return <PageSkeleton />;

  const addAll = () => {
    const added = items.filter((p) => actions.addToCart(p.id, 1)).length;
    if (added) toast(`${added} item(s) added to cart`, "success", { label: "View cart", onClick: uiActions.openCart });
    else toast("None of these items are in stock", "error");
  };

  return (
    <div className="container-x py-8">
      <title>Wishlist | MediCare Pharmacy</title>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My wishlist</h1>
          <p className="mt-1 text-sm text-slate-500">{items.length} saved item{items.length === 1 ? "" : "s"}</p>
        </div>
        {items.length > 0 && (
          <button onClick={addAll} className="btn-primary">
            <ShoppingCart size={16} /> Add all to cart
          </button>
        )}
      </div>
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState icon={Heart} title="Your wishlist is empty" text="Tap the heart on any product to save it for later." action={<Link href="/shop" className="btn-primary">Explore products</Link>} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
