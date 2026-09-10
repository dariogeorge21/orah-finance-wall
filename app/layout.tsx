import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORAH 2026 — Payment Reveal Wall | Jesus Youth Pala",
  description:
    "A communal giving experience for ORAH 2026. Watch the liquid tank fill and the master artwork reveal tile by tile with every verified contribution.",
  keywords: ["ORAH 2026", "Jesus Youth", "Jesus Youth Pala", "Payment Wall", "Fundraiser"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "dark h-full antialiased selection:bg-amber-500/30 selection:text-amber-200",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        notoSans.variable,
        playfairDisplayHeading.variable
      )}
    >
      <body className="min-h-full flex flex-col bg-[#07080c] text-neutral-100 overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
