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
  title: "Trendicore — Selección Exclusiva Gen Z | Moda & Tech",
  description:
    "Trendicore es la plataforma definitiva de selección premium para la Gen Z. Descubre la colección más exclusiva de moda aesthetic y gadgets tech virales, verificados para ti.",
  keywords: "moda gen z, tech gadgets, premium aesthetic, curated trends, moda exclusiva, tendencias virales",
  metadataBase: new URL('https://trendicore.net'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Trendicore — Selección Exclusiva Gen Z',
    description: 'La colección más exclusiva de moda aesthetic y gadgets tech virales para la Gen Z.',
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

import { cookies } from 'next/headers';

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('trendicore-locale')?.value || 'es';

  const themeInitScript = `(function(){try{var t=localStorage.getItem('trendicore-theme');if(t)document.documentElement.setAttribute('data-theme',t);else if(window.matchMedia('(prefers-color-scheme:light)').matches)document.documentElement.setAttribute('data-theme','light');else document.documentElement.setAttribute('data-theme','dark')}catch(e){}})();`;

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${jakarta.variable} ${outfit.variable}`}>
        <NoiseOverlay />
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
