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
  openGraph: {
    title: brand.name,
    description: brand.tagline,
    images: [{ url: brand.logo.full, width: 800, height: 800 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${libre.variable} ${dmSans.variable} ${tamil.variable}`}>{children}</body>
    </html>
  );
}
