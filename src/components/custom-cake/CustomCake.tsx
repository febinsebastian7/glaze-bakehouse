import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function CustomCakeBanner() {
  return (
    <section className="pb-20 md:pb-28">
      <div className="container-glaze">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#f7efe5]">
          <div className="grid min-h-[520px] md:grid-cols-2">
            <div className="relative z-10 flex flex-col justify-center p-8 md:p-14 lg:p-20">
              <p className="glaze-eyebrow mb-5 text-[var(--caramel)]">
                Made for your moment
              </p>

              <h2 className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.85] tracking-[-0.045em]">
                Your vision,
                <br />
                our{" "}
                <span className="font-script text-[1.1em] text-[var(--sage)]">
                  creation.
                </span>
              </h2>

              <p className="mt-7 max-w-sm text-sm leading-7 text-[var(--cocoa)]/65">
                Dream it, describe it, and let us turn your celebration into
                something deliciously unforgettable.
              </p>

              <Link
                href="/custom-cake"
                className="mt-8 flex w-fit items-center gap-3 rounded-full bg-[var(--sage)] px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--cocoa)] transition-transform hover:-translate-y-1"
              >
                Start designing
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="relative min-h-[320px]">
              <div className="absolute inset-5 overflow-hidden rounded-[50%_50%_10%_10%]">
                <Image
                  src="/images/cakes/cake-03.webp"
                  alt="Custom Glaze Bakehouse cake"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}