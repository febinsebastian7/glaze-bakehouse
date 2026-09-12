import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/hero/Hero";

import FreshToday from "@/components/home/FreshToday";
import OurCollection from "@/components/home/OurCollection";

import CustomCake from "@/components/custom-cake/CustomCake";
import About from "@/components/about/About";
import Flavours from "@/components/flavours/Flavours";
import Founder from "@/components/founder/Founder";
import Reviews from "@/components/reviews/Reviews";
import FAQ from "@/components/faq/FAQ";
import Footer from "@/components/footer/Footer";


export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--vanilla)]">
      <Navbar />

      <Hero />

      {/* Brand promises */}
      <section className="container-glaze pb-10 md:pb-16">
        <div className="rounded-[1.75rem] border border-[var(--cocoa)]/10 bg-[#f7efe5] px-5 py-8 md:px-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-0">
            {[
              ["Quality", "Ingredients", "Only the best for the best."],
              ["Freshly", "Baked", "Baked fresh every single day."],
              ["Handcrafted", "With Love", "Made with care and passion."],
              ["Custom", "Made", "Your ideas, our creativity."],
            ].map(([title, subtitle, description], index) => (
              <div
                key={title}
                className={`text-center ${
                  index !== 0
                    ? "md:border-l md:border-[var(--cocoa)]/10"
                    : ""
                }`}
              >
                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[var(--caramel)]">
                  {title}
                </p>

                <h3 className="mt-1 font-display text-xl">
                  {subtitle}
                </h3>

                <p className="mx-auto mt-2 max-w-[150px] text-[9px] leading-4 text-[var(--cocoa)]/55">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <FreshToday />

      <OurCollection />

      <CustomCake />

      <About />

      <Flavours />

      <Founder />

      <Reviews />

      <FAQ />

      <Footer />
    </main>
  );
}