const flavours = [
  ["Chocolate", "#4a2e1c"],
  ["Vanilla", "#d1b181"],
  ["Red Velvet", "#a66b62"],
  ["Strawberry", "#ebc79a"],
  ["Pistachio", "#9ebc9e"],
  ["Butterscotch", "#c17b34"],
];

export default function FlavourSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-glaze">
        <div className="text-center">
          <p className="glaze-eyebrow mb-4 text-[var(--caramel)]">
            Find your favourite
          </p>

          <h2 className="glaze-section-title">
            Choose your{" "}
            <span className="font-script text-[var(--caramel)]">
              flavour.
            </span>
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-3">
          {flavours.map(([name, color]) => (
            <button
              key={name}
              className="group flex min-h-28 items-center justify-between rounded-[1.25rem] border border-[var(--cocoa)]/10 bg-[#f7efe5] p-5 text-left transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <span
                  className="mb-3 block h-4 w-4 rounded-full"
                  style={{ background: color }}
                />

                <span className="font-display text-2xl">
                  {name}
                </span>
              </div>

              <span className="text-[var(--cocoa)]/30 transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}