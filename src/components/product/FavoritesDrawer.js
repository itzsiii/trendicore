'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import styles from './FavoritesDrawer.module.css';

export default function FavoritesDrawer({ isOpen, onClose }) {
  const { t } = useLocale();
  const { wishlist, removeFromWishlist, count } = useWishlist();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div 
            className={styles.drawer}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <Heart size={20} fill="var(--accent)" strokeWidth={0} />
                <h2>{t('wishlist.title')}</h2>
                <span className={styles.count}>{count}</span>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.content}>
              {wishlist.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Heart size={48} strokeWidth={1} />
                  </div>
                  <p>{t('wishlist.empty')}</p>
                  <button className={styles.exploreBtn} onClick={onClose}>
                    {t('nav.store')}
                  </button>
                </div>
              ) : (
                <div className={styles.list}>
                  {wishlist.map((product) => (
                    <div key={product.id} className={styles.item}>
                      <div className={styles.itemImage}>
                        <Image 
                          src={product.image_url} 
                          alt={product.title}
                          fill
                          sizes="80px"
                          className={styles.img}
                        />
                      </div>
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemTitle}>{product.title}</h3>
                        <div className={styles.itemActions}>
                          <a 
                            href={`/api/track-click?id=${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.buyBtn}
                          >
                            <ShoppingBag size={14} />
                            {t('wishlist.viewProduct')}
                          </a>
                          <button 
                            className={styles.removeBtn}
                            onClick={() => removeFromWishlist(product.id)}
                            title={t('product.removeFavorite')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {wishlist.length > 0 && (
              <div className={styles.footer}>
                <button className={styles.continueBtn} onClick={onClose}>
                  {t('nav.store')} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
