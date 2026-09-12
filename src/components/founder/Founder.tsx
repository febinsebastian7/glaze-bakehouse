import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FounderSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-glaze">
        <div className="grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] bg-[var(--periwinkle)]">
            <div className="absolute inset-8 rounded-[50%_50%_8%_8%] border border-white/30" />

            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div>
                <span className="font-display text-5xl text-white/80">
                  Founder
                </span>

                <p className="mt-3 text-[8px] uppercase tracking-[0.25em] text-white/60">
                  Your real founder photograph goes here
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="glaze-eyebrow mb-5 text-[var(--caramel)]">
              Meet the baker
            </p>

            <h2 className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.84] tracking-[-0.045em]">
              There is a
              <br />
              <span className="font-script text-[var(--sage)]">
                person
              </span>{" "}
              behind
              <br />
              every cake.
            </h2>

            <p className="mt-8 max-w-lg text-sm leading-7 text-[var(--cocoa)]/65">
              Glaze Bakehouse began with a love for baking and a simple
              belief: celebrations deserve something made especially for
              them.
            </p>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--cocoa)]/65">
              From the first whisk to the final flourish, every creation is
              made with intention.
            </p>

            <Link
              href="/founder"
              className="mt-8 inline-flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.18em]"
            >
              Meet the founder
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}