import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  Allura,
} from "next/font/google";
import "./globals.css";
import CartDrawer from "@/components/cart/CartDrawer";
import FloatingCart from "@/components/cart/FloatingCart";
import { StoreProvider } from "@/components/store/StoreProvider";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const script = Allura({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://glazebakehouse.com"),
  title: {
    default: "Glaze Bakehouse | Cakes Made for Sweet Moments",
    template: "%s | Glaze Bakehouse",
  },
  description:
    "Handcrafted celebration cakes, custom cakes and freshly baked desserts made with love at Glaze Bakehouse.",
  keywords: [
    "Glaze Bakehouse",
    "cakes",
    "custom cakes",
    "birthday cakes",
    "celebration cakes",
    "bakery",
  ],
  openGraph: {
    title: "Glaze Bakehouse",
    description: "Made for your sweetest moments.",
    url: "https://glazebakehouse.com",
    siteName: "Glaze Bakehouse",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${display.variable} ${sans.variable} ${script.variable}`}
      >
        <StoreProvider>
          {children}
          <CartDrawer />
          <FloatingCart />
        </StoreProvider>
      </body>
    </html>
  );
}
