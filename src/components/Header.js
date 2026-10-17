"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FileUp, Heart, LayoutGrid, Menu, Moon, Phone, ShoppingCart, Sun, Truck, User, X } from "lucide-react";
import SearchBox from "./SearchBox";
import CategoryIcon from "./CategoryIcon";
import { actions, useStore } from "@/lib/store";
import { uiActions } from "@/lib/ui";
import { CATEGORIES, SHOP } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Logo({ className }) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2", className)} aria-label={`${SHOP.name} home`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
          Medi<span className="text-brand-600 dark:text-brand-400">Care</span>
        </span>
        <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-400">Pharmacy</span>
      </span>
    </Link>
  );
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "All Medicines" },
  { href: "/shop?sort=discount", label: "Offers" },
  { href: "/upload-prescription", label: "Upload Prescription" },
  { href: "/orders", label: "Track Order" },
  { href: "/contact", label: "Help & Contact" },
];

function Badge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white animate-pop dark:ring-slate-900">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const cartCount = useStore((s) => s.cart.reduce((n, l) => n + l.qty, 0));
  const wishCount = useStore((s) => s.wishlist.length);
  const user = useStore((s) => s.user);
  const theme = useStore((s) => s.theme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 print:hidden">
      <div className="bg-brand-800 text-brand-50">
        <div className="container-x flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-2">
            <Truck size={14} className="shrink-0" /> <span>Free delivery over ৳{SHOP.freeDeliveryOver.toLocaleString("en-US")}<span className="hidden sm:inline"> · Use code <b className="rounded bg-white/15 px-1.5">HEALTH10</b> for 10% off</span></span>
          </p>
          <a href={`tel:${SHOP.phone.replace(/[^+\d]/g, "")}`} className="hidden items-center gap-1.5 hover:text-white sm:flex">
            <Phone size={13} /> {SHOP.phone} (24/7)
          </a>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/90">
        <div className="container-x flex h-16 items-center gap-3 lg:h-[72px] lg:gap-6">
          <button aria-label="Open menu" onClick={() => setMenuOpen(true)} className="icon-btn -ml-2 lg:hidden">
            <Menu size={22} />
          </button>
          <Logo />
          <SearchBox className="hidden flex-1 md:block" />
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link href="/upload-prescription" className="btn-ghost hidden text-brand-700 xl:inline-flex dark:text-brand-300">
              <FileUp size={18} /> Upload Rx
            </Link>
            <button
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => actions.setTheme(theme === "dark" ? "light" : "dark")}
              className="icon-btn"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link href="/wishlist" aria-label="Wishlist" className="icon-btn hidden sm:inline-flex">
              <Heart size={20} />
              <Badge count={wishCount} />
            </Link>
            <Link href="/account" aria-label="Account" className="icon-btn">
              {user ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User size={20} />
              )}
            </Link>
            <button aria-label="Open cart" onClick={uiActions.openCart} className="icon-btn">
              <ShoppingCart size={20} />
              <Badge count={cartCount} />
            </button>
          </div>
        </div>
        <div className="container-x pb-3 md:hidden">
          <SearchBox />
        </div>
      </div>

      <nav className="hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="container-x flex h-12 items-center gap-1">
          <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
            <button
              onClick={() => setCatOpen((o) => !o)}
              aria-expanded={catOpen}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <LayoutGrid size={16} /> Categories <ChevronDown size={14} className={cn("transition", catOpen && "rotate-180")} />
            </button>
            {catOpen && (
              <div className="absolute left-0 top-full pt-2">
                <div className="grid w-[560px] grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl animate-pop dark:border-slate-700 dark:bg-slate-900">
                  {CATEGORIES.map((c) => {
                    return (
                      <Link
                        key={c.id}
                        href={`/shop?category=${c.id}`}
                        onClick={() => setCatOpen(false)}
                        className="flex items-center gap-3 rounded-xl p-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${c.color}1a`, color: c.color }}>
                          <CategoryIcon name={c.icon} size={18} />
                        </span>
                        {c.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition hover:text-brand-700 dark:hover:text-brand-300",
                pathname === n.href ? "text-brand-700 dark:text-brand-300" : "text-slate-600 dark:text-slate-300"
              )}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-slate-950/50 animate-fade-in" onClick={closeMenu} />
          <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85%] flex-col overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button aria-label="Close menu" onClick={closeMenu} className="icon-btn">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-1">
              {[...NAV, { href: "/wishlist", label: "Wishlist" }, { href: "/account", label: user ? "My Account" : "Login / Register" }].map((n) => (
                <Link key={n.href} href={n.href} onClick={closeMenu} className="block rounded-xl px-3 py-2.5 font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                  {n.label}
                </Link>
              ))}
            </div>
            <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Categories</p>
            <div className="space-y-1">
              {CATEGORIES.map((c) => {
                return (
                  <Link key={c.id} href={`/shop?category=${c.id}`} onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                    <CategoryIcon name={c.icon} size={16} style={{ color: c.color }} /> {c.name}
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
