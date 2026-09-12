"use client";

import Link from "next/link";
import { LoaderCircle, RotateCcw, Star } from "lucide-react";

import { useStore } from "@/components/store/StoreProvider";

export default function ReviewsSection() {
  const { reviews, reviewsError, reviewsLoading, refreshPublicReviews } = useStore();
  const publishedReviews = reviews.filter((review) => review.status === "APPROVED" && (review.cleanedText || review.originalText).trim()).slice(0, 3);
  return (
    <section className="bg-[#f7efe5] py-20 md:py-28">
      <div className="container-glaze">
        <div className="text-center">
          <p className="glaze-eyebrow mb-4 text-[var(--caramel)]">
            Kind words
          </p>

          <h2 className="glaze-section-title">
            Loved by{" "}
            <span className="font-script text-[var(--caramel)]">
              sweet
            </span>{" "}
            people.
          </h2>
        </div>

        {reviewsLoading ? <div className="mt-12 grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-[1.5rem] bg-[var(--vanilla)]" />)}</div> : reviewsError ? <div className="mx-auto mt-10 max-w-xl rounded-[1.5rem] border border-dashed border-[var(--cocoa)]/20 bg-[var(--vanilla)] px-6 py-10 text-center"><LoaderCircle size={22} className="mx-auto text-[var(--caramel)]" /><p className="mt-4 font-display text-2xl">We&apos;re refreshing the kind words.</p><p className="mt-2 text-sm leading-6 text-[var(--cocoa)]/60">{reviewsError}</p><button type="button" onClick={() => { void refreshPublicReviews(); }} className="mt-5 inline-flex min-h-11 items-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-[var(--caramel)]"><RotateCcw size={14} /> Try again</button></div> : publishedReviews.length ? <div className="mt-12 grid gap-4 md:grid-cols-3">
          {publishedReviews.map((review) => (
            <article
              key={review.id}
              className="rounded-[1.5rem] border border-[var(--cocoa)]/10 bg-[var(--vanilla)] p-7 md:p-9"
            >
              <div className="flex gap-1 text-[var(--caramel)]">{Array.from({ length: review.rating }).map((_, index) => <Star key={index} size={14} fill="currentColor" />)}</div>

              <blockquote className="mt-7 font-display text-2xl leading-tight">
                “{review.cleanedText || review.originalText}”
              </blockquote>

              <p className="mt-8 text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--cocoa)]/50">
                — {review.displayName || review.customerName}
              </p>
            </article>
          ))}
        </div> : <div className="mx-auto mt-10 max-w-xl rounded-[1.5rem] border border-dashed border-[var(--cocoa)]/20 bg-[var(--vanilla)] px-6 py-10 text-center"><p className="font-display text-2xl">Real customer reviews will appear here.</p><p className="mt-2 text-sm leading-6 text-[var(--cocoa)]/60">Glaze only publishes genuine, moderated reviews from completed orders.</p><Link href="/reviews" className="mt-5 inline-block text-[9px] font-semibold uppercase tracking-[.14em] text-[var(--caramel)]">How reviews work →</Link></div>}
      </div>
    </section>
  );
}
