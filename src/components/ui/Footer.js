'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Zap, Instagram, Twitter } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@') || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 5000);
      }
    } catch (err) {
      console.error('Newsletter submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Zap size={20} strokeWidth={2.5} className={styles.logoIcon} />
            <span>Trendicore</span>
          </div>
          <p className={styles.tagline}>
            {t('footer.tagline')}
          </p>
          <div className={styles.socialLinks}>
            <a href="https://instagram.com/trendicore" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://tiktok.com/@trendicore" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
              </svg>
            </a>
            <a href="https://x.com/trendicore" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="X (Twitter)">
              <Twitter size={18} />
            </a>
          </div>
        </div>

        <div className={styles.columns}>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('footer.home')}</h4>
            <Link href="/" className={styles.footerLink}>{t('nav.home')}</Link>
            <Link href="/sobre-nosotros" className={styles.footerLink}>{t('nav.about')}</Link>
            <Link href="/servicios" className={styles.footerLink}>{t('nav.services')}</Link>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('nav.store')}</h4>
            <Link href="/moda" className={styles.footerLink}>{t('nav.fashion')}</Link>
            <Link href="/tech" className={styles.footerLink}>{t('nav.tech')}</Link>
            <Link href="/entretenimiento" className={styles.footerLink}>{t('nav.entertainment')}</Link>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('footer.legal')}</h4>
            <Link href="/legal/affiliate" className={styles.footerLink}>{t('footer.affiliateNotice')}</Link>
            <Link href="/legal/privacy" className={styles.footerLink}>{t('footer.privacy')}</Link>
            <Link href="/legal/terms" className={styles.footerLink}>{t('termsPage.title')}</Link>
          </div>

          <div className={styles.newsletter}>
            <h4 className={styles.columnTitle}>{t('footer.dailyDrops')}</h4>
            <p className={styles.newsletterText}>{t('footer.newsletterDesc')}</p>
            {subscribed ? (
              <p className={styles.newsletterSuccess}>✓ {t('footer.newsletterSuccess')}</p>
            ) : (
              <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
                <input 
                  type="email" 
                  placeholder="tu@email.com" 
                  className={styles.newsletterInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className={styles.newsletterSubmit}>{t('footer.subscribe')}</button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.disclaimer}>
          {t('footer.disclaimer')}
        </p>
        <p className={styles.copy}>
          © {new Date().getFullYear()} {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
}
