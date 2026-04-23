'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { Zap, Sun, Moon, Menu, X, Heart, User, LogIn, Radar } from 'lucide-react';
import LocaleSelector from './LocaleSelector';
import FavoritesDrawer from '@/components/product/FavoritesDrawer';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const { isAuthenticated, user, profile } = useAuth();
  const { count } = useWishlist();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // User initials for avatar
  const userInitials = profile?.display_name
    ? profile.display_name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || '?';

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
    { href: '/para-marcas', label: t('nav.brands') },
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
          {isAuthenticated ? (
            <Link href="/perfil" className={styles.userAvatar} title={profile?.display_name || user?.email}>
              <span>{userInitials}</span>
            </Link>
          ) : (
            <Link href="/acceder" className={styles.loginBtn}>
              <LogIn size={15} strokeWidth={2} />
              <span className={styles.loginLabel}>{t('auth.navLogin')}</span>
            </Link>
          )}

          <button
            onClick={() => setIsWishlistOpen(true)}
            className={styles.actionBtn}
            aria-label="Toggle favorites"
          >
            <Heart size={18} fill={count > 0 ? "var(--accent)" : "none"} strokeWidth={count > 0 ? 0 : 2} />
            {count > 0 && <span className={styles.badge}>{count}</span>}
          </button>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
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
          
          {isAuthenticated ? (
            <>
              <Link 
                href="/mi-radar" 
                className={styles.actionBtn}
                title="Mi Radar"
                onClick={() => setMenuOpen(false)}
              >
                <Radar size={20} strokeWidth={2} />
              </Link>
              <Link 
                href="/perfil" 
                className={styles.userAvatar}
                onClick={() => setMenuOpen(false)}
              >
                <span>{userInitials}</span>
              </Link>
            </>
          ) : (
            <Link 
              href="/acceder" 
              className={styles.loginBtn}
              onClick={() => setMenuOpen(false)}
            >
              <LogIn size={16} strokeWidth={2} />
              <span>{t('auth.navLogin')}</span>
            </Link>
          )}

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
      </div>

      {/* Favorites Drawer */}
      <FavoritesDrawer 
        isOpen={isWishlistOpen} 
        onClose={() => setIsWishlistOpen(false)} 
      />
    </nav>
  );
}
