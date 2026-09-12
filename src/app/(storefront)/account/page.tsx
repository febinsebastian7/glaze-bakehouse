import { Heart, MapPin, Package, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import SignOutButton from "@/components/auth/SignOutButton";
import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import PageIntro from "@/components/storefront/PageIntro";
import { getSessionUser } from "@/lib/auth/session";

const accountSections = [
  [UserRound, "Profile", "Your details and communication preferences"],
  [MapPin, "Saved addresses", "Keep your favourite delivery addresses"],
  [Package, "Orders", "Follow current and previous orders"],
  [Heart, "Favourites", "Come back to cakes you loved"],
] as const;

export default async function AccountPage() {
  const user = await getSessionUser();

  return <><Navbar /><main>
    <PageIntro eyebrow="Your Glaze account" title={user ? <>Welcome back, <span className="font-script text-[var(--caramel)]">{user.name?.split(" ")[0] || "friend"}.</span></> : <>A little easier, <span className="font-script text-[var(--caramel)]">every time.</span></>}>
      {user ? `Signed in as ${user.email ?? "your Google account"}.` : "Save the details you reach for most: delivery addresses, order history, favourites and custom cake requests."}
    </PageIntro>
    {user ? <><section className="container-glaze grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-4">{accountSections.map(([Icon, title, description]) => <article key={title} className="rounded-[1.5rem] bg-[var(--cream-light)] p-6"><Icon size={19} className="text-[var(--caramel)]" /><h2 className="mt-5 font-display text-3xl">{title}</h2><p className="mt-3 text-sm leading-6 text-[var(--cocoa)]/60">{description}</p></article>)}</section><section className="container-glaze pb-16"><div className="rounded-[1.75rem] bg-[var(--cocoa)] p-7 text-[var(--cream-light)] md:p-10"><div className="flex items-center gap-4">{user.picture && <Image src={user.picture} alt="Your Google profile" width={56} height={56} className="h-14 w-14 rounded-full border border-white/20 object-cover" />}<div><h2 className="font-display text-4xl">You&apos;re signed in.</h2><p className="mt-1 text-sm text-white/65">{user.email ?? "Your Google account"}</p></div></div><p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">Account data will appear here once the production database is connected.</p><SignOutButton /></div></section></> : <section className="container-glaze pb-16"><div className="rounded-[1.75rem] bg-[var(--cocoa)] p-7 text-[var(--cream-light)] md:p-10"><h2 className="font-display text-4xl">Save the details you reach for most.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">Sign in securely with Google to access saved addresses, orders, favourites and requests when the database is connected.</p><Link href="/login" className="mt-6 inline-block text-[9px] font-semibold uppercase tracking-[.15em] text-[var(--honey)]">Continue with Google →</Link></div></section>}
  </main><Footer /></>;
}
