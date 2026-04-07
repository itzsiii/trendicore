'use client';

import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from '../error.module.css';

export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className={styles.container}>
      <div className={styles.glow1} />
      <div className={styles.glow2} />
      
      <div className={styles.content}>
        <h1 className={styles.errorCode}>{t('notFound.code')}</h1>
        <h2 className={styles.title}>{t('notFound.title')}</h2>
        <p className={styles.description}>
          {t('notFound.description')}
        </p>
        
        <div className={styles.buttonGroup}>
          <Link href="/" className={styles.primaryBtn}>
            <Home size={18} />
            {t('notFound.goHome')}
          </Link>
          <Link href="/moda" className={styles.secondaryBtn}>
            <Search size={18} />
            {t('notFound.exploreFashion')}
          </Link>
        </div>
      </div>
    </div>
  );
}
