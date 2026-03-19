'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLocale } from '@/components/providers/LocaleProvider';
<<<<<<< HEAD
import { useWishlist } from '@/components/providers/WishlistProvider';
import { Zap, Sun, Moon, Menu, X, Heart } from 'lucide-react';
=======
import { Zap, Sun, Moon, Menu, X } from 'lucide-react';
>>>>>>> 5ab3d5c82729024fb4b5bee0b609ab8e71a4c21c
import LocaleSelector from './LocaleSelector';
import FavoritesDrawer from '@/components/product/FavoritesDrawer';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const { count } = useWishlist();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
<<<<<<< HEAD
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
=======
>>>>>>> 5ab3d5c82729024fb4b5bee0b609ab8e71a4c21c

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const NAV_LINKS = [
    { href: '/', label: t('nav.home') },
    { href: '/tienda', label: t('nav.store') },
    { href: '/servicios', label: t('nav.services') },
    { href: '/sobre-nosotros', label: t('nav.about') },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}><Zap size={22} strokeWidth={2.5} /></span>
          <span className={styles.logoText}>Trendicore</span>
        </Link>

        {/* Desktop links */}
        <div className={styles.links}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)) ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className={styles.actions}>
          <LocaleSelector />
          <button
            onClick={() => setIsWishlistOpen(true)}
            className={styles.actionBtn}
            aria-label="Toggle favorites"
          >
            <Heart size={20} fill={count > 0 ? "var(--accent)" : "none"} strokeWidth={count > 0 ? 0 : 2} />
            {count > 0 && <span className={styles.badge}>{count}</span>}
          </button>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && <div className={styles.mobileBackdrop} onClick={() => setMenuOpen(false)} />}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileLinks}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)) ? styles.mobileLinkActive : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className={styles.mobileActions}>
          <LocaleSelector />
          <button
            onClick={() => setIsWishlistOpen(true)}
            className={styles.actionBtn}
            aria-label="Toggle favorites"
          >
            <Heart size={20} fill={count > 0 ? "var(--accent)" : "none"} strokeWidth={count > 0 ? 0 : 2} />
            {count > 0 && <span className={styles.badge}>{count}</span>}
          </button>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && <div className={styles.mobileBackdrop} onClick={() => setMenuOpen(false)} />}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileLinks}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${pathname === link.href ? styles.mobileLinkActive : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className={styles.mobileActions}>
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

      {/* Favorites Drawer */}
      <FavoritesDrawer 
        isOpen={isWishlistOpen} 
        onClose={() => setIsWishlistOpen(false)} 
      />
    </nav>
  );
}
