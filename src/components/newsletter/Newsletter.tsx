import { ArrowRight } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="pb-10">
      <div className="container-glaze">
        <div className="relative overflow-hidden rounded-[2rem] bg-[var(--peach)] px-7 py-14 text-center md:px-16">
          <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full border border-[var(--cocoa)]/20" />

          <div className="absolute -bottom-16 -right-10 h-40 w-40 rounded-full border border-[var(--cocoa)]/20" />

          <p className="glaze-eyebrow text-[var(--cocoa)]/60">
            A little sweetness
          </p>

          <h2 className="mt-4 font-display text-[clamp(3rem,6vw,5rem)] leading-[0.85]">
            Sweet things
            <br />
            straight to your{" "}
            <span className="font-script text-white">
              inbox.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-[var(--cocoa)]/60">
            New flavours, fresh bakes and little moments worth celebrating.
          </p>

          <form className="mx-auto mt-8 flex max-w-md rounded-full border border-[var(--cocoa)]/20 bg-[var(--vanilla)] p-1.5">
            <input
              type="email"
              placeholder="Enter your email"
              className="min-w-0 flex-1 bg-transparent px-5 text-xs outline-none placeholder:text-[var(--cocoa)]/40"
            />

            <button
              type="submit"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--sage)]"
              aria-label="Subscribe"
            >
              <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}