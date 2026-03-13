'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import styles from '../legal.module.css';

export default function PrivacyPage() {
  const { t } = useLocale();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('privacyPage.title')}</h1>
        <p className={styles.subtitle}>{t('privacyPage.subtitle')}</p>
      </header>

      <article className={styles.content}>
        <p>{t('privacyPage.intro')}</p>
        
        <h2>{t('privacyPage.s1')}</h2>
        <p>{t('privacyPage.p1')}</p>

        <h2>{t('privacyPage.s2')}</h2>
        <p>{t('privacyPage.p2')}</p>

        <h2>{t('privacyPage.s3')}</h2>
        <p>{t('privacyPage.p3')}</p>

        <h2>{t('privacyPage.s4')}</h2>
        <p>{t('privacyPage.p4')}</p>
      </article>
    </div>
  );
}
