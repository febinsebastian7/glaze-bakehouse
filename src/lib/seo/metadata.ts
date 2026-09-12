import type { Metadata } from "next";

import { absoluteUrl, brand, getSiteUrl, siteName } from "@/lib/seo/site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  image?: string;
  keywords?: string[];
};

export function pageMetadata({
  title,
  description,
  path,
  index = true,
  image = brand.ogImagePath,
  keywords,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true } }
      : { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
    openGraph: {
      title: title.includes(siteName) ? title : `${title} | ${siteName}`,
      description,
      url,
      siteName,
      locale: "en_IN",
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${siteName} logo` }],
    },
    twitter: {
      card: "summary_large_image",
      title: title.includes(siteName) ? title : `${title} | ${siteName}`,
      description,
      images: [imageUrl],
    },
  };
}

export function noIndexMetadata(title: string, description: string, path: string): Metadata {
  return pageMetadata({ title, description, path, index: false });
}

export function rootMetadata(): Metadata {
  const metadataBase = new URL(getSiteUrl());
  return {
    metadataBase,
    applicationName: siteName,
    title: {
      default: "Glaze Bakehouse | Premium Cakes in Mysuru",
      template: `%s | ${siteName}`,
    },
    description: brand.description,
    keywords: [
      "Glaze Bakehouse",
      "glazebakehouse",
      "Glaze Bakehouse Mysore",
      "Glaze Bakehouse Mysuru",
      "cakes in Mysore",
      "cakes in Mysuru",
      "bakery in Mysuru",
      "custom cakes in Mysore",
      "birthday cakes in Mysore",
      "cake delivery in Mysore",
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    category: "food",
    alternates: { canonical: metadataBase },
    robots: { index: true, follow: true },
    openGraph: {
      title: "Glaze Bakehouse | Premium Cakes in Mysuru",
      description: brand.description,
      url: metadataBase,
      siteName,
      locale: "en_IN",
      type: "website",
      images: [{ url: absoluteUrl(brand.ogImagePath), width: 1200, height: 630, alt: "Glaze Bakehouse" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Glaze Bakehouse | Premium Cakes in Mysuru",
      description: brand.description,
      images: [absoluteUrl(brand.ogImagePath)],
    },
    icons: {
      icon: [
        { url: "/brand/icon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/brand/glaze-mark-round.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
    },
    appleWebApp: {
      capable: true,
      title: siteName,
      statusBarStyle: "default",
    },
  };
}
