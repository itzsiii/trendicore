'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useLocale();

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
        </div>

        <div className={styles.columns}>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('footer.explore')}</h4>
            <Link href="/" className={styles.footerLink}>{t('footer.home')}</Link>
            <Link href="/moda" className={styles.footerLink}>{t('footer.fashion')}</Link>
            <Link href="/tech" className={styles.footerLink}>{t('footer.techGadgets')}</Link>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>{t('footer.legal')}</h4>
            <Link href="/legal/affiliate" className={styles.footerLink}>{t('footer.affiliateNotice')}</Link>
            <Link href="/legal/privacy" className={styles.footerLink}>{t('footer.privacy')}</Link>
          </div>

          <div className={styles.newsletter}>
            <h4 className={styles.columnTitle}>{t('footer.dailyDrops')}</h4>
            <p className={styles.newsletterText}>{t('footer.newsletterDesc')}</p>
            <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="tu@email.com" className={styles.newsletterInput} />
              <button type="submit" className={styles.newsletterSubmit}>{t('footer.subscribe')}</button>
            </form>
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
