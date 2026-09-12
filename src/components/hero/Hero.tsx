"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative organic shapes */}
      <div className="pointer-events-none absolute -left-32 top-32 h-72 w-72 rounded-full bg-[var(--sage)]/60 blur-[1px]" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[var(--peach)]/70" />

      <div className="container-glaze">
        <div className="grid min-h-[calc(100svh-5rem)] items-center gap-10 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-0 lg:py-0">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10 max-w-xl"
          >
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Baked with love <span className="text-base">♥</span>
            </p>

            <h1 className="font-display text-[clamp(3.5rem,12vw,6.8rem)] leading-[0.82] tracking-[-0.055em] text-[var(--cocoa)]">
              Cake that
              <br />
              makes every
              <br />
              <span className="font-script text-[1.15em] font-normal tracking-normal text-[var(--caramel)]">
                moment
              </span>
              <br />
              special.
            </h1>

            <div className="my-7 h-px w-12 bg-[var(--caramel)]" />

            <p className="max-w-sm text-sm leading-7 text-[var(--cocoa)]/70">
              Artisan cakes crafted with the finest ingredients for your
              sweetest moments.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/cakes">
                Explore Cakes
                <ArrowRight size={15} />
              </Button>

              <Button href="/custom-cake" variant="outline">
                Custom Cake
              </Button>
            </div>
          </motion.div>

          {/* Cake visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="relative min-h-[420px] lg:min-h-[650px]"
          >
            {/* Image backdrop */}
            <div className="absolute inset-4 rounded-[45%_45%_8%_8%] bg-[#f1e8dc]" />

            <div className="absolute right-2 top-10 hidden h-32 w-32 rounded-full border border-[var(--cocoa)]/20 lg:block" />

            <div className="absolute bottom-12 left-0 z-10 hidden h-28 w-28 rounded-full bg-[var(--sage)]/70 lg:block" />

            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative h-full w-full">
                <Image
                  src="/images/hero/hero-cake-cutout.png"
                  alt="Glaze Bakehouse celebration cake"
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 55vw"
                  className="object-contain drop-shadow-[0_25px_35px_rgba(74,46,28,0.18)]"
                />
              </div>
            </div>

            {/* Fresh badge */}
            <div className="absolute right-2 top-1/2 z-20 flex h-24 w-24 -translate-y-1/2 rotate-12 items-center justify-center rounded-full border border-white/60 bg-[var(--peach)]/90 p-4 text-center lg:right-0 lg:h-32 lg:w-32">
              <span className="text-[8px] font-semibold uppercase leading-4 tracking-[0.16em] text-[var(--cocoa)] lg:text-[9px]">
                Made fresh
                <br />
                just for you
                <br />
                ♥
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}