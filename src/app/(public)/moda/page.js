'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from '@/components/providers/LocaleProvider';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import { TrendingUp, Sparkles } from 'lucide-react';
import styles from '../category.module.css';

export default function ModaPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { region, t } = useLocale();

  useEffect(() => {
    async function fetchProducts() {
      if (!region) return;

      let url = `/api/products?region=${region}`;
      
      if (activeTab === 'hombre') {
        url += '&category=moda-hombre';
      } else if (activeTab === 'mujer') {
        url += '&category=moda-mujer';
      } else {
        // Para "all" en esta página queremos ambas categorías de moda
        // Como nuestra API de ejemplo solo soporta una categoría, podemos manejarlo así
        // o ampliar la API para soportar múltiples. Por simplicidad aquí hacemos fetch y filtramos si es necesario
        // Pero para seguir el flujo hexagonal, lo ideal es que la API lo resuelva.
        // Voy a asumir que si no mando categoría, me devuelve todo y yo filtro, o mejor uso la API.
        url += '&categories=moda-hombre,moda-mujer';
      }

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data || []);
      setLoading(false);
    }

    fetchProducts();
  }, [activeTab, region]);

  const tabs = [
    { value: 'all', label: t('fashionPage.tabAll') },
    { value: 'mujer', label: t('fashionPage.tabWomen') },
    { value: 'hombre', label: t('fashionPage.tabMen') },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.headerIcon}><TrendingUp size={36} strokeWidth={1.5} /></span>
          <h1 className={styles.title}>{t('fashionPage.title')}</h1>
          <p className={styles.subtitle}>
            {t('fashionPage.subtitle')}
          </p>
        </motion.div>

        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setLoading(true); }}
              className={`${styles.tab} ${activeTab === tab.value ? styles.tabActive : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
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
            <p><Sparkles size={16} style={{ display: 'inline', marginBottom: '-3px' }} /> {t('fashionPage.empty')}</p>
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
