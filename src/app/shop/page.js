import { Suspense } from "react";
import ShopView from "./ShopView";

export const metadata = {
  title: "Shop Medicines",
  description: "Browse all medicines, vitamins, baby care and medical devices.",
};

function ShopFallback() {
  return (
    <div className="container-x py-8">
      <div className="skeleton mb-6 h-8 w-56" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[3/4]" />
        ))}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopView />
    </Suspense>
  );
}
