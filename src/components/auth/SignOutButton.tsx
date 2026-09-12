"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { firebaseClientConfigured, signOutFirebaseClient } from "@/lib/firebase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const signOutEverywhere = async () => {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/session", { method: "DELETE" });
      if (!response.ok) throw new Error("We could not sign you out.");
      if (firebaseClientConfigured) await signOutFirebaseClient();
      router.replace("/");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not sign you out.");
    } finally {
      setPending(false);
    }
  };

  return <div className="mt-6"><button type="button" onClick={signOutEverywhere} disabled={pending} className="text-[9px] font-semibold uppercase tracking-[.14em] text-[var(--honey)] disabled:opacity-60">{pending ? "Signing out…" : "Sign out"}</button>{message && <p role="status" className="mt-2 text-xs text-white/65">{message}</p>}</div>;
}
