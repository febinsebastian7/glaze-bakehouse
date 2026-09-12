import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import PageIntro from "@/components/storefront/PageIntro";
import { availableFlavours } from "@/data/products";

export default function FlavoursPage() { return <><Navbar /><main><PageIntro eyebrow="Flavour notes" title={<>Find a flavour they’ll <span className="font-script text-[var(--caramel)]">love.</span></>}>This starter list reflects the flavours already used in the current product catalogue. The bakery can manage this list from Admin as its menu evolves.</PageIntro><section className="container-glaze grid grid-cols-2 gap-3 pb-16 sm:grid-cols-3 lg:grid-cols-5">{availableFlavours.map((flavour, index) => <article key={flavour} className={`aspect-square rounded-[1.5rem] p-5 ${["bg-[#5a3724] text-white", "bg-[#f3e2cc]", "bg-[#e9b9b0]", "bg-[#d8b66e]", "bg-[#b8c48b]"][index]}`}><p className="glaze-eyebrow opacity-65">Glaze flavour</p><h2 className="mt-7 font-display text-3xl leading-none">{flavour}</h2></article>)}</section></main><Footer /></> }
