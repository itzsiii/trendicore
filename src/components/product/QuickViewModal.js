'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ExternalLink } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from './QuickViewModal.module.css';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const { t } = useLocale();

  if (!product) return null;

  const isAmazon = product.affiliate_source === 'amazon';
  const ctaLabel = isAmazon ? t('product.amazonCta') : t('product.sheinCta');
  const sourceClass = isAmazon ? styles.amazon : styles.shein;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>

            <div className={styles.container}>
              <div className={styles.imageSection}>
                <img src={product.image_url} alt={product.title} className={styles.image} />
              </div>

              <div className={styles.infoSection}>
                <span className={styles.category}>{t(`product.categoryLabels.${product.category}`)}</span>
                <h2 className={styles.title}>{product.title}</h2>
                <p className={styles.description}>
                  {product.description || t('product.noDescription')}
                </p>

                <div className={styles.actions}>
                  <a
                    href={product.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={`${styles.primaryCta} ${sourceClass}`}
                  >
                    <ShoppingBag size={20} />
                    {ctaLabel}
                  </a>
                  <p className={styles.secondaryCta}>
                    {t('product.redirectNotice')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
