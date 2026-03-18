'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, ChevronDown, ArrowUpDown, TrendingUp, Clock, SlidersHorizontal, Grid, LayoutGrid } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import styles from './tienda.module.css';

export default function TiendaClient({ initialProducts = [], serverRegion = 'es' }) {
  const { t, region } = useLocale();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSource, setActiveSource] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState('category');

  const categories = [
    { id: 'all', label: t('shop.filters.allCategories') },
    { id: 'moda-mujer', label: t('product.categoryLabels.moda-mujer') },
    { id: 'moda-hombre', label: t('product.categoryLabels.moda-hombre') },
    { id: 'tech', label: t('product.categoryLabels.tech') },
    { id: 'entretenimiento', label: t('product.categoryLabels.entretenimiento') },
  ];

  const sources = [
    { id: 'all', label: t('shop.filters.allSources') },
    { id: 'amazon', label: 'Amazon' },
    { id: 'shein', label: 'Shein' },
    { id: 'otros', label: 'Otros' },
  ];

  const sortOptions = [
    { id: 'newest', label: t('shop.filters.newest'), icon: <Clock size={14} /> },
    { id: 'popular', label: t('shop.filters.popular'), icon: <TrendingUp size={14} /> },
  ];

  useEffect(() => {
    async function updateProducts() {
      setLoading(true);
      let url = `/api/products?region=${region || serverRegion}&limit=50`;
      if (activeCategory !== 'all') url += `&category=${activeCategory}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      
      try {
        const res = await fetch(url);
        if (res.ok) {
          let data = await res.json();
          if (activeSource !== 'all') {
            data = data.filter(p => p.affiliate_source === activeSource);
          }
          if (sortBy === 'popular') {
            data.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
          } else {
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          }
          setProducts(data);
        }
      } catch (err) {
        console.error('Error updating shop products:', err);
      } finally {
        setLoading(false);
      }
    }


    const timer = setTimeout(updateProducts, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, activeSource, sortBy, region, serverRegion]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const activeFilterCount = (activeCategory !== 'all' ? 1 : 0) + (activeSource !== 'all' ? 1 : 0);

  return (
    <div className={styles.shopPage}>
      {/* Background Decor */}
      <div className={styles.bgDecor}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
      </div>

      {/* Compact Header with Search */}
      <header className={styles.shopHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.shopTitle}>{t('shop.title')}</h1>
            <p className={styles.shopSubtitle}>{t('shop.subtitle')}</p>
          </div>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={16} />
            <input 
              type="text" 
              placeholder={t('shop.searchPlaceholder')}
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar + Grid */}
      <div className={styles.shopLayout}>
        
        {/* Mobile Filter Toggle */}
        <button 
          className={styles.mobileFilterBtn} 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <SlidersHorizontal size={16} />
          {t('shop.filters.title')}
          {activeFilterCount > 0 && (
            <span className={styles.filterBadge}>{activeFilterCount}</span>
          )}
        </button>

        {/* Sidebar Filters */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>{t('shop.filters.title')}</h3>
            {activeFilterCount > 0 && (
              <button 
                className={styles.clearFilters}
                onClick={() => { setActiveCategory('all'); setActiveSource('all'); }}
              >
                {t('shop.filters.clear')}
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className={styles.filterGroup}>
            <div className={styles.filterGroupHeader}>
              <span>{t('shop.filters.category')}</span>
            </div>
            <div className={styles.filterOptions}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.filterOption} ${activeCategory === cat.id ? styles.filterActive : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className={styles.radio}>
                    {activeCategory === cat.id && <span className={styles.radioDot} />}
                  </span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Source Filter */}
          <div className={styles.filterGroup}>
            <div className={styles.filterGroupHeader}>
              <span>{t('shop.filters.source')}</span>
            </div>
            <div className={styles.filterOptions}>
              {sources.map(src => (
                <button
                  key={src.id}
                  className={`${styles.filterOption} ${activeSource === src.id ? styles.filterActive : ''}`}
                  onClick={() => setActiveSource(src.id)}
                >
                  <span className={styles.radio}>
                    {activeSource === src.id && <span className={styles.radioDot} />}
                  </span>
                  {src.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile close */}
          <button 
            className={styles.sidebarClose}
            onClick={() => setSidebarOpen(false)}
          >
            Aplicar filtros
          </button>
        </aside>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div className={styles.sidebarBackdrop} onClick={() => setSidebarOpen(false)} />
        )}

        {/* Content Area */}
        <main className={styles.mainContent}>
          {/* Top Bar */}
          <div className={styles.topBar}>
            <span className={styles.resultsInfo}>
              {products.length} {t('shop.results.found')}
            </span>

            <div className={styles.topBarRight}>
              {/* Sort pills */}
              {sortOptions.map(opt => (
                <button
                  key={opt.id}
                  className={`${styles.sortPill} ${sortBy === opt.id ? styles.sortActive : ''}`}
                  onClick={() => setSortBy(opt.id)}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(activeCategory !== 'all' || activeSource !== 'all' || searchQuery) && (
            <div className={styles.activeFilters}>
              {activeCategory !== 'all' && (
                <button className={styles.filterTag} onClick={() => setActiveCategory('all')}>
                  {t(`product.categoryLabels.${activeCategory}`)} <X size={11} />
                </button>
              )}
              {activeSource !== 'all' && (
                <button className={styles.filterTag} onClick={() => setActiveSource('all')}>
                  {activeSource} <X size={11} />
                </button>
              )}
              {searchQuery && (
                <button className={styles.filterTag} onClick={() => setSearchQuery('')}>
                  &ldquo;{searchQuery}&rdquo; <X size={11} />
                </button>
              )}
            </div>
          )}

          {/* Products */}
          {loading ? (
            <div className={styles.productsGrid}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonInfo}>
                    <div className={styles.skeletonLine} style={{ width: '40%' }}></div>
                    <div className={styles.skeletonLine} style={{ width: '85%' }}></div>
                    <div className={styles.skeletonLine} style={{ width: '55%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                <Search size={32} className={styles.emptyIcon} />
              </div>
              <h2 className={styles.emptyTitle}>{t('shop.results.noResults')}</h2>
              <p className={styles.emptyText}>{t('shop.results.tryAgain')}</p>
              <button className={styles.emptyReset} onClick={() => { setActiveCategory('all'); setSearchQuery(''); setActiveSource('all'); }}>
                {t('shop.filters.clear') || 'Limpiar filtros'}
              </button>
            </div>
          ) : (
            <div className={styles.productsGrid}>
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
        </main>
      </div>

      <QuickViewModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}
