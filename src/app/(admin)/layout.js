'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

export default function AdminLayout({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <LocaleProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </LocaleProvider>
    </LazyMotion>
  );
}
