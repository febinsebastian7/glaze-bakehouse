export default function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return <section className="container-glaze pb-9 pt-12 md:pb-12 md:pt-20"><p className="glaze-eyebrow text-[var(--caramel)]">{eyebrow}</p><h1 className="mt-4 max-w-4xl font-display text-5xl leading-[.88] tracking-[-.045em] md:text-7xl">{title}</h1>{children && <div className="mt-5 max-w-2xl text-sm leading-7 text-[var(--cocoa)]/65">{children}</div>}</section>;
}
