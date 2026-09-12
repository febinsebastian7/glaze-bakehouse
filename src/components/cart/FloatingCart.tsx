"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import ProductImage from "@/components/products/ProductImage";
import { useStore } from "@/components/store/StoreProvider";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function FloatingCart() {
  const { cartCount, cartItems, total, cartOpen } = useStore();
  const firstItem = cartItems[0];

  if (!cartCount || !firstItem || cartOpen) return null;

  return (
    <Link
      href="/cart"
      aria-label={`View bag with ${cartCount} ${cartCount === 1 ? "item" : "items"}, total ${money(total)}`}
      className="fixed bottom-4 left-1/2 z-30 flex w-[min(calc(100%-2rem),22rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/30 bg-[var(--cocoa)]/95 px-3 py-2.5 text-[var(--cream-light)] shadow-[0_14px_34px_rgba(74,46,28,.28)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 focus-visible:-translate-y-1 md:bottom-6"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#e6d6c2]">
        <ProductImage product={firstItem.product} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[.13em] text-[var(--honey)]"><ShoppingBag size={12} /> {cartCount} {cartCount === 1 ? "item" : "items"}</span>
        <span className="mt-0.5 block font-display text-xl leading-none">{money(total)}</span>
      </div>
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}
