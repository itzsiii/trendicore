'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLocale } from '@/components/providers/LocaleProvider';
import { Zap, Sun, Moon } from 'lucide-react';
import LocaleSelector from './LocaleSelector';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const pathname = usePathname();

  const NAV_LINKS = [
    { href: '/', label: t('nav.home') },
    { href: '/moda', label: t('nav.fashion') },
    { href: '/tech', label: t('nav.tech') },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}><Zap size={22} strokeWidth={2.5} /></span>
          <span className={styles.logoText}>Trendicore</span>
        </Link>

        <div className={styles.links}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <LocaleSelector />
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
