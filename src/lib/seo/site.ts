const PRODUCTION_FALLBACK = "https://glazebakehouse.in";

export const siteName = "Glaze Bakehouse";

export const siteDescription =
  "Glaze Bakehouse is a premium cake bakery in Mysuru (Mysore), crafting celebration cakes, custom cakes, birthday cakes and freshly baked desserts.";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      return PRODUCTION_FALLBACK;
    }
  }
  return PRODUCTION_FALLBACK;
}

export function absoluteUrl(pathname = "/") {
  const origin = getSiteUrl();
  if (!pathname || pathname === "/") return origin;
  return `${origin}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export const brand = {
  name: siteName,
  shortName: "Glaze",
  location: "Mysuru, Karnataka",
  locationAliases: ["Mysore", "Mysuru"],
  description: siteDescription,
  logoPath: "/brand/glaze-logo.svg",
  markPath: "/brand/glaze-mark-round.svg",
  ogImagePath: "/brand/og-image.png",
} as const;
