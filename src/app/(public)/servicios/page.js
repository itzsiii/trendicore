'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { motion } from 'framer-motion';
import { Sparkles, BarChart3, Globe } from 'lucide-react';
import styles from '../legal/legal.module.css';

export default function ServicesPage() {
  const { t } = useLocale();

  const services = [
    {
      icon: <Sparkles size={24} />,
      iconBg: 'rgba(var(--accent-rgb), 0.1)',
      iconColor: 'var(--accent)',
      titleKey: 'servicesPage.curationTitle',
      descKey: 'servicesPage.curationDesc',
    },
    {
      icon: <BarChart3 size={24} />,
      iconBg: 'rgba(var(--pink-rgb), 0.1)',
      iconColor: 'var(--pink)',
      titleKey: 'servicesPage.trackingTitle',
      descKey: 'servicesPage.trackingDesc',
    },
    {
      icon: <Globe size={24} />,
      iconBg: 'rgba(var(--cyan-rgb), 0.1)',
      iconColor: 'var(--cyan)',
      titleKey: 'servicesPage.globalTitle',
      descKey: 'servicesPage.globalDesc',
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t('servicesPage.title')}
        </motion.h1>
        <p className={styles.subtitle}>{t('servicesPage.subtitle')}</p>
      </header>

      <article className={styles.content}>
        <div className={styles.servicesGrid}>
          {services.map((svc, i) => (
            <motion.section 
              key={i}
              className={styles.serviceItem}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className={styles.serviceIcon} style={{ background: svc.iconBg, color: svc.iconColor }}>
                {svc.icon}
              </div>
              <div>
                <h2>{t(svc.titleKey)}</h2>
                <p>{t(svc.descKey)}</p>
              </div>
            </motion.section>
          ))}
        </div>
      </article>
    </div>
  );
}
