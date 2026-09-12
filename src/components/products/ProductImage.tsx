"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useState } from "react";

import type { Product } from "@/types/product";

type ProductImageProps = {
  product: Pick<Product, "name" | "image" | "category">;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export default function ProductImage({
  product,
  className = "",
  sizes = "(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw",
  priority = false,
}: ProductImageProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (product.image && !imageFailed) {
    return <Image src={product.image} alt={product.name} fill sizes={sizes} priority={priority} onError={() => setImageFailed(true)} className={`object-cover ${className}`} />;
  }

  return (
    <div role="img" aria-label={`${product.name} image unavailable`} className={`absolute inset-0 flex flex-col items-center justify-center bg-[#e6d6c2] text-center text-[var(--cocoa)]/55 ${className}`}>
      <span className="font-script text-4xl text-[var(--caramel)]/70">glaze</span>
      <span className="mt-1 flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.16em]"><Camera size={11} /> {product.name} photo coming soon</span>
    </div>
  );
}
