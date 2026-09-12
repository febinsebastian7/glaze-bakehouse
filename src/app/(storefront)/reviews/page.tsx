"use client";

import { ArrowRight, LoaderCircle, RotateCcw, Star } from "lucide-react";
import Link from "next/link";

import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import PageIntro from "@/components/storefront/PageIntro";
import { useStore } from "@/components/store/StoreProvider";

export default function ReviewsPage() {
  const { reviews, reviewsError, reviewsLoading, refreshPublicReviews } = useStore();
  const published = reviews.filter((review) => review.status === "APPROVED" && (review.cleanedText || review.originalText).trim());

  return <><Navbar /><main><PageIntro eyebrow="Customer reviews" title={<>Made for people, shared in their own <span className="font-script text-[var(--caramel)]">words.</span></>}>Every review is proofread conservatively, then waits for moderation before it appears here.</PageIntro><section className="container-glaze pb-16"><Link href="/write-review" className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--cocoa)] px-5 text-[9px] font-semibold uppercase tracking-[.14em] text-white transition hover:bg-[var(--caramel)]">Write a review <ArrowRight size={14} /></Link>{reviewsLoading ? <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-[1.5rem] bg-[var(--cream-light)]" />)}</div> : reviewsError ? <div className="rounded-[2rem] bg-[var(--cream-light)] px-6 py-20 text-center"><LoaderCircle size={28} className="mx-auto text-[var(--caramel)]" /><h2 className="mt-5 font-display text-4xl">The kind words need a moment.</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--cocoa)]/60">{reviewsError}</p><button type="button" onClick={() => { void refreshPublicReviews(); }} className="mt-6 inline-flex min-h-11 items-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-[var(--caramel)]"><RotateCcw size={14} /> Try again</button></div> : published.length ? <div className="grid gap-4 md:grid-cols-3">{published.map((review) => <article key={review.id} className="rounded-[1.5rem] border border-[var(--cocoa)]/10 bg-[var(--cream-light)] p-6"><div className="flex gap-1 text-[var(--caramel)]">{Array.from({ length: review.rating }).map((_, index) => <Star key={index} size={14} fill="currentColor" />)}</div><blockquote className="mt-6 font-display text-2xl leading-tight">“{review.cleanedText || review.originalText}”</blockquote><p className="mt-7 text-[8px] font-semibold uppercase tracking-[.15em] text-[var(--cocoa)]/50">— {review.displayName || review.customerName}</p></article>)}</div> : <div className="rounded-[2rem] bg-[var(--cream-light)] px-6 py-20 text-center"><Star size={28} className="mx-auto text-[var(--caramel)]" /><h2 className="mt-5 font-display text-4xl">Real reviews are on their way.</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--cocoa)]/60">Glaze only adds genuine reviews after a customer chooses to share one and the team approves it.</p></div>}</section></main><Footer /></>;
}
