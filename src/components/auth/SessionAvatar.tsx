"use client";

import Image from "next/image";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";

type SessionProfile = {
  name: string | null;
  email: string | null;
  picture: string | null;
  isAdmin: boolean;
};

export function useSessionProfile() {
  const [profile, setProfile] = useState<SessionProfile | null>(null);

  useEffect(() => {
    let active = true;
    void fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<{ user: SessionProfile | null }> : { user: null })
      .then((result) => { if (active) setProfile(result.user); })
      .catch(() => { if (active) setProfile(null); });
    return () => { active = false; };
  }, []);

  return profile;
}

export default function SessionAvatar({ className = "" }: { className?: string }) {
  const profile = useSessionProfile();
  const label = profile?.name || profile?.email || "Your account";

  if (profile?.picture) {
    return <span className={`relative block h-8 w-8 overflow-hidden rounded-full border border-[var(--cocoa)]/15 bg-[var(--cream-light)] ${className}`} title={label}>
      <Image src={profile.picture} alt="Your Google profile" fill sizes="32px" className="object-cover" />
    </span>;
  }

  return <span className={`grid h-8 w-8 place-items-center rounded-full border border-[var(--cocoa)]/15 bg-[var(--cream-light)] ${className}`} title={label}><UserRound size={16} strokeWidth={1.4} /></span>;
}
