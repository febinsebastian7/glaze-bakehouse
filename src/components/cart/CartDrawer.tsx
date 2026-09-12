"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";

import ProductImage from "@/components/products/ProductImage";
import QuantityControl from "@/components/products/QuantityControl";
import { useStore } from "@/components/store/StoreProvider";

const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cartItems, setCartQuantity, removeFromCart, subtotal, deliveryCharge, total } = useStore();
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!cartOpen) return;

    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [cartOpen, setCartOpen]);

  return <>
    <button type="button" tabIndex={cartOpen ? 0 : -1} aria-label="Close shopping bag" onClick={() => setCartOpen(false)} className={`fixed inset-0 z-[60] bg-[var(--cocoa)]/30 backdrop-blur-[2px] transition-opacity ${cartOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} />
    <aside role="dialog" aria-modal="true" aria-labelledby="shopping-bag-title" aria-hidden={!cartOpen} className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-[430px] flex-col bg-[var(--cream-white)] shadow-2xl transition-transform duration-500 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between border-b border-[var(--cocoa)]/10 px-6 py-5"><div className="flex items-center gap-3"><ShoppingBag size={18} /><div><p id="shopping-bag-title" className="font-display text-2xl leading-none">Your bag</p><p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[var(--cocoa)]/50">One order, all your treats</p></div></div><button ref={closeButton} aria-label="Close bag" onClick={() => setCartOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--cocoa)]/10"><X size={17} /></button></div>
      {cartItems.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><ShoppingBag size={32} strokeWidth={1} className="text-[var(--caramel)]" /><h2 className="mt-5 font-display text-3xl">Your bag is waiting.</h2><p className="mt-3 max-w-60 text-sm leading-6 text-[var(--cocoa)]/60">Pick a cake, dessert, or both — they’ll check out together.</p><Link href="/cakes" onClick={() => setCartOpen(false)} className="glaze-primary-button mt-7 rounded-full px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.15em]">Explore cakes</Link></div> : <>
        <div className="flex-1 overflow-y-auto px-6 py-5">{cartItems.map(({ product, quantity }) => <div key={product.id} className="flex gap-3 border-b border-[var(--cocoa)]/10 py-4 first:pt-0"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#e6d6c2]"><ProductImage product={product} /></div><div className="min-w-0 flex-1"><div className="flex gap-2"><p className="font-display text-lg leading-none">{product.name}</p><button onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.name}`} className="ml-auto text-[var(--cocoa)]/45 hover:text-[var(--caramel)]"><Trash2 size={15} /></button></div><p className="mt-1 text-[9px] text-[var(--cocoa)]/55">{formatPrice(product.price)} each</p><div className="mt-3 flex items-center justify-between"><QuantityControl compact quantity={quantity} onChange={(value) => setCartQuantity(product.id, value)} /><span className="text-sm font-semibold">{formatPrice(product.price * quantity)}</span></div></div></div>)}</div>
        <div className="border-t border-[var(--cocoa)]/10 px-6 py-5"><div className="space-y-2 text-sm text-[var(--cocoa)]/65"><div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="flex justify-between"><span>Delivery</span><span>{formatPrice(deliveryCharge)}</span></div></div><div className="mt-4 flex justify-between border-t border-[var(--cocoa)]/10 pt-4 font-display text-2xl"><span>Total</span><span>{formatPrice(total)}</span></div><Link href="/checkout" onClick={() => setCartOpen(false)} className="glaze-primary-button mt-5 flex h-12 items-center justify-center gap-2 rounded-full text-[9px] font-semibold uppercase tracking-[0.16em]">Checkout <ArrowRight size={14} /></Link><Link href="/cart" onClick={() => setCartOpen(false)} className="mt-3 block text-center text-[8px] font-semibold uppercase tracking-[0.15em] text-[var(--cocoa)]/60 hover:text-[var(--caramel)]">View and edit bag</Link></div>
      </>}
    </aside>
  </>;
}
