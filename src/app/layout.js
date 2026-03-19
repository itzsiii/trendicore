import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/seo/JsonLd";
import NoiseOverlay from "@/components/ui/NoiseOverlay";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Trendicore — Curación Exclusiva Gen Z | Moda & Tech",
  description:
    "Trendicore es la plataforma definitiva de curación premium para la Gen Z. Descubre la selección más exclusiva de moda aesthetic y gadgets tech virales, verificados para ti.",
  keywords: "moda gen z, tech gadgets, premium aesthetic, curated trends, moda exclusiva",
  metadataBase: new URL('https://trendicore.net'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Trendicore — Curación Exclusiva Gen Z',
    description: 'La selección más exclusiva de moda aesthetic y gadgets tech virales para la Gen Z.',
    url: 'https://trendicore.net',
    siteName: 'Trendicore',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trendicore — Tendencias Gen Z',
    description: 'Moda aesthetic y gadgets tech virales.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${outfit.variable}`} suppressHydrationWarning>
        <NoiseOverlay />
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
