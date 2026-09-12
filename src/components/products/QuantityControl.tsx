"use client";

import { Minus, Plus } from "lucide-react";

export default function QuantityControl({ quantity, onChange, compact = false }: { quantity: number; onChange: (quantity: number) => void; compact?: boolean }) {
  return <div className={`inline-flex items-center rounded-full border border-[var(--cocoa)]/15 bg-white/55 ${compact ? "h-8" : "h-10"}`}>
    <button type="button" onClick={() => onChange(quantity - 1)} aria-label="Decrease quantity" className={`${compact ? "w-8" : "w-10"} flex h-full items-center justify-center text-[var(--cocoa)] hover:text-[var(--caramel)]`}><Minus size={compact ? 12 : 14} /></button>
    <span className={`${compact ? "w-6 text-xs" : "w-8 text-sm"} text-center font-semibold`}>{quantity}</span>
    <button type="button" onClick={() => onChange(quantity + 1)} aria-label="Increase quantity" className={`${compact ? "w-8" : "w-10"} flex h-full items-center justify-center text-[var(--cocoa)] hover:text-[var(--caramel)]`}><Plus size={compact ? 12 : 14} /></button>
  </div>;
}
