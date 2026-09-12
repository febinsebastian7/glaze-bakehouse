"use client";

import { FormEvent, useState } from "react";

import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import PageIntro from "@/components/storefront/PageIntro";

export default function CustomCakePage() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const sendRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitted(false);
    setMessage("Checking the request…");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/custom-cake-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "Your request could not be sent.");
      event.currentTarget.reset();
      setSubmitted(true);
      setMessage(result.message ?? "Your custom cake request has been received.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your request could not be sent right now.");
    } finally {
      setSubmitting(false);
    }
  };
  return <><Navbar /><main><PageIntro eyebrow="Custom cakes" title={<>Your vision, our <span className="font-script text-[var(--caramel)]">creation.</span></>}>Tell us about the celebration and the feeling you want to create. This is a request rather than an instant purchase, so Glaze can confirm the design and quote with care.</PageIntro><section className="container-glaze pb-16"><form onSubmit={sendRequest} className="grid gap-7 rounded-[2rem] bg-[var(--cream-light)] p-5 sm:p-8 lg:grid-cols-[.75fr_1.25fr]"><div><p className="glaze-eyebrow text-[var(--caramel)]">A little note</p><h2 className="mt-3 font-display text-4xl leading-[.9]">The more we know, the better we can make it.</h2><p className="mt-5 text-sm leading-7 text-[var(--cocoa)]/65">A custom cake request is only confirmed after Glaze replies with availability, design and price. No payment is taken here.</p><div className="mt-8 rounded-2xl bg-white/60 p-4 text-sm leading-6 text-[var(--cocoa)]/65">Your request is saved securely and sent directly to the bakery. You can include a public reference-image link; customer file uploads are not enabled.</div></div><div className="grid gap-3 sm:grid-cols-2"><label><span className="glaze-label">Your name</span><input required name="name" className="glaze-field" /></label><label><span className="glaze-label">WhatsApp number</span><input required name="phone" inputMode="tel" className="glaze-field" /></label><label className="sm:col-span-2"><span className="glaze-label">Email <em className="normal-case tracking-normal">(optional)</em></span><input name="email" type="email" className="glaze-field" /></label><label><span className="glaze-label">Celebration</span><input name="celebration" className="glaze-field" placeholder="Birthday, anniversary…" /></label><label><span className="glaze-label">Preferred date</span><input name="preferredDate" type="date" className="glaze-field" /></label><label><span className="glaze-label">Cake size</span><input name="cakeSize" className="glaze-field" placeholder="e.g. 1 kg" /></label><label><span className="glaze-label">Flavour</span><input name="flavour" className="glaze-field" placeholder="Your preference" /></label><label className="sm:col-span-2"><span className="glaze-label">Colour or theme</span><input name="theme" className="glaze-field" placeholder="Describe the look you have in mind" /></label><label className="sm:col-span-2"><span className="glaze-label">Reference image link <em className="normal-case tracking-normal">(optional)</em></span><input name="referenceImageUrl" type="url" className="glaze-field" placeholder="Paste a public image link if you have one" /></label><label><span className="glaze-label">Message on cake</span><input name="messageOnCake" className="glaze-field" placeholder="Optional" /></label><label><span className="glaze-label">Approximate budget</span><input name="budget" type="number" min="0" className="glaze-field" placeholder="₹" /></label><label className="sm:col-span-2"><span className="glaze-label">Anything else?</span><textarea name="additionalRequirements" className="glaze-field min-h-28 resize-none p-3" placeholder="Share any details that will help us make it yours." /></label><button disabled={submitting || submitted} aria-busy={submitting} className="glaze-primary-button sm:col-span-2 flex h-12 items-center justify-center rounded-full text-[9px] font-semibold uppercase tracking-[.16em] disabled:cursor-wait disabled:opacity-60">{submitting ? "Sending request…" : submitted ? "Request sent" : "Request custom cake"}</button>{message && <p role={submitted ? "status" : "alert"} className={`sm:col-span-2 text-center text-sm leading-6 ${submitted ? "text-[#496a42]" : "text-[var(--cocoa)]/65"}`}>{message}</p>}</div></form></section></main><Footer /></>;
}
