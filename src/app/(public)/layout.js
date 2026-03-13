'use client';

import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import RegionSelector from '@/components/ui/RegionSelector';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function PublicLayout({ children }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </LocaleProvider>
    </ThemeProvider>
  );
}
