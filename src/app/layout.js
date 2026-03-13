import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

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
    "Descubre las mejores tendencias de moda Gen Z y gadgets tech virales. Estilo aesthetic, affordable y curado para ti.",
  keywords: "moda gen z, tech gadgets, aesthetic, trendy, amazon, shein, tiktok fashion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${outfit.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
