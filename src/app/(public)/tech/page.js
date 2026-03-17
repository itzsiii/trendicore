'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from '@/components/providers/LocaleProvider';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import { Cpu, Sparkles } from 'lucide-react';
import styles from '../category.module.css';

export default function TechPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { region, t } = useLocale();

  useEffect(() => {
    async function fetchProducts() {
      if (!region) return;

      const res = await fetch(`/api/products?category=tech&region=${region}`);
      const data = await res.json();
      
      setProducts(data || []);
      setLoading(false);
    }

    fetchProducts();
  }, [region]);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.headerIcon}><Cpu size={36} strokeWidth={1.5} /></span>
          <h1 className={styles.title}>{t('techPage.title')}</h1>
          <p className={styles.subtitle}>
            {t('techPage.subtitle')}
          </p>
        </motion.div>
      </section>

      <section className={styles.content}>
        {loading ? (
          <div className={styles.loadingGrid}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.skeleton}></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p><Sparkles size={16} style={{ display: 'inline', marginBottom: '-3px' }} /> {t('techPage.empty')}</p>
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
