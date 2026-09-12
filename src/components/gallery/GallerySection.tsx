export default function GallerySection() {
  return (
    <section className="pb-20 md:pb-28">
      <div className="container-glaze">
        <div className="mb-10 text-center">
          <p className="glaze-eyebrow mb-4 text-[var(--caramel)]">
            From our kitchen
          </p>

          <h2 className="glaze-section-title">
            Follow the{" "}
            <span className="font-script text-[var(--sage)]">
              sweetness.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="aspect-square rounded-[1.5rem] bg-[var(--sage)]" />
          <div className="aspect-square rounded-[1.5rem] bg-[var(--peach)] md:translate-y-8" />
          <div className="aspect-square rounded-[1.5rem] bg-[var(--periwinkle)]" />
          <div className="aspect-square rounded-[1.5rem] bg-[var(--honey)] md:translate-y-8" />
        </div>

        <div className="mt-8 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--cocoa)]/50">
            @glazebakehouse
          </p>
        </div>
      </div>
    </section>
  );
}