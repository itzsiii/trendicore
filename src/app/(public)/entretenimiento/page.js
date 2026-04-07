'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { m } from 'framer-motion';
import { Play, Music, Zap, Sparkles, TrendingUp } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import styles from '../category.module.css';

export default function EntertainmentPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { region, t } = useLocale();

  useEffect(() => {
    async function fetchProducts() {
      if (!region) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/products?region=${region}&category=entretenimiento`);
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching entertainment products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [region]);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.headerIcon}><Zap size={36} strokeWidth={1.5} color="var(--accent)" /></span>
          <h1 className={styles.title}>{t('entertainmentPage.title')}</h1>
          <p className={styles.subtitle}>
            {t('entertainmentPage.subtitle')}
          </p>
        </m.div>
      </section>

      <section className={styles.content}>
        <div style={{ marginBottom: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <m.div 
            className={styles.infoBox}
            whileHover={{ y: -5 }}
            style={{ padding: '2rem', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderLeft: '4px solid var(--accent)' }}
          >
            <Zap size={24} color="var(--accent)" style={{ marginBottom: '1rem' }} />
            <h3>{t('entertainmentPage.viralTitle')}</h3>
            <p>{t('entertainmentPage.viralDesc')}</p>
          </m.div>

          <m.div 
            className={styles.infoBox}
            whileHover={{ y: -5 }}
            style={{ padding: '2rem', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderLeft: '4px solid var(--pink)' }}
          >
            <Music size={24} color="var(--pink)" style={{ marginBottom: '1rem' }} />
            <h3>{t('entertainmentPage.lifestyleTitle')}</h3>
            <p>{t('entertainmentPage.lifestyleDesc')}</p>
          </m.div>
        </div>

        <div className={styles.sectionHeader}>
           <h2 className={styles.sectionTitle} style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              <Sparkles size={18} style={{ display: 'inline', marginRight: '8px' }} />
              Libros, Juegos y Más
           </h2>
        </div>

        {loading ? (
          <div className={styles.loadingGrid}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.skeleton}></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p><Sparkles size={16} style={{ display: 'inline', marginBottom: '-3px' }} /> {t('entertainmentPage.comingSoon')}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product, i) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={i} 
                onQuickView={setSelectedProduct} 
              />
            ))}
          </div>
        )}
      </section>

      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
