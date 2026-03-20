'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import styles from './services.module.css';

export default function ServicesPage() {
  const { t } = useLocale();

  const partners = [
    {
      roleKey: 'servicesPage.partner3Role',
      descKey: 'servicesPage.partner3Desc',
      name: 'Irene Domínguez',
      avatar: '/images/partners/irene.jpg',
      link: 'https://airendesignsportfolio.framer.website/'
    }
  ];

  return (
    <div className={styles.page}>
      
      {/* Hero Header */}
      <header className={styles.hero}>
        <div className={styles.heroOrbs}>
          <div className={`${styles.orb} ${styles.orb1}`}></div>
          <div className={`${styles.orb} ${styles.orb2}`}></div>
          <div className={`${styles.orb} ${styles.orb3}`}></div>
        </div>
        
        <div className={styles.heroContent}>
          <motion.span 
            className={styles.badge}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Trendicore Solutions
          </motion.span>
          
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {t('servicesPage.title')}
          </motion.h1>
          
          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {t('servicesPage.subtitle')}
          </motion.p>
        </div>
      </header>

      {/* Partner Cards */}
      <main className={styles.content}>
        <div className={styles.partnersGrid}>
          {partners.map((partner, i) => (
            <motion.div 
              key={i}
              className={styles.partnerCard}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className={styles.avatarContainer}>
                <div className={styles.avatarGlow}></div>
                <div 
                  className={styles.partnerAvatar}
                  style={{ backgroundImage: `url(${partner.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
              </div>

              <div className={styles.partnerInfo}>
                <span className={styles.partnerBadge}>{t(partner.roleKey)}</span>
                <h3>{partner.name}</h3>
                <p>{t(partner.descKey)}</p>
                <a href={partner.link} target="_blank" rel="noopener noreferrer" className={styles.partnerBtn}>
                  {t('servicesPage.viewPortfolio')}
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
