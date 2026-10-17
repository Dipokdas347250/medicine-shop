import { PRODUCTS } from "@/lib/data";
import ProductView from "./ProductView";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p) return { title: "Product" };
  return {
    title: `${p.name} ${p.strength} (${p.generic})`,
    description: p.description,
  };
}

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  return <ProductView key={slug} />;
}
