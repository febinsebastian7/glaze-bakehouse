"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { Star } from "lucide-react";

import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";

export default function ReviewPage() {
  const params = useParams<{ token: string }>();
  const [rating, setRating] = useState(5);
  const [displayName, setDisplayName] = useState("");
  const [text, setText] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.token, rating, text, displayName, consentToDisplayPhoto: consent }) });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "Review could not be submitted.");
      setMessage("Thank you. Your review has been received and will appear once approved.");
      setText("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  return <><Navbar /><main className="container-glaze max-w-2xl py-12 md:py-20"><form onSubmit={submit} className="rounded-[2rem] bg-[var(--cream-light)] p-5 sm:p-8"><p className="glaze-eyebrow text-[var(--caramel)]">A little thank you</p><h1 className="mt-3 font-display text-5xl leading-[.9]">How was your Glaze moment?</h1><p className="mt-5 text-sm leading-7 text-[var(--cocoa)]/65">Your review is attached to this completed order and will be moderated before public display.</p><fieldset className="mt-7"><legend className="glaze-label">Your rating</legend><div className="mt-3 flex gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className={`grid h-11 w-11 place-items-center rounded-full border transition ${value <= rating ? "border-[var(--caramel)] bg-[var(--caramel)] text-white" : "border-[var(--cocoa)]/15"}`} aria-label={`${value} star${value === 1 ? "" : "s"}`}><Star size={17} fill={value <= rating ? "currentColor" : "none"} /></button>)}</div></fieldset><div className="mt-5 grid gap-3"><label><span className="glaze-label">Display name <em className="normal-case tracking-normal">(optional)</em></span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="glaze-field" placeholder="How should your name appear?" /></label><label><span className="glaze-label">Your review</span><textarea required value={text} onChange={(event) => setText(event.target.value)} className="glaze-field min-h-32 resize-none p-3" placeholder="Tell us what you loved, in your own words." /></label><label className="glaze-check"><input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" /> I’m happy for my name and optional photo to appear with this review.</label></div><div className="mt-5 rounded-xl bg-white/60 p-4 text-xs leading-5 text-[var(--cocoa)]/65">If AI cleanup is configured, it can only correct spelling, grammar, punctuation and basic formatting. Your original review is always retained.</div><button disabled={submitting} className="glaze-primary-button mt-5 flex h-12 w-full items-center justify-center rounded-full text-[9px] font-semibold uppercase tracking-[.15em] disabled:cursor-wait disabled:opacity-60">{submitting ? "Submitting…" : "Submit review"}</button>{message && <p role="status" className="mt-3 text-center text-sm leading-6 text-[var(--cocoa)]/65">{message}</p>}</form></main><Footer /></>;
}
