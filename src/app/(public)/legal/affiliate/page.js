'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import styles from '../legal.module.css';

export default function AffiliatePage() {
  const { t } = useLocale();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('affiliatePage.title')}</h1>
        <p className={styles.subtitle}>{t('affiliatePage.subtitle')}</p>
      </header>

      <article className={styles.content}>
        <p>{t('affiliatePage.intro')}</p>
        
        <h2>{t('affiliatePage.q1')}</h2>
        <p>{t('affiliatePage.a1')}</p>

        <h2>{t('affiliatePage.q2')}</h2>
        <p>{t('affiliatePage.a2')}</p>
        <ul>
          <li>{t('affiliatePage.p1')}</li>
          <li>{t('affiliatePage.p2')}</li>
        </ul>

        <h2>{t('affiliatePage.q3')}</h2>
        <p>{t('affiliatePage.a3')}</p>
      </article>
    </div>
  );
}
