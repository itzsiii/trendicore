'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import styles from './services.module.css';

export default function ServicesPage() {
  const { t } = useLocale();

  const partners = [
    {
      roleKey: 'servicesPage.partner1Role',
      descKey: 'servicesPage.partner1Desc',
      name: 'Marina Fernández',
      avatar: 'https://i.pravatar.cc/150?u=marina',
      link: '#'
    },
    {
      roleKey: 'servicesPage.partner2Role',
      descKey: 'servicesPage.partner2Desc',
      name: 'Lucía Gómez',
      avatar: 'https://i.pravatar.cc/150?u=lucia',
      link: '#'
    }
  ];

  return (
    <div className={styles.page}>
      
      {/* Immersive Hero Header */}
      <header className={styles.hero}>
        <div className={styles.heroOrbs}>
          <div className={`${styles.orb} ${styles.orb1}`}></div>
          <div className={`${styles.orb} ${styles.orb2}`}></div>
        </div>
        
        <div className={styles.heroContent}>
          <motion.span 
            className={styles.badge}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Trendicore Agency
          </motion.span>
          
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t('servicesPage.partnersTitle')}
          </motion.h1>
          
          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t('servicesPage.partnersSubtitle')}
          </motion.p>
        </div>
      </header>

      {/* Partners Full-Width Grid */}
      <main className={styles.content}>
        <div className={styles.partnersGrid}>
          {partners.map((partner, i) => (
            <motion.div 
              key={i}
              className={styles.partnerCard}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
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
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
