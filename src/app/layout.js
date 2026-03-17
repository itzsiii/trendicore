import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/seo/JsonLd";

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
  title: "Trendicore — Tendencias Gen Z | Moda & Tech",
  description:
    "Trendicore es tu guía definitiva de tendencias Gen Z. Encuentra moda aesthetic y gadgets tech virales de TikTok en un solo lugar. Estilo real, verificado y directo a tu carrito.",
  keywords: "moda gen z, tech gadgets, aesthetic, trendy, amazon, shein, tiktok fashion",
  metadataBase: new URL('https://trendicore.net'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Trendicore — Tendencias Gen Z',
    description: 'Moda aesthetic y gadgets tech virales para la Gen Z. Estilo real y verificado.',
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
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
