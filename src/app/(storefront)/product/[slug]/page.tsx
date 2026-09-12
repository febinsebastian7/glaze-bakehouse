"use client";

import Link from "next/link";
import { ArrowLeft, Clock3, ShoppingBag } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import ProductImage from "@/components/products/ProductImage";
import QuantityControl from "@/components/products/QuantityControl";
import { useStore } from "@/components/store/StoreProvider";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const { products, productsLoading, cart, addToCart, setCartQuantity } = useStore();
  const product = products.find((item) => item.slug === params.slug);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  if (productsLoading) return <><Navbar /><main className="container-glaze py-28 text-center"><p className="glaze-eyebrow text-[var(--caramel)]">Just a moment</p><h1 className="mt-3 font-display text-5xl">Preparing your treat.</h1></main><Footer /></>;
  if (!product) return <><Navbar /><main className="container-glaze py-28 text-center"><h1 className="font-display text-5xl">This treat is not available.</h1><Link href="/cakes" className="glaze-primary-button mt-7 inline-flex rounded-full px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.15em]">Back to cakes</Link></main><Footer /></>;
  const soldOut = product.availability !== "AVAILABLE";
  const cartItem = cart.find((item) => item.productId === product.id);
  return <><Navbar /><main className="container-glaze py-8 md:py-14"><Link href={product.category === "cake" ? "/cakes" : "/desserts"} className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--cocoa)]/65 hover:text-[var(--caramel)]"><ArrowLeft size={14} /> Back to {product.category === "cake" ? "cakes" : "desserts"}</Link><div className="mt-7 grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16"><div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#e6d6c2] shadow-[0_20px_60px_rgba(74,46,28,.10)]"><ProductImage product={product} sizes="(max-width: 1023px) 100vw, 50vw" priority /></div><div className="flex flex-col justify-center"><p className="glaze-eyebrow text-[var(--caramel)]">{product.category === "cake" ? "Celebration cake" : "Fresh today"}</p><h1 className="mt-4 font-display text-5xl leading-[.88] tracking-[-.045em] md:text-7xl">{product.name}</h1><p className="mt-5 max-w-xl text-base leading-7 text-[var(--cocoa)]/65">{product.description}</p><div className="mt-7 grid grid-cols-2 gap-3 border-y border-[var(--cocoa)]/10 py-5 text-sm">{product.flavour && <div><p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[var(--cocoa)]/45">Flavour</p><p className="mt-1">{product.flavour}</p></div>}{product.size && <div><p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[var(--cocoa)]/45">Starting size</p><p className="mt-1">{product.size}</p></div>}{product.preparationTime && <div className="col-span-2 flex items-center gap-2 text-[var(--cocoa)]/65"><Clock3 size={15} /><span>Pre-order with at least {product.preparationTime} notice.</span></div>}</div><div className="mt-6 flex items-center justify-between"><span className="font-display text-4xl">₹{product.price.toLocaleString("en-IN")}</span><QuantityControl quantity={cartItem?.quantity ?? quantity} onChange={(value) => cartItem ? setCartQuantity(product.id, value) : setQuantity(Math.max(1, value))} /></div><label className="mt-5 block"><span className="mb-2 block text-[8px] font-semibold uppercase tracking-[.14em] text-[var(--cocoa)]/55">A note for the baker (optional)</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="e.g. Please write Happy Birthday Priya" className="glaze-field min-h-24 w-full resize-none p-4" /></label>{cartItem ? <div className="mt-5 flex h-12 items-center justify-center gap-3 rounded-full bg-[var(--cocoa)] text-[10px] font-semibold uppercase tracking-[.16em] text-white"><ShoppingBag size={16} /> Added to your bag</div> : <button type="button" disabled={soldOut} onClick={() => addToCart(product.id, quantity, notes)} className="glaze-primary-button mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-full text-[10px] font-semibold uppercase tracking-[.16em] disabled:cursor-not-allowed disabled:opacity-45"><ShoppingBag size={16} /> {soldOut ? "Currently sold out" : "Add to bag"}</button>}<p className="mt-3 text-center text-[8px] font-semibold uppercase tracking-[.12em] text-[var(--cocoa)]/45">Add cakes and desserts together in one order</p></div></div></main><Footer /></>;
}
