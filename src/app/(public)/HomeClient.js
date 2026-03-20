'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useProducts } from '@/hooks/useProducts';
import { TAG_MAP, HOME_SERVICES } from '@/config/constants';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { TrendingUp, Cpu, Sparkles, Flame, ArrowRight, Film } from 'lucide-react';
import styles from './home.module.css';

export default function HomeClient({ initialFeatured = [], initialLatest = [], serverRegion = 'es' }) {
  const { region, t } = useLocale();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTag, setActiveTag] = useState(null);

  // 1. Featured Products Hook
  const featuredQuery = useMemo(() => ({
    featured: true,
    region: region,
    limit: 6
  }), [region]);

  const { products: featured, loading: featuredLoading } = useProducts(
    featuredQuery, 
    [region],
    region === serverRegion ? initialFeatured : null
  );

  // 2. Latest Products Hook
  const latestQuery = useMemo(() => {
    const query = { region, limit: 12 };
    if (activeTag) {
      if (TAG_MAP[activeTag]) {
        query.category = TAG_MAP[activeTag];
      } else {
        query.search = activeTag;
      }
    }
    return query;
  }, [region, activeTag]);

  const { products: latest, loading: latestLoading } = useProducts(
    latestQuery,
    [region, activeTag],
    (region === serverRegion && !activeTag) ? initialLatest : null
  );

  const handleTagClick = (tag) => {
    setActiveTag(activeTag === tag ? null : tag);
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOrbs}>
          <div className={`${styles.orb} ${styles.orb1}`}></div>
          <div className={`${styles.orb} ${styles.orb2}`}></div>
          <div className={`${styles.orb} ${styles.orb3}`}></div>
        </div>

        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.heroBadgeWrap}>
              <span className={styles.heroBadge}>
                <span className={styles.badgeDot}></span>
                {t('hero.badge')}
              </span>
            </div>
            <h1 className={styles.heroTitle}>
              {t('hero.titleLine1')}
              <br />
              <span className={styles.heroHighlight}>{t('hero.titleHighlight')}</span>
              <span className={styles.heroHighlight2}>{t('hero.titleLine2')}</span>
            </h1>
            <p className={styles.heroSubtitle}>
              {t('hero.subtitle')}
            </p>
          </motion.div>

          <motion.div
            className={styles.heroCtas}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              href="/moda"
              variant="primary"
              size="large"
              iconLeft={<TrendingUp size={18} strokeWidth={2} />}
              iconRight={<ArrowRight size={18} />}
            >
              {t('hero.ctaFashion')}
            </Button>
            
            <Button
              href="/tech"
              variant="secondary"
              size="large"
              iconLeft={<Cpu size={18} strokeWidth={2} />}
              iconRight={<ArrowRight size={18} />}
            >
              {t('hero.ctaTech')}
            </Button>
          </motion.div>

          <motion.div
            className={styles.heroTags}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {Object.keys(TAG_MAP).map((tag) => (
              <button
                key={tag}
                className={`${styles.tag} ${activeTag === tag ? styles.activeTag : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                #{tag}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div
          className={styles.statsBar}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <div className={styles.stat}>
            <span className={styles.statNumber}>100+</span>
            <span className={styles.statLabel}>{t('stats.products')}</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>2</span>
            <span className={styles.statLabel}>{t('stats.platforms')}</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>24h</span>
            <span className={styles.statLabel}>{t('stats.update')}</span>
          </div>
        </motion.div>
      </section>

      {/* Services Overview Section */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesGrid}>
          {HOME_SERVICES.map((svc, i) => (
            <motion.div 
              key={i}
              className={styles.serviceItem}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={styles.serviceIcon} style={{ background: svc.iconBg, color: svc.iconColor }}>
                {svc.icon}
              </div>
              <div>
                <h3>{t(svc.titleKey)}</h3>
                <p>{t(svc.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className={styles.catalogWrapper}>
        {/* Featured Section */}
        {featured.length > 0 && !activeTag && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTag}><Flame size={12} strokeWidth={3} style={{ display: 'inline', marginBottom: '-2px' }} /> HOT</div>
              <h2 className={styles.sectionTitle}>{t('sections.trendingTitle')}</h2>
              <p className={styles.sectionSubtitle}>{t('sections.trendingSubtitle')}</p>
            </div>
            <div className={styles.grid}>
              {featured.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onQuickView={setSelectedProduct}
                />
              ))}
            </div>
          </section>
        )}

        {/* Latest Products */}
        {(latestLoading || latest.length > 0) && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTag}>
                <Sparkles size={12} strokeWidth={3} style={{ display: 'inline', marginBottom: '-2px' }} /> 
                {activeTag ? t('sections.filtered') : t('sections.newTag')}
              </div>
              <h2 className={styles.sectionTitle}>
                {activeTag ? `${t('sections.trendsFor')} #${activeTag}` : t('sections.newTitle')}
              </h2>
              <p className={styles.sectionSubtitle}>
                {activeTag ? `${t('sections.browsingTag')} ${activeTag}` : t('sections.newSubtitle')}
              </p>
            </div>

            {latestLoading ? (
              <div className={styles.loadingGrid}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={styles.skeleton}>
                    <div className={styles.skeletonImage}></div>
                    <div className={styles.skeletonInfo}>
                      <div className={styles.skeletonLine} style={{ width: '40%' }}></div>
                      <div className={styles.skeletonLine} style={{ width: '80%' }}></div>
                      <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.grid}>
                {latest.map((product, i) => (
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
        )}

        {/* Category Banners */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('sections.categoriesTitle')}</h2>
          </div>
          <div className={styles.categoryGrid}>
            <Link href="/tienda" className={styles.categoryBanner}>
              <motion.div
                className={`${styles.categoryCard} ${styles.modaCard}`}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.categoryGlow}></div>
                <div className={styles.categoryContent}>
                  <span className={styles.categoryEmoji}><TrendingUp size={40} strokeWidth={1.5} color="var(--pink)" /></span>
                  <h3 className={styles.categoryTitle}>{t('categories.fashionTitle')}</h3>
                  {t('categories.fashionDesc') && (
                    <p className={styles.categoryDesc}>{t('categories.fashionDesc')}</p>
                  )}
                  <span className={styles.categoryArrow}>
                    {t('categories.fashionCta')}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </span>
                </div>
                <div className={styles.categoryPattern}></div>
              </motion.div>
            </Link>

            <Link href="/servicios" className={styles.categoryBanner}>
              <motion.div
                className={`${styles.categoryCard} ${styles.serviciosCard}`}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.categoryGlow}></div>
                <div className={styles.categoryContent}>
                  <span className={styles.categoryEmoji}><Sparkles size={40} strokeWidth={1.5} color="var(--pink)" /></span>
                  <h3 className={styles.categoryTitle}>{t('categories.servicesTitle')}</h3>
                  {t('categories.servicesDesc') && (
                    <p className={styles.categoryDesc}>{t('categories.servicesDesc')}</p>
                  )}
                  <span className={styles.categoryArrow}>
                    {t('categories.servicesCta')}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </span>
                </div>
                <div className={styles.categoryPattern}></div>
              </motion.div>
            </Link>
          </div>
        </section>
      </div>

      <QuickViewModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
