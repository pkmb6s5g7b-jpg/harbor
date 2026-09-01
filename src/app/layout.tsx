import type { Metadata } from "next";
import { DM_Sans, Source_Serif_4 } from "next/font/google";
import { brand } from "../config/brand";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { HarborProvider } from "../components/providers/HarborProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-page font-sans text-ink">
        <HarborProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </HarborProvider>
      </body>
    </html>
  );
}
