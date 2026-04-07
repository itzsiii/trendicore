'use client';

import { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const consent = localStorage.getItem('trendicore-cookie-consent');
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('trendicore-cookie-consent', 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem('trendicore-cookie-consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <Shield size={20} />
        </div>
        <div className={styles.text}>
          <p className={styles.title}>{t('cookieBanner.title')}</p>
          <p className={styles.desc}>
            {t('cookieBanner.desc')}{' '}
            <a href="/legal/privacy" className={styles.link}>{t('cookieBanner.policyLink')}</a>.
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.rejectBtn} onClick={reject}>{t('cookieBanner.reject')}</button>
          <button className={styles.acceptBtn} onClick={accept}>{t('cookieBanner.accept')}</button>
        </div>
      </div>
    </div>
  );
}
