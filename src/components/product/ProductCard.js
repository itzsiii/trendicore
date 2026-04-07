'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Flame, Link as LinkIcon, Heart, Share2 } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, index = 0, onQuickView }) {
  const { t } = useLocale();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imgSrc, setImgSrc] = useState(product.image_url);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const isSaved = isInWishlist(product.id);

  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleWishlist(product);
    showCardToast(isSaved ? t('product.removeFavorite') : t('product.addFavorite'));
  };

  const showCardToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/api/track-click?id=${product.id}`;
    const shareData = {
      title: product.title,
      text: t('product.shareText').replace('{title}', product.title),
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showCardToast(t('product.linkCopied'));
      } catch (err) {
        console.error('Error copying link:', err);
      }
    }
  };

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
    otros: {
      label: t('product.otherCta'),
      icon: <LinkIcon size={16} strokeWidth={2.5} />,
      class: 'otros',
    },
  };

  const source = sourceConfig[product.affiliate_source] || sourceConfig.amazon;
  if (product.category === 'suscripciones') {
    source.label = t('product.subscribeCta') || '¿Cómo conseguirlo?';
    source.class = 'suscripciones';
  }
  const categoryLabel = t(`product.categoryLabels.${product.category}`) || product.category;

  return (
    <m.article
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
            className={`${styles.image} ${product.category === 'suscripciones' ? styles.containImage : ''}`}
            onError={() => {
              setImgSrc('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iI2ZmZiIgYWxpZ249Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=');
            }}
          />
          
          <AnimatePresence>
            {showToast && (
              <m.div 
                className={styles.cardToast}
                initial={{ opacity: 0, y: -10, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
              >
                {toastMsg}
              </m.div>
            )}
          </AnimatePresence>

          <div className={styles.topActions}>
             <button 
               className={`${styles.actionBtn} ${isSaved ? styles.saved : ''}`}
               onClick={toggleSave}
               title={isSaved ? t('product.removeFavorite') : t('product.addFavorite')}
             >
               <Heart size={16} fill={isSaved ? "currentColor" : "none"} strokeWidth={isSaved ? 0 : 2} />
             </button>
             <button 
               className={styles.actionBtn}
               onClick={handleShare}
               title={t('product.share')}
             >
               <Share2 size={16} strokeWidth={2.5} />
             </button>
          </div>

          <div className={styles.overlay}>
            <div className={styles.overlayButtons}>
              <a 
                href={`/api/track-click?id=${product.id}`}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className={`${styles.ctaButton} ${styles[source.class]}`}
              >
                {source.icon} {source.label}
              </a>
              <button className={styles.quickViewBtn} onClick={handleQuickView}>
                <Flame size={16} /> {t('product.quickView')}
              </button>
            </div>
          </div>
          
          <span className={`${styles.sourcePill} ${styles[source.class + 'Pill']}`}>
            {product.affiliate_source}
          </span>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.categoryRow}>
            <span className={styles.category}>{categoryLabel}</span>
            {product.featured && (
              <Flame size={14} strokeWidth={3} className={styles.trendingIcon} />
            )}
          </div>
          <h3 className={styles.title}>
            <a
              href={`/api/track-click?id=${product.id}`}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className={styles.mainLink}
            >
              {product.title}
            </a>
          </h3>
          <div className={styles.bottom}>
            <a 
              href={`/api/track-click?id=${product.id}`}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className={`${styles.ctaMini} ${styles[source.class]}`}
            >
              {product.category === 'suscripciones'
                ? (t('product.subscribeCta') || '¿Cómo conseguirlo?')
                : t('product.discoverCta')
              } <LinkIcon size={14} className={styles.miniIcon} />
            </a>
            {product.category === 'suscripciones' && product.price > 0 && (
              <span className={styles.price}>
                {product.price}€<span className={styles.pricePeriod}>/{product.price_period === 'dia' ? 'día' : product.price_period === 'año' ? 'año' : 'mes'}</span>
              </span>
            )}
          </div>
        </div>
    </m.article>
  );
}
