'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, Flame, Link as LinkIcon } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, index = 0, onQuickView }) {
  const { t } = useLocale();
  const [imgSrc, setImgSrc] = useState(product.image_url);

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
        {/* Image */}
        <div className={styles.imageWrap}>
          <Image
            src={imgSrc || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iI2ZmZiIgYWxpZ249Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
            alt={product.title}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={styles.image}
            onError={() => {
              setImgSrc('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iI2ZmZiIgYWxpZ249Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=');
            }}
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
          <h3 className={styles.title}>
            <a
              href={`/api/track-click?id=${product.id}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={styles.mainLink}
            >
              {product.title}
            </a>
          </h3>
          <div className={styles.bottom}>
            <span className={`${styles.ctaMini} ${styles[source.class]}`}>
              {t('product.viewOn')} {product.affiliate_source === 'shein' ? 'Shein' : 'Amazon'} <LinkIcon size={14} className={styles.miniIcon} />
            </span>
          </div>
        </div>
    </motion.article>
  );
}
