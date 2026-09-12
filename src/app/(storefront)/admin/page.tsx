"use client";

import Link from "next/link";
import { ArrowRight, CakeSlice, CheckCircle2, ClipboardList, Clock3, PackageCheck, Sparkles, Star, TrendingUp, Truck } from "lucide-react";
import { useEffect, useState } from "react";

import AdminShell from "@/components/admin/AdminShell";
import { useStore } from "@/components/store/StoreProvider";
import type { OrderStatus } from "@/types/product";

const formatMoney = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

const statuses: Array<{ label: string; status: OrderStatus; icon: typeof Clock3 }> = [
  { label: "Pending", status: "PENDING_PAYMENT", icon: Clock3 },
  { label: "Preparing", status: "PREPARING", icon: CakeSlice },
  { label: "Ready", status: "READY_FOR_PICKUP", icon: PackageCheck },
  { label: "Out", status: "OUT_FOR_DELIVERY", icon: Truck },
  { label: "Done", status: "DELIVERED", icon: CheckCircle2 },
];

export default function AdminPage() {
  const { orders, products, reviews, refreshAdminOrders, refreshAdminProducts, refreshAdminReviews } = useStore();
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    void Promise.all([refreshAdminOrders(), refreshAdminProducts(), refreshAdminReviews()]).catch(() => setLoadError("Some dashboard details could not be refreshed. Pull down or try again shortly."));
  }, [refreshAdminOrders, refreshAdminProducts, refreshAdminReviews]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toDateString();
  const todaysOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === today);
  const paidToday = todaysOrders.filter((order) => order.paymentStatus === "PAID");
  const revenue = paidToday.reduce((sum, order) => sum + order.total, 0);
  const needsAttention = orders.filter((order) => ["PENDING_PAYMENT", "ORDER_CONFIRMED", "PREPARING", "BAKING", "PACKED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"].includes(order.status));
  const freshToday = products.filter((product) => product.freshToday && product.availability === "AVAILABLE");
  const newReviews = reviews.filter((review) => review.status === "PENDING");

  return <AdminShell><div className="space-y-4 sm:space-y-5">
    <section className="overflow-hidden rounded-[1.8rem] bg-[var(--cocoa)] px-5 py-6 text-[var(--cream-light)] shadow-[0_16px_42px_rgba(74,46,28,.13)] sm:px-7 sm:py-8"><p suppressHydrationWarning className="glaze-eyebrow text-[var(--honey)]">{greeting}, Glaze team</p><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-[2.55rem] leading-[.9] sm:text-5xl">Today at Glaze.</h1><p className="mt-3 max-w-md text-sm leading-6 text-white/62">Your live bakery snapshot, organised around what needs attention now.</p></div><Link href="/admin/orders" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-[9px] font-semibold uppercase tracking-[.13em] text-white">Open orders <ArrowRight size={14} /></Link></div><div className="mt-6 grid grid-cols-3 divide-x divide-white/12 rounded-2xl bg-white/7"><div className="p-3 sm:p-4"><p className="text-[7px] font-semibold uppercase tracking-[.13em] text-white/55">Revenue</p><p className="mt-2 font-display text-2xl sm:text-3xl">{formatMoney(revenue)}</p></div><div className="p-3 sm:p-4"><p className="text-[7px] font-semibold uppercase tracking-[.13em] text-white/55">Orders</p><p className="mt-2 font-display text-2xl sm:text-3xl">{todaysOrders.length}</p></div><div className="p-3 sm:p-4"><p className="text-[7px] font-semibold uppercase tracking-[.13em] text-white/55">To action</p><p className="mt-2 font-display text-2xl sm:text-3xl">{needsAttention.length}</p></div></div></section>

    {loadError && <p role="status" className="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">{loadError}</p>}

    <section className="rounded-[1.55rem] bg-[var(--cream-white)] p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><p className="glaze-eyebrow text-[var(--caramel)]">Order status</p><h2 className="mt-1 font-display text-3xl">What&apos;s moving</h2></div><Link href="/admin/orders" className="text-[8px] font-semibold uppercase tracking-[.13em] text-[var(--caramel)]">All orders</Link></div><div className="mt-4 grid grid-cols-5 gap-2">{statuses.map(({ label, status, icon: Icon }) => <Link key={status} href="/admin/orders" className="rounded-2xl bg-[#f4ebdf] p-2.5 text-center transition hover:bg-[#ebdfd0]"><Icon size={15} className="mx-auto text-[var(--caramel)]" /><p className="mt-2 font-display text-xl leading-none">{orders.filter((order) => order.status === status).length}</p><p className="mt-1 text-[7px] font-semibold uppercase tracking-[.08em] text-[var(--cocoa)]/55">{label}</p></Link>)}</div></section>

    <section className="rounded-[1.55rem] bg-[var(--cream-white)] p-4 sm:p-5"><p className="glaze-eyebrow text-[var(--caramel)]">Quick actions</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{[{ label: "Add cake", href: "/admin/cakes", icon: CakeSlice }, { label: "Add dessert", href: "/admin/desserts", icon: Sparkles }, { label: "Fresh Today", href: "/admin/fresh-today", icon: PackageCheck }, { label: "Reviews", href: "/admin/reviews", icon: Star }].map(({ label, href, icon: Icon }) => <Link key={href} href={href} className="flex min-h-14 items-center gap-2 rounded-2xl border border-[var(--cocoa)]/10 px-3 text-sm font-medium transition hover:border-[var(--caramel)] hover:text-[var(--caramel)]"><Icon size={17} strokeWidth={1.7} />{label}</Link>)}</div></section>

    <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><section className="rounded-[1.55rem] bg-[var(--cream-white)] p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><p className="glaze-eyebrow text-[var(--caramel)]">Today&apos;s queue</p><h2 className="mt-1 font-display text-3xl">Orders to make</h2></div><ClipboardList size={20} className="text-[var(--caramel)]" /></div>{needsAttention.length ? <div className="mt-4 divide-y divide-[var(--cocoa)]/8">{needsAttention.slice(0, 4).map((order) => <Link key={order.id} href="/admin/orders" className="flex min-h-16 items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="font-display text-xl leading-none">{order.orderNumber}</p><p className="mt-1 truncate text-xs text-[var(--cocoa)]/55">{order.customer.fullName} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p></div><div className="shrink-0 text-right"><p className="text-sm font-semibold">{formatMoney(order.total)}</p><p className="mt-1 text-[7px] font-semibold uppercase tracking-[.1em] text-[var(--caramel)]">{order.status.replaceAll("_", " ")}</p></div></Link>)}</div> : <p className="mt-4 rounded-2xl bg-[#f4ebdf] p-4 text-sm leading-6 text-[var(--cocoa)]/60">No live orders need attention right now.</p>}</section>
      <section className="rounded-[1.55rem] bg-[var(--cream-white)] p-4 sm:p-5"><p className="glaze-eyebrow text-[var(--caramel)]">Bakery pulse</p><h2 className="mt-1 font-display text-3xl">At a glance</h2><div className="mt-4 space-y-2"><Link href="/admin/fresh-today" className="flex min-h-14 items-center justify-between rounded-2xl bg-[#f4ebdf] px-4"><span className="flex items-center gap-2 text-sm"><PackageCheck size={16} className="text-[var(--caramel)]" />Fresh today</span><strong className="font-display text-2xl">{freshToday.length}</strong></Link><Link href="/admin/cakes" className="flex min-h-14 items-center justify-between rounded-2xl bg-[#f4ebdf] px-4"><span className="flex items-center gap-2 text-sm"><TrendingUp size={16} className="text-[var(--caramel)]" />Available products</span><strong className="font-display text-2xl">{products.filter((product) => product.availability === "AVAILABLE").length}</strong></Link><Link href="/admin/reviews" className="flex min-h-14 items-center justify-between rounded-2xl bg-[#f4ebdf] px-4"><span className="flex items-center gap-2 text-sm"><Star size={16} className="text-[var(--caramel)]" />New reviews</span><strong className="font-display text-2xl">{newReviews.length}</strong></Link></div></section></div>
  </div></AdminShell>;
}
