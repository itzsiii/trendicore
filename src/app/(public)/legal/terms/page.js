'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import styles from '../legal.module.css';

export default function TermsPage() {
  const { t } = useLocale();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('termsPage.title')}</h1>
        <p className={styles.subtitle}>{t('termsPage.subtitle')}</p>
      </header>

      <article className={styles.content}>
        <p className={styles.lastUpdated}>{t('termsPage.lastUpdated')}</p>
        <p>{t('termsPage.intro')}</p>

        <h2>{t('termsPage.s1')}</h2>
        <p>{t('termsPage.p1')}</p>

        <h2>{t('termsPage.s2')}</h2>
        <p>{t('termsPage.p2')}</p>

        <h2>{t('termsPage.s3')}</h2>
        <p>{t('termsPage.p3')}</p>

        <h2>{t('termsPage.s4')}</h2>
        <p>{t('termsPage.p4')}</p>

        <h2>{t('termsPage.s5')}</h2>
        <p>{t('termsPage.p5')}</p>
      </article>
    </div>
  );
}
