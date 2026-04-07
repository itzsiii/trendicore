'use client';

import { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, Clock, TrendingUp } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useProducts } from '@/hooks/useProducts';
import { TIENDA_CATEGORIES, TIENDA_SOURCES, SORT_OPTIONS } from '@/config/constants';
import ProductCard from '@/components/product/ProductCard';
import { ProductErrorBoundary } from '@/components/product/ProductErrorBoundary';
import QuickViewModal from '@/components/product/QuickViewModal';
import styles from './tienda.module.css';

export default function TiendaClient({ initialProducts = [], serverRegion = 'es' }) {
  const { t, region } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSource, setActiveSource] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categories = useMemo(() => TIENDA_CATEGORIES(t), [t]);
  const sources = useMemo(() => TIENDA_SOURCES(t), [t]);
  const sortOptions = useMemo(() => SORT_OPTIONS(t), [t]);

  // 1. Data Fetching Hook (Centralized)
  const query = useMemo(() => ({
    region: region || serverRegion,
    limit: 50,
    category: activeCategory !== 'all' ? activeCategory : undefined,
    search: searchQuery || undefined,
    source: activeSource !== 'all' ? activeSource : undefined,
    sortBy: sortBy
  }), [region, serverRegion, activeCategory, searchQuery, activeSource, sortBy]);

  const { products, loading } = useProducts(
    query, 
    [region, activeCategory, searchQuery, activeSource, sortBy],
    (region === serverRegion && activeCategory === 'all' && !searchQuery) ? initialProducts : null
  );

  const activeFilterCount = (activeCategory !== 'all' ? 1 : 0) + (activeSource !== 'all' ? 1 : 0);

  return (
    <div className={styles.shopPage}>
      <div className={styles.bgDecor}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
      </div>

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

      <div className={styles.shopLayout}>
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

          <button 
            className={styles.sidebarClose}
            onClick={() => setSidebarOpen(false)}
          >
            {t('tienda.applyFilters')}
          </button>
        </aside>

        {sidebarOpen && (
          <div className={styles.sidebarBackdrop} onClick={() => setSidebarOpen(false)} />
        )}

        <main className={styles.mainContent}>
          <div className={styles.topBar}>
            <span className={styles.resultsInfo}>
              {products.length} {t('shop.results.found')}
            </span>

            <div className={styles.topBarRight}>
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
            <ProductErrorBoundary>
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
            </ProductErrorBoundary>
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
