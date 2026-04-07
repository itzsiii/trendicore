'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { m } from 'framer-motion';
import { Users, Target } from 'lucide-react';
import styles from '../legal/legal.module.css';

export default function AboutUsPage() {
  const { t } = useLocale();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <m.h1 
          className={styles.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {t('aboutUsPage.title')}
        </m.h1>
        <p className={styles.subtitle}>{t('aboutUsPage.subtitle')}</p>
      </header>

      <m.article 
        className={styles.content}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <m.p variants={itemVariants}>{t('aboutUsPage.intro')}</m.p>
        
        <div className={styles.aboutGrid}>
          <m.div variants={itemVariants} className={styles.card}>
            <Users size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
            <h3>{t('aboutUsPage.missionTitle')}</h3>
            <p>{t('aboutUsPage.missionText')}</p>
          </m.div>

          <m.div variants={itemVariants} className={styles.card}>
            <Target size={32} color="var(--pink)" style={{ marginBottom: '1rem' }} />
            <h3>{t('aboutUsPage.visionTitle')}</h3>
            <p>{t('aboutUsPage.visionText')}</p>
          </m.div>
        </div>
      </m.article>
    </div>
  );
}
