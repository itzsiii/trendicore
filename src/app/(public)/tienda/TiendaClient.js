'use client';

import { useState, useMemo } from 'react';
import { Search, X, Clock, TrendingUp, Flame, Heart, Sparkles } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import { ProductErrorBoundary } from '@/components/product/ProductErrorBoundary';
import QuickViewModal from '@/components/product/QuickViewModal';
import styles from './tienda.module.css';

export default function TiendaClient({ initialProducts = [], serverRegion = 'es' }) {
  const { t, region } = useLocale();
  const { isAuthenticated, profile } = useAuth();

  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') || '';
    }
    return '';
  });
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = useMemo(() => [
    { id: 'all', label: t('shop.cat.all'), emoji: '✦' },
    { id: 'moda-mujer', label: t('shop.cat.women'), emoji: '🦋' },
    { id: 'moda-hombre', label: t('shop.cat.men'), emoji: '☕' },
    { id: 'tech', label: t('shop.cat.tech'), emoji: '💻' },
    { id: 'entretenimiento', label: t('shop.cat.entertainment'), emoji: '🎟️' },
    { id: 'suscripciones', label: t('shop.cat.digital'), emoji: '🎧' },
  ], [t]);

  const sortOptions = useMemo(() => {
    const opts = [
      { id: 'newest', label: t('shop.filters.newest'), icon: <Clock size={14} /> },
      { id: 'popular', label: t('shop.filters.popular'), icon: <TrendingUp size={14} /> },
      { id: 'trending', label: t('shop.filters.trending'), icon: <Flame size={14} /> },
    ];
    if (isAuthenticated && profile?.onboarding_completed) {
      opts.push({ id: 'forYou', label: t('shop.filters.forYou'), icon: <Heart size={14} /> });
    }
    return opts;
  }, [t, isAuthenticated, profile]);

  const query = useMemo(() => {
    const defaultQuery = {
      region: region || serverRegion,
      limit: 50,
      category: activeCategory !== 'all' ? activeCategory : undefined,
      search: searchQuery || undefined,
      sortBy: sortBy
    };

    if (sortBy === 'forYou' && profile?.favorite_categories?.length > 0) {
      defaultQuery.preferredCategories = profile.favorite_categories.join(',');
    }

    return defaultQuery;
  }, [region, serverRegion, activeCategory, searchQuery, sortBy, profile]);

  const { products, loading } = useProducts(
    query, 
    [region, activeCategory, searchQuery, sortBy],
    (region === serverRegion && activeCategory === 'all' && !searchQuery) ? initialProducts : null
  );

  return (
    <div className={styles.feedPage}>

      {/* Compact Header */}
      <header className={styles.feedHeader}>
        <div className={styles.headerInner}>
          <div className={styles.headerTop}>
            <h1 className={styles.feedTitle}>{t('shop.title')}</h1>
            <p className={styles.feedSubtitle}>{t('shop.subtitle')}</p>
          </div>

          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={18} />
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

      {/* Categories */}
      <div className={styles.chipsWrapper}>
        <div className={styles.chipsRow}>
          {categories.map(cat => (
            <button 
              key={cat.id}
              className={`${styles.chip} ${activeCategory === cat.id ? styles.chipActive : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className={styles.chipEmoji}>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <main className={styles.mainContent}>
        {/* Toolbar: results + sort */}
        <div className={styles.toolbar}>
          <span className={styles.resultsInfo}>
            {products.length} {t('shop.results.found')}
          </span>

          <div className={styles.sortGroup}>
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
        {(activeCategory !== 'all' || searchQuery) && (
          <div className={styles.activeFilters}>
            {activeCategory !== 'all' && (
              <button className={styles.filterTag} onClick={() => setActiveCategory('all')}>
                {categories.find(c => c.id === activeCategory)?.label} <X size={11} />
              </button>
            )}
            {searchQuery && (
              <button className={styles.filterTag} onClick={() => setSearchQuery('')}>
                &ldquo;{searchQuery}&rdquo; <X size={11} />
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
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
              <Search size={28} className={styles.emptyIcon} />
            </div>
            <h2 className={styles.emptyTitle}>{t('shop.results.noResults')}</h2>
            <p className={styles.emptyText}>{t('shop.results.tryAgain')}</p>
            <button className={styles.emptyReset} onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}>
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

      <QuickViewModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}
