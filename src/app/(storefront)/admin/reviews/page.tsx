"use client";

import { Check, EyeOff, LoaderCircle, MessageSquareText, Sparkles, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import AdminShell from "@/components/admin/AdminShell";
import { useStore } from "@/components/store/StoreProvider";
import type { ReviewRecord } from "@/types/product";

function ReviewStatus({ status }: { status: ReviewRecord["status"] }) {
  const labels = { PENDING: "Needs approval", APPROVED: "Published", REJECTED: "Rejected" };
  const styles = { PENDING: "bg-[#fff0d6] text-[#94601e]", APPROVED: "bg-[#dfead9] text-[#4e7448]", REJECTED: "bg-[#f2ded6] text-[#9b4e35]" };
  return <span className={`rounded-full px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[.11em] ${styles[status]}`}>{labels[status]}</span>;
}

export default function AdminReviewsPage() {
  const { reviews, updateReview, deleteReview, refreshAdminReviews } = useStore();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);

  useEffect(() => {
    void refreshAdminReviews().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Reviews could not be loaded.")).finally(() => setLoading(false));
  }, [refreshAdminReviews]);

  const run = (id: string, action: () => Promise<void>) => {
    setWorkingId(id);
    setMessage("");
    void action().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Review action could not be completed.")).finally(() => setWorkingId(null));
  };

  const pendingCount = reviews.filter((review) => review.status === "PENDING").length;

  return <AdminShell><div className="space-y-4 sm:space-y-5"><section className="rounded-[1.75rem] bg-[var(--cream-white)] p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="glaze-eyebrow text-[var(--caramel)]">Customer reviews</p><h1 className="mt-2 font-display text-4xl leading-[.9] sm:text-5xl">Real words, carefully handled.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--cocoa)]/60">Every review remains private until you publish it. Both the customer&apos;s original wording and the conservative AI cleanup stay visible here.</p></div><div className="rounded-2xl bg-[#f4ebdf] px-4 py-3"><p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[var(--cocoa)]/50">Needs approval</p><p className="mt-1 font-display text-3xl">{pendingCount}</p></div></div>{message && <p role="status" className="mt-5 rounded-2xl bg-red-50 p-3 text-sm leading-6 text-red-800">{message}</p>}</section>
    {loading ? <div className="flex min-h-48 items-center justify-center rounded-[1.75rem] bg-[var(--cream-white)] text-sm text-[var(--cocoa)]/60"><LoaderCircle size={19} className="mr-2 animate-spin text-[var(--caramel)]" />Loading reviews…</div> : reviews.length ? <div className="space-y-3">{reviews.map((review) => <article key={review.id} className="rounded-[1.55rem] bg-[var(--cream-white)] p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><ReviewStatus status={review.status} />{review.featured && <span className="rounded-full bg-[var(--cocoa)] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[.11em] text-white">Featured</span>}</div><h2 className="mt-3 font-display text-3xl leading-none">{review.displayName || review.customerName}</h2><div className="mt-2 flex gap-1 text-[var(--caramel)]">{Array.from({ length: review.rating }).map((_, index) => <Star key={index} size={14} fill="currentColor" />)}</div></div><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[var(--cocoa)]/45">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div><div className="mt-4 grid gap-3 lg:grid-cols-2"><section className="rounded-2xl border border-[var(--cocoa)]/9 p-3.5"><p className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[.12em] text-[var(--cocoa)]/50"><MessageSquareText size={13} />Original</p><p className="mt-2 text-sm leading-6 text-[var(--cocoa)]/78">{review.originalText || "No review text yet."}</p></section><section className="rounded-2xl bg-[#f4ebdf] p-3.5"><p className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[.12em] text-[var(--caramel)]"><Sparkles size={13} />Cleaned for readability</p><p className="mt-2 text-sm leading-6 text-[var(--cocoa)]/78">{review.cleanedText || review.originalText || "Awaiting a customer review."}</p><p className="mt-2 text-[8px] font-semibold uppercase tracking-[.1em] text-[var(--cocoa)]/42">{review.cleanupProvider?.startsWith("openai:") ? "OpenAI copy edit" : "Original text retained"}</p></section></div><div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{review.status === "APPROVED" ? <button disabled={workingId === review.id} onClick={() => run(review.id, () => updateReview(review.id, { status: "PENDING" }))} className="admin-action min-h-11 justify-center sm:min-w-28"><EyeOff size={14} />Unpublish</button> : <button disabled={workingId === review.id} onClick={() => run(review.id, () => updateReview(review.id, { status: "APPROVED" }))} className="admin-action min-h-11 justify-center sm:min-w-28"><Check size={14} />Publish</button>}<button disabled={workingId === review.id || review.status === "REJECTED"} onClick={() => run(review.id, () => updateReview(review.id, { status: "REJECTED" }))} className="admin-action min-h-11 justify-center sm:min-w-24"><X size={14} />Reject</button><button disabled={workingId === review.id} onClick={() => run(review.id, () => updateReview(review.id, { featured: !review.featured }))} className={`admin-action min-h-11 justify-center sm:min-w-24 ${review.featured ? "border-[var(--caramel)] text-[var(--caramel)]" : ""}`}><Star size={14} />{review.featured ? "Featured" : "Feature"}</button><button disabled={workingId === review.id} onClick={() => run(review.id, () => deleteReview(review.id))} className="admin-action min-h-11 justify-center text-red-700 hover:border-red-500 hover:text-red-700 sm:min-w-24"><Trash2 size={14} />Delete</button></div></article>)}</div> : <div className="rounded-[1.75rem] bg-[var(--cream-white)] px-5 py-16 text-center"><Star size={28} className="mx-auto text-[var(--caramel)]" /><h2 className="mt-4 font-display text-3xl">No reviews to moderate yet.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--cocoa)]/60">A secure review invitation is created when an order is marked delivered. Submitted reviews will appear here for approval.</p></div>}</div></AdminShell>;
}
