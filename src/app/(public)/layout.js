'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import { WishlistProvider } from '@/components/providers/WishlistProvider';
import RegionSelector from '@/components/ui/RegionSelector';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import CookieBanner from '@/components/ui/CookieBanner';

export default function PublicLayout({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <ThemeProvider>
        <LocaleProvider>
          <WishlistProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CookieBanner />
          </WishlistProvider>
        </LocaleProvider>
      </ThemeProvider>
    </LazyMotion>
  );
}
