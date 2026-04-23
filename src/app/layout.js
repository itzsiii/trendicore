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
  title: "Trendicore — Trend Intelligence Platform | AI + Human Curation",
  description:
    "Trendicore es la primera plataforma que combina selección humana experta con inteligencia artificial para predecir tendencias en moda y tecnología. Descubre lo que será trending antes que nadie.",
  keywords: "trend intelligence, AI trends, moda gen z, tech gadgets, predicción de tendencias, social commerce, trend analytics",
  metadataBase: new URL('https://trendicore.net'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Trendicore — Trend Intelligence Platform',
    description: 'La primera plataforma de inteligencia de tendencias con IA para la Gen Z. Descubre, verifica y compra lo que será trending mañana.',
    url: 'https://trendicore.net',
    siteName: 'Trendicore',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trendicore — Descubre tendencias antes que nadie',
    description: 'IA + Selección humana experta para predecir tendencias en moda y tech.',
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
