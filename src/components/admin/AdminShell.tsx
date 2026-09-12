"use client";

import Link from "next/link";
import { CakeSlice, ClipboardList, Flower2, LayoutDashboard, Menu, MoreHorizontal, PackageOpen, Settings, Sparkles, Star, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import SessionAvatar from "@/components/auth/SessionAvatar";
import GlazeWordmark from "@/components/brand/GlazeWordmark";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/cakes", label: "Cakes", icon: CakeSlice },
  { href: "/admin/desserts", label: "Desserts", icon: Sparkles },
  { href: "/admin/fresh-today", label: "Fresh Today", icon: PackageOpen },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/custom-cakes", label: "Custom cake requests", icon: Flower2 },
  { href: "/admin/flavours", label: "Flavours", icon: PackageOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const mobileLinks = [links[0], links[4], links[1], links[3], links[5]];

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <nav className="grid gap-1" aria-label="Admin navigation">
    {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={onNavigate} className={`flex min-h-12 items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${pathname === href ? "bg-white/14 text-white shadow-sm" : "text-white/65 hover:bg-white/8 hover:text-white"}`}><Icon size={17} strokeWidth={1.7} />{label}</Link>)}
  </nav>;
}

function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return <aside className="h-fit rounded-[1.75rem] bg-[var(--cocoa)] p-3 text-[var(--cream-light)]"><p className="px-3 pb-3 pt-2 text-[8px] font-semibold uppercase tracking-[.17em] text-[var(--honey)]">Bakehouse workspace</p><Navigation onNavigate={onNavigate} /><div className="mt-5 rounded-2xl border border-white/10 px-3 py-3"><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[var(--honey)]">Mobile workspace</p><p className="mt-2 text-xs leading-5 text-white/55">Your most-used sections stay at the bottom of the screen for quick access.</p></div></aside>;
}

function MobileNavigation({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();
  const isMore = !mobileLinks.some(({ href }) => pathname === href);

  return <nav className="fixed inset-x-3 bottom-3 z-[60] grid grid-cols-6 rounded-[1.35rem] border border-[var(--cocoa)]/10 bg-[var(--cream-white)]/95 p-1.5 shadow-[0_18px_45px_rgba(74,46,28,.18)] backdrop-blur lg:hidden" aria-label="Quick admin navigation">
    {mobileLinks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[7px] font-semibold uppercase tracking-[.08em] transition ${pathname === href ? "bg-[var(--cocoa)] text-white" : "text-[var(--cocoa)]/55"}`}><Icon size={17} strokeWidth={1.8} /><span className="max-w-full truncate">{label === "Fresh Today" ? "Fresh" : label}</span></Link>)}
    <button type="button" onClick={onMore} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[7px] font-semibold uppercase tracking-[.08em] ${isMore ? "bg-[var(--cocoa)] text-white" : "text-[var(--cocoa)]/55"}`}><MoreHorizontal size={19} strokeWidth={1.8} /><span>More</span></button>
  </nav>;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return <main className="min-h-screen bg-[#f4ebdf] pb-24 lg:pb-0"><header className="sticky top-0 z-50 border-b border-[var(--cocoa)]/10 bg-[var(--cream-white)]/95 backdrop-blur"><div className="container-glaze flex h-[68px] items-center justify-between"><Link href="/" aria-label="Glaze Bakehouse home" className="text-[var(--cocoa)]"><GlazeWordmark size="compact" subtitle="Admin" /></Link><div className="flex items-center gap-3"><Link href="/" className="hidden text-[8px] font-semibold uppercase tracking-[.15em] text-[var(--cocoa)]/60 hover:text-[var(--caramel)] sm:block">View storefront</Link><SessionAvatar /><button type="button" onClick={() => setMenuOpen(true)} aria-label="Open admin navigation" aria-expanded={menuOpen} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--cocoa)]/15 lg:hidden"><Menu size={18} /></button></div></div></header><div className="container-glaze grid gap-5 py-4 sm:py-6 lg:grid-cols-[225px_1fr]"><div className="hidden lg:block"><AdminSidebar /></div><section className="min-w-0">{children}</section></div><MobileNavigation onMore={() => setMenuOpen(true)} /><div className={`fixed inset-0 z-[70] lg:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!menuOpen}><button type="button" aria-label="Close admin navigation" onClick={() => setMenuOpen(false)} className={`absolute inset-0 bg-[var(--cocoa)]/30 backdrop-blur-[2px] transition-opacity ${menuOpen ? "opacity-100" : "opacity-0"}`} /><aside className={`absolute inset-y-0 left-0 flex w-[min(88vw,22rem)] flex-col overflow-y-auto bg-[#f4ebdf] p-4 shadow-2xl transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}><div className="mb-5 flex items-center justify-between px-2"><GlazeWordmark size="compact" subtitle="Admin" /><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close admin navigation" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--cocoa)]/15"><X size={18} /></button></div><AdminSidebar onNavigate={() => setMenuOpen(false)} /><Link href="/" onClick={() => setMenuOpen(false)} className="mt-4 text-center text-[8px] font-semibold uppercase tracking-[.15em] text-[var(--cocoa)]/60">View storefront</Link></aside></div></main>;
}
