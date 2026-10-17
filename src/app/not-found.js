import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <p className="text-8xl font-black text-brand-100 dark:text-brand-950">404</p>
      <h1 className="-mt-6 text-3xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-3 max-w-md text-slate-500">The page you&apos;re looking for doesn&apos;t exist or may have been moved.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">Go home</Link>
        <Link href="/shop" className="btn-secondary">Browse medicines</Link>
      </div>
    </div>
  );
}
