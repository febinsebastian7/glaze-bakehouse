"use client";

import { Star } from "lucide-react";
import { FormEvent, useState } from "react";

export default function WriteReviewForm({ profileName }: { profileName?: string | null }) {
  const signedInName = profileName?.trim() ?? "";
  const [rating, setRating] = useState(5);
  const [name, setName] = useState(signedInName);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, customerName: name, text }),
      });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "Review could not be submitted.");
      setText("");
      setMessage("Thank you. Your review is with the Glaze team and will appear once approved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  return <form onSubmit={submit} className="rounded-[2rem] bg-[var(--cream-light)] p-5 shadow-[0_16px_42px_rgba(74,46,28,.08)] sm:p-8"><p className="glaze-eyebrow text-[var(--caramel)]">A little note from you</p><h1 className="mt-3 font-display text-5xl leading-[.9]">How was your Glaze moment?</h1><p className="mt-5 max-w-xl text-sm leading-7 text-[var(--cocoa)]/65">Your words are carefully proofread for spelling and grammar without changing their meaning, then reviewed by our team before they are shared.</p><fieldset className="mt-7"><legend className="glaze-label">Your rating</legend><div className="mt-3 flex gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className={`grid h-11 w-11 place-items-center rounded-full border transition ${value <= rating ? "border-[var(--caramel)] bg-[var(--caramel)] text-white" : "border-[var(--cocoa)]/15 bg-white/40 hover:border-[var(--caramel)]"}`} aria-label={`${value} star${value === 1 ? "" : "s"}`} aria-pressed={value === rating}><Star size={17} fill={value <= rating ? "currentColor" : "none"} /></button>)}</div></fieldset><div className="mt-6 grid gap-4">{signedInName ? <div><span className="glaze-label">Your name</span><p className="glaze-field flex min-h-11 items-center bg-white/40 text-[var(--cocoa)]/70">{signedInName}</p><p className="mt-2 text-xs leading-5 text-[var(--cocoa)]/55">Using the name on your signed-in profile.</p></div> : <label><span className="glaze-label">Your name</span><input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="glaze-field" placeholder="How should we credit your review?" /></label>}<label><span className="glaze-label">Your review</span><textarea required maxLength={2000} value={text} onChange={(event) => setText(event.target.value)} className="glaze-field min-h-36 resize-none p-3" placeholder="Tell us what you loved, in your own words." /><span className="mt-2 block text-right text-[8px] font-semibold uppercase tracking-[.12em] text-[var(--cocoa)]/45">{text.length}/2000</span></label></div><button disabled={submitting} className="glaze-primary-button mt-5 flex h-12 w-full items-center justify-center rounded-full text-[9px] font-semibold uppercase tracking-[.15em] disabled:cursor-wait disabled:opacity-60">{submitting ? "Sending your review…" : "Submit review"}</button>{message && <p role="status" className="mt-4 rounded-xl bg-white/60 px-4 py-3 text-center text-sm leading-6 text-[var(--cocoa)]/70">{message}</p>}</form>;
}
