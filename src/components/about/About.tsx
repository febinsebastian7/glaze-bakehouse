import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function AboutGlaze() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-glaze">
        <div className="grid overflow-hidden rounded-[2rem] bg-[var(--sage)] md:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden">
            <div className="absolute inset-8 rounded-[50%_50%_10%_10%] bg-[var(--vanilla)]" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="font-display text-6xl tracking-[-0.05em]">
                  glaze
                </span>

                <p className="mt-3 text-[8px] uppercase tracking-[0.35em]">
                  baked with love
                </p>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 h-20 w-20 rounded-full border border-[var(--cocoa)]/30" />
            <div className="absolute right-10 top-10 h-12 w-12 rounded-full bg-[var(--peach)]" />
          </div>

          <div className="flex flex-col justify-center p-8 md:p-14 lg:p-20">
            <p className="glaze-eyebrow mb-5 text-[var(--cocoa)]/60">
              A little about us
            </p>

            <h2 className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.85] tracking-[-0.045em]">
              Baked for
              <br />
              <span className="font-script text-[var(--cream-white)]">
                real moments.
              </span>
            </h2>

            <p className="mt-7 max-w-md text-sm leading-7 text-[var(--cocoa)]/70">
              At Glaze Bakehouse, every cake is made with thoughtful
              ingredients, careful hands and a little extra love.
            </p>

            <Link
              href="/about"
              className="mt-8 flex w-fit items-center gap-3 rounded-full border border-[var(--cocoa)]/30 px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.16em] transition-all hover:bg-[var(--cocoa)] hover:text-[var(--vanilla)]"
            >
              Our story
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}