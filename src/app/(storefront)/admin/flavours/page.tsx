"use client";

import { Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

import AdminShell from "@/components/admin/AdminShell";
import { availableFlavours } from "@/data/products";

export default function AdminFlavoursPage() {
  const [flavours, setFlavours] = useState(availableFlavours.map((name) => ({ id: name, name, active: true })));
  const [name, setName] = useState("");
  const add = (event: FormEvent) => { event.preventDefault(); if (!name.trim()) return; setFlavours((current) => [...current, { id: `${name}-${Date.now()}`, name: name.trim(), active: true }]); setName(""); };
  return <AdminShell><div className="rounded-[1.75rem] bg-[var(--cream-white)] p-5 md:p-7"><p className="glaze-eyebrow text-[var(--caramel)]">Product options</p><h1 className="mt-2 font-display text-4xl md:text-5xl">Flavours.</h1><p className="mt-2 text-sm leading-6 text-[var(--cocoa)]/60">Maintain the flavour list the cake and dessert forms can use. This list persists in the current development browser.</p><form onSubmit={add} className="mt-6 flex max-w-lg gap-3"><input value={name} onChange={(event) => setName(event.target.value)} className="glaze-field flex-1" placeholder="Add a flavour" /><button className="glaze-primary-button flex h-11 items-center gap-2 rounded-full px-4 text-[8px] font-semibold uppercase tracking-[.13em]"><Plus size={14} /> Add</button></form><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{flavours.map((flavour) => <div key={flavour.id} className="flex items-center justify-between rounded-2xl border border-[var(--cocoa)]/10 p-4"><div><p className="font-display text-2xl">{flavour.name}</p><button onClick={() => setFlavours((current) => current.map((item) => item.id === flavour.id ? { ...item, active: !item.active } : item))} className="mt-1 text-[8px] font-semibold uppercase tracking-[.12em] text-[var(--cocoa)]/50">{flavour.active ? "Active" : "Inactive"}</button></div><button onClick={() => setFlavours((current) => current.filter((item) => item.id !== flavour.id))} className="text-[var(--cocoa)]/45 hover:text-red-700" aria-label={`Delete ${flavour.name}`}><Trash2 size={15} /></button></div>)}</div></div></AdminShell>;
}
