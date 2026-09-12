"use client";

import Link from "next/link";
import ProductCartAction from "@/components/products/ProductCartAction";
import ProductImage from "@/components/products/ProductImage";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.availability !== "AVAILABLE";
  return (
    <article className="group overflow-hidden rounded-[1.4rem] border border-[var(--cocoa)]/10 bg-[var(--cream-light)] transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[1/1.03] overflow-hidden bg-[#e6d6c2]">
        <ProductImage product={product} className="transition-transform duration-500 group-hover:scale-[1.04]" />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.13em] ${soldOut ? "bg-[var(--cocoa)] text-white" : "bg-white/85 text-[var(--cocoa)]"}`}>{soldOut ? "Sold out" : product.freshToday ? "Fresh today" : product.category}</span>
      </Link>
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3"><Link href={`/product/${product.slug}`} className="font-display text-xl leading-none hover:text-[var(--caramel)]">{product.name}</Link><span className="shrink-0 text-sm font-semibold">₹{product.price.toLocaleString("en-IN")}</span></div>
        <p className="mt-2 line-clamp-2 min-h-8 text-[9px] leading-4 text-[var(--cocoa)]/55">{product.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2"><span className="min-w-0 truncate text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--cocoa)]/45">{product.flavour ?? "Handcrafted"}</span><ProductCartAction product={product} /></div>
      </div>
    </article>
  );
}
