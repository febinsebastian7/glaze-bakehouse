"use client";

import {
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SessionAvatar from "@/components/auth/SessionAvatar";
import GlazeWordmark from "@/components/brand/GlazeWordmark";
import { useStore } from "@/components/store/StoreProvider";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Cakes", href: "/cakes" },
  { label: "Desserts", href: "/desserts" },
  { label: "Custom Cakes", href: "/custom-cake" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount, setCartOpen } = useStore();

  return (
    <>
      <header className="relative z-50">
        <div className="container-glaze">
          <nav className="flex h-[82px] items-center justify-between border-b border-[var(--cocoa)]/10">
            {/* Brand */}
            <Link href="/" aria-label="Glaze Bakehouse" className="text-[var(--cocoa)]"><GlazeWordmark size="compact" /></Link>

            {/* Desktop navigation */}
            <div className="hidden items-center gap-8 lg:flex">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-3 text-[9px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                    pathname === item.href
                      ? "text-[var(--caramel)]"
                      : "text-[var(--cocoa)]/80 hover:text-[var(--caramel)]"
                  }`}
                >
                  {item.label}

                  {pathname === item.href && (
                    <span className="absolute bottom-0 left-0 h-px w-full bg-[var(--caramel)]" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden items-center gap-5 lg:flex">
              <Link href="/cakes?search=1" aria-label="Search cakes" title="Search cakes">
                <Search
                  size={18}
                  strokeWidth={1.4}
                />
              </Link>

              <Link href="/account" aria-label="Account"><SessionAvatar /></Link>

              <button
                aria-label="Open shopping bag"
                className="relative"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag
                  size={18}
                  strokeWidth={1.4}
                />

                <span className="absolute -right-2 -top-2 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[var(--caramel)] text-[7px] text-white">
                  {cartCount}
                </span>
              </button>

              <Link
                href="/cakes"
                className="ml-1 rounded-full border border-[var(--cocoa)]/40 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] transition-all hover:bg-[var(--cocoa)] hover:text-[var(--vanilla)]"
              >
                Order Now
              </Link>
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-4 lg:hidden">
              <Link href="/cakes?search=1" aria-label="Search cakes" title="Search cakes">
                <Search size={19} strokeWidth={1.4} />
              </Link>

              <button
                aria-label="Open shopping bag"
                className="relative"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag size={19} strokeWidth={1.4} />

                <span className="absolute -right-2 -top-2 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[var(--caramel)] text-[7px] text-white">
                  {cartCount}
                </span>
              </button>

              <button
                aria-label="Menu"
                onClick={() => setOpen(!open)}
              >
                {open ? (
                  <X size={21} strokeWidth={1.4} />
                ) : (
                  <Menu size={21} strokeWidth={1.4} />
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-[var(--vanilla)] transition-all duration-500 lg:hidden ${
          open
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      >
        <div className="flex h-full flex-col px-7 pb-8 pt-28">
          <div className="flex flex-1 flex-col justify-center gap-5">
            {[
              ...navigation,
              { label: "Flavours", href: "/flavours" },
              { label: "Founder", href: "/founder" },
              { label: "Reviews", href: "/reviews" },
              { label: "FAQ", href: "/faq" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-display text-[2.65rem] leading-none tracking-[-0.03em]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            href="/custom-cake"
            onClick={() => setOpen(false)}
            className="flex h-14 items-center justify-center rounded-full bg-[var(--caramel)] text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
          >
            Create Your Cake
          </Link>
        </div>
      </div>
    </>
  );
}
