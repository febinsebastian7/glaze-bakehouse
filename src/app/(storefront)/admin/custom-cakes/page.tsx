"use client";

import { CakeSlice, ExternalLink, Phone, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import AdminShell from "@/components/admin/AdminShell";

type CustomCakeStatus = "NEW" | "REVIEWING" | "QUOTED" | "CONFIRMED" | "DECLINED" | "COMPLETED";

type CustomCakeRequest = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  celebration?: string;
  preferredDate?: string;
  cakeSize?: string;
  flavour?: string;
  theme?: string;
  referenceImageUrl?: string;
  messageOnCake?: string;
  budget?: number;
  additionalRequirements?: string;
  status: CustomCakeStatus;
  createdAt: string;
};

const statuses: CustomCakeStatus[] = ["NEW", "REVIEWING", "QUOTED", "CONFIRMED", "DECLINED", "COMPLETED"];
const readable = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());

function detail(label: string, value?: string | number) {
  return <div><p className="glaze-label">{label}</p><p className="mt-1 text-sm leading-6 text-[var(--cocoa)]/70">{value === undefined || value === "" ? "Not provided" : typeof value === "number" ? `₹${value.toLocaleString("en-IN")}` : value}</p></div>;
}

export default function AdminCustomCakesPage() {
  const [requests, setRequests] = useState<CustomCakeRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/custom-cake-requests", { cache: "no-store" });
        const data = await response.json().catch(() => ({})) as CustomCakeRequest[] & { message?: string };
        if (!response.ok || !Array.isArray(data)) throw new Error(data.message ?? "Custom cake requests could not be loaded.");
        setRequests(data);
        setSelectedId((current) => current ?? data[0]?.id);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Custom cake requests could not be loaded.");
      }
    };
    void load();
  }, []);

  const selected = requests.find((request) => request.id === selectedId) ?? requests[0];
  const updateStatus = async (status: CustomCakeStatus) => {
    if (!selected || saving || selected.status === status) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/custom-cake-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status }),
      });
      const updated = await response.json().catch(() => ({})) as CustomCakeRequest & { message?: string };
      if (!response.ok || !updated.id) throw new Error(updated.message ?? "Request status could not be updated.");
      setRequests((current) => current.map((request) => request.id === updated.id ? updated : request));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request status could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  return <AdminShell><div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]"><section className="rounded-[1.75rem] bg-[var(--cream-white)] p-5"><p className="glaze-eyebrow text-[var(--caramel)]">Custom cake requests</p><h1 className="mt-2 font-display text-4xl">Made for their moment.</h1><p className="mt-2 text-sm leading-6 text-[var(--cocoa)]/60">Every request is saved in the database and delivered to the bakery through Formspree.</p>{message && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{message}</p>}<div className="mt-6 space-y-2">{requests.map((request) => <button key={request.id} type="button" onClick={() => setSelectedId(request.id)} className={`w-full rounded-2xl border p-4 text-left transition ${request.id === selected?.id ? "border-[var(--caramel)] bg-[#fff8ee]" : "border-[var(--cocoa)]/10 hover:border-[var(--caramel)]/45"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-display text-xl leading-none">{request.name}</p><p className="mt-2 text-xs text-[var(--cocoa)]/60">{request.celebration || "Custom cake request"} · {request.phone}</p></div><span className="rounded-full bg-white px-2 py-1 text-[8px] font-semibold uppercase tracking-[.1em]">{readable(request.status)}</span></div><p className="mt-3 text-[9px] uppercase tracking-[.1em] text-[var(--cocoa)]/45">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.createdAt))}</p></button>)}{!requests.length && !message && <div className="rounded-[1.5rem] border border-dashed border-[var(--cocoa)]/20 bg-[#f4ebdf] px-5 py-16 text-center"><CakeSlice size={28} className="mx-auto text-[var(--caramel)]" /><h2 className="mt-4 font-display text-3xl">No custom requests yet.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--cocoa)]/60">New requests will appear here with their complete design brief and contact details.</p></div>}</div></section>{selected ? <section className="rounded-[1.75rem] bg-[var(--cream-white)] p-5 md:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="glaze-eyebrow text-[var(--caramel)]">Request detail</p><h2 className="mt-2 font-display text-4xl">{selected.name}</h2></div><select value={selected.status} onChange={(event) => { void updateStatus(event.target.value as CustomCakeStatus); }} disabled={saving} className="glaze-field h-11 min-w-48 px-3 text-[9px] font-semibold uppercase tracking-[.12em] disabled:opacity-60">{statuses.map((status) => <option key={status} value={status}>{readable(status)}</option>)}</select></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#f4ebdf] p-4"><p className="glaze-label">Customer</p><div className="mt-3 flex items-center gap-2 text-sm text-[var(--cocoa)]/70"><UserRound size={15} /> {selected.name}</div><div className="mt-2 flex items-center gap-2 text-sm text-[var(--cocoa)]/70"><Phone size={15} /> {selected.phone}</div>{selected.email && <p className="mt-2 text-sm text-[var(--cocoa)]/70">{selected.email}</p>}</div><div className="rounded-2xl bg-[#f4ebdf] p-4">{detail("Requested for", selected.preferredDate || "Date to be confirmed")}{selected.celebration && <p className="mt-2 text-sm text-[var(--cocoa)]/70">{selected.celebration}</p>}</div></div><div className="mt-6 grid gap-5 border-t border-[var(--cocoa)]/10 pt-6 sm:grid-cols-2">{detail("Cake size", selected.cakeSize)}{detail("Flavour", selected.flavour)}{detail("Colour or theme", selected.theme)}{detail("Message on cake", selected.messageOnCake)}{detail("Approximate budget", selected.budget)}</div><div className="mt-6 rounded-2xl bg-[#f4ebdf] p-4">{detail("Additional requirements", selected.additionalRequirements)}</div>{selected.referenceImageUrl && <a href={selected.referenceImageUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.13em] text-[var(--caramel)] hover:text-[var(--cocoa)]">Open customer reference image <ExternalLink size={13} /></a>}<p className="mt-7 border-t border-[var(--cocoa)]/10 pt-5 text-[9px] uppercase tracking-[.12em] text-[var(--cocoa)]/45">Saved {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(selected.createdAt))}</p></section> : <section className="rounded-[1.75rem] bg-[var(--cream-white)] p-8"><h2 className="font-display text-3xl">No custom requests yet.</h2></section>}</div></AdminShell>;
}
