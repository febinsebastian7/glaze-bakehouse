"use client";

import { Plus } from "lucide-react";

import QuantityControl from "@/components/products/QuantityControl";
import { useStore } from "@/components/store/StoreProvider";
import type { Product } from "@/types/product";

type ProductCartActionProps = {
  product: Product;
  fullWidth?: boolean;
};

/** Keeps the add/quantity interaction identical wherever a product is shown. */
export default function ProductCartAction({ product, fullWidth = false }: ProductCartActionProps) {
  const { cart, addToCart, setCartQuantity } = useStore();
  const cartItem = cart.find((item) => item.productId === product.id);

  if (product.availability !== "AVAILABLE") {
    return <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--cocoa)]/45">Sold out</span>;
  }

  if (cartItem) {
    return <QuantityControl compact={!fullWidth} quantity={cartItem.quantity} onChange={(quantity) => setCartQuantity(product.id, quantity)} />;
  }

  return (
    <button
      type="button"
      onClick={() => addToCart(product.id)}
      className={`flex h-9 items-center justify-center gap-1.5 rounded-full bg-[var(--cocoa)] px-3 text-[8px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--caramel)] ${fullWidth ? "w-full" : ""}`}
    >
      <Plus size={12} /> Add to cart
    </button>
  );
}
