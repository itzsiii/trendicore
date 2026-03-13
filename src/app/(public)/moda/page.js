'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
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

      let query = supabase
        .from('products')
        .select('*')
        .eq('region', region)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (activeTab === 'hombre') {
        query = query.eq('category', 'moda-hombre');
      } else if (activeTab === 'mujer') {
        query = query.eq('category', 'moda-mujer');
      } else {
        query = query.in('category', ['moda-hombre', 'moda-mujer']);
      }

      const { data } = await query;
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
