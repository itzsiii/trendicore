import { CheckCircle2, Star, Edit, Upload, Eye } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from '@/app/(admin)/dashboard/dashboard.module.css';

export default function ProductList({
  loading,
  filteredProducts,
  selectedIds,
  toggleSelect,
  currentUser,
  handleToggleFeatured,
  handlePublish,
  handleEdit,
  setDeleteConfirm,
}) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className={styles.productsGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonImage}></div>
            <div className={styles.skeletonInfo}>
              <div className={styles.skeletonTitle}></div>
              <div className={styles.skeletonMeta}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📦</span>
        <h3>{t('admin.empty_title')}</h3>
        <p>{t('admin.empty_text')}</p>
      </div>
    );
  }

  return (
    <div className={styles.productsGrid}>
      {filteredProducts.map((product) => (
        <div 
          key={product.id} 
          className={`${styles.productCard} ${selectedIds.includes(product.id) ? styles.selected : ''} ${product.status === 'published' ? styles.publishedCard : styles.pendingCard}`}
        >
          <div className={styles.productImageCover}>
            <div className={styles.selectionOverlay} onClick={() => toggleSelect(product.id)}>
              <div className={`${styles.checkbox} ${selectedIds.includes(product.id) ? styles.checked : ''}`}>
                {selectedIds.includes(product.id) && <CheckCircle2 size={16} />}
              </div>
            </div>
            <img src={product.image_url} alt={product.title} />
            
            <div className={`${styles.statusBadge} ${product.status === 'draft' ? styles.draft : styles.published}`}>
              {product.status === 'published' ? t('admin.state_published') : t('admin.state_pending')}
            </div>

            {currentUser?.role === 'admin' && (
              <button 
                className={`${styles.featuredToggle} ${product.featured ? styles.active : ''}`}
                onClick={() => handleToggleFeatured(product.id, product.featured)}
                title={product.featured ? t('admin.featured_remove_title') : t('admin.featured_add_title')}
              >
                <Star size={14} fill={product.featured ? 'currentColor' : 'none'} />
              </button>
            )}
            <span className={`${styles.sourceBadge} ${styles[product.affiliate_source]}`}>
              {product.affiliate_source === 'amazon' ? '🟠 Amazon' : product.affiliate_source === 'shein' ? '🟣 Shein' : '🔵 Otros'}
            </span>
            <span className={styles.regionFlag}>
              <img
                src={`/images/flags/${product.region === 'us' ? 'us' : 'es'}.svg`}
                alt={product.region === 'us' ? 'US' : 'ES'}
              />
              {product.region === 'us' ? 'US' : 'ES'}
            </span>
          </div>
          <div className={styles.productInfo}>
            <h3 className={styles.productTitle}>{product.title}</h3>
            <div className={styles.productMeta}>
              <span className={styles.price}>{product.price ? `${product.price}€${product.price_period ? `/${product.price_period === 'dia' ? 'día' : product.price_period === 'año' ? 'año' : 'mes'}` : ''}` : t('admin.no_price')}</span>
              <span className={styles.clicks}>🖱️ {product.clicks || 0} {t('admin.clicks_label')}</span>
            </div>
            <a 
              href={product.affiliate_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.affiliateLink}
              title={product.affiliate_link}
            >
              {(() => { try { return new URL(product.affiliate_link).hostname; } catch { return 'Enlace no válido'; } })()}
            </a>
            
            <div className={styles.productActions}>
               {(currentUser?.role === 'admin' || currentUser?.role === 'co-admin') && product.status === 'draft' && (
                  <button 
                    onClick={() => handlePublish(product.id)}
                    className={styles.publishBtn}
                  >
                     <Upload size={14} /> {t('admin.actions.publish')}
                  </button>
               )}
               {/* Si es creador o admin */}
               {(currentUser?.role === 'admin' || currentUser?.id === product.created_by) && (
                 <>
                  <button onClick={() => handleEdit(product)} className={styles.editBtn}>
                    <Edit size={14} /> {t('admin.actions.edit')}
                  </button>
                  <button onClick={() => setDeleteConfirm(product)} className={styles.deleteBtn}>
                    {t('admin.delete_btn')}
                  </button>
                 </>
               )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
