import Link from "next/link";

import GlazeWordmark from "@/components/brand/GlazeWordmark";

export default function Footer() {
  return (
    <footer className="mt-10 bg-[var(--charcoal)] text-[var(--vanilla)]">
      <div className="container-glaze py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <GlazeWordmark size="default" inverse />

            <p className="mt-7 max-w-xs text-sm leading-6 text-[var(--vanilla)]/60">
              Baked to perfection, made to be remembered.
            </p>
          </div>

          <div>
            <p className="mb-5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--peach)]">
              Explore
            </p>

            <div className="flex flex-col gap-3 text-xs text-[var(--vanilla)]/65">
              <Link href="/cakes">Cakes</Link>
              <Link href="/desserts">Daily Desserts</Link>
              <Link href="/custom-cake">Custom Cakes</Link>
              <Link href="/about">About</Link>
            </div>
          </div>

          <div>
            <p className="mb-5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--peach)]">
              Customer care
            </p>

            <div className="flex flex-col gap-3 text-xs text-[var(--vanilla)]/65">
              <Link href="/faq">FAQs</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/write-review">Write a review</Link>
              <Link href="/delivery">Shipping & Delivery</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
            </div>
          </div>

          <div>
            <p className="mb-5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--peach)]">
              Follow us
            </p>

            <div className="flex gap-3">
              {["Instagram", "Facebook", "WhatsApp"].map((item) => (
                <a
                  href="#"
                  key={item}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--vanilla)]/20 text-[8px]"
                >
                  {item.slice(0, 2)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-[var(--vanilla)]/10 pt-6 text-center text-[8px] uppercase tracking-[0.12em] text-[var(--vanilla)]/40">
          © {new Date().getFullYear()} Glaze Bakehouse. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
