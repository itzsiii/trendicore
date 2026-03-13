'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Flame, Link as LinkIcon } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, index = 0, onQuickView }) {
  const { t } = useLocale();

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const sourceConfig = {
    amazon: {
      label: t('product.amazonCta'),
      icon: <ShoppingBag size={16} strokeWidth={2.5} />,
      class: 'amazon',
    },
    shein: {
      label: t('product.sheinCta'),
      icon: <ShoppingBag size={16} strokeWidth={2.5} />,
      class: 'shein',
    },
  };

  const source = sourceConfig[product.affiliate_source] || sourceConfig.amazon;
  const categoryLabel = t(`product.categoryLabels.${product.category}`) || product.category;

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <a
        href={product.affiliate_link}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={styles.link}
      >
        {/* Image */}
        <div className={styles.imageWrap}>
          <img
            src={product.image_url}
            alt={product.title}
            className={styles.image}
            loading="lazy"
          />
          <div className={styles.overlay}>
            <div className={styles.overlayButtons}>
              <span className={`${styles.ctaButton} ${styles[source.class]}`}>
                {source.icon} {source.label}
              </span>
              <button className={styles.quickViewBtn} onClick={handleQuickView}>
                <Flame size={16} /> {t('product.quickView')}
              </button>
            </div>
          </div>
          {product.featured && (
            <span className={styles.featuredBadge}><Flame size={12} strokeWidth={3} className={styles.badgeIcon} /> {t('product.trending')}</span>
          )}
          <span className={`${styles.sourcePill} ${styles[source.class + 'Pill']}`}>
            {product.affiliate_source}
          </span>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <span className={styles.category}>{categoryLabel}</span>
          <h3 className={styles.title}>{product.title}</h3>
          <div className={styles.bottom}>
            <span className={`${styles.ctaMini} ${styles[source.class]}`}>
              {t('product.viewOn')} {product.affiliate_source === 'shein' ? 'Shein' : 'Amazon'} <LinkIcon size={14} className={styles.miniIcon} />
            </span>
          </div>
        </div>
      </a>
    </motion.article>
  );
}
