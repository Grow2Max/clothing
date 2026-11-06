import type { Metadata } from "next";
import { Libre_Baskerville, DM_Sans, Noto_Serif_Tamil } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/brand";

const libre = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-dmsans",
  display: "swap",
});

const tamil = Noto_Serif_Tamil({
  weight: ["400", "700"],
  subsets: ["tamil"],
  variable: "--font-tamil",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${brand.name} | ${brand.tagline}`,
  description: `${brand.name}: silk, soft silk, Banarasi and cotton sarees. Handpicked for weddings, festivals and every day.`,
  // Absolute base for link-preview URLs (Instagram, WhatsApp…). Without it Next.js uses
  // Vercel's default project domain, which may not serve the site.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://clothing-demo-ecom.vercel.app"),
  openGraph: {
    type: "website",
    url: "/",
    siteName: brand.name,
    title: brand.name,
    description: brand.tagline,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: `${brand.name} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.tagline,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${libre.variable} ${dmSans.variable} ${tamil.variable}`}>{children}</body>
    </html>
  );
}
