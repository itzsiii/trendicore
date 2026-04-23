'use client';

import { useState, useMemo } from 'react';
import { m } from 'framer-motion';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import { ProductErrorBoundary } from '@/components/product/ProductErrorBoundary';
import QuickViewModal from '@/components/product/QuickViewModal';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { TrendingUp, ArrowRight, Scan, ShieldCheck, ShoppingCart, Zap, Target } from 'lucide-react';
import styles from './home.module.css';

export default function HomeClient({ initialFeatured = [], initialLatest = [], initialSubscriptions = [], serverRegion = 'es' }) {
  const { region, t } = useLocale();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Featured Products Hook (small showcase only)
  const featuredQuery = useMemo(() => ({
    featured: true,
    region: region,
    limit: 4
  }), [region]);

  const { products: featured, loading: featuredLoading } = useProducts(
    featuredQuery, 
    [region],
    region === serverRegion ? initialFeatured.slice(0, 4) : null
  );

  return (
    <div className={styles.page}>
      {/* Hero Section — Clean, Bifurcated */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <m.div
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
          </m.div>

          <m.div
            className={styles.heroCtas}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              href="/tienda"
              variant="primary"
              size="large"
              iconLeft={<TrendingUp size={18} strokeWidth={2} />}
              iconRight={<ArrowRight size={18} />}
            >
              {t('hero.ctaFashion')}
            </Button>
            
            <Button
              href="/para-marcas"
              variant="secondary"
              size="large"
              iconLeft={<Target size={18} strokeWidth={2} />}
              iconRight={<ArrowRight size={18} />}
            >
              {t('brands.ctaSecondaryShort') || t('nav.brands')}
            </Button>
          </m.div>
        </div>

        <m.div
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
            <span className={styles.statNumber}>5+</span>
            <span className={styles.statLabel}>{t('stats.platforms')}</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>24h</span>
            <span className={styles.statLabel}>{t('stats.update')}</span>
          </div>
        </m.div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection}>
        <div className={styles.sectionHeaderCentered}>
          <m.div
            className={styles.sectionTag}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Zap size={12} strokeWidth={3} /> {t('howItWorks.tag')}
          </m.div>
          <m.h2
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('howItWorks.title')}
          </m.h2>
        </div>

        <div className={styles.stepsGrid}>
          {[
            { icon: <Scan size={28} strokeWidth={1.5} />, titleKey: 'howItWorks.step1Title', descKey: 'howItWorks.step1Desc', color: 'var(--accent)' },
            { icon: <ShieldCheck size={28} strokeWidth={1.5} />, titleKey: 'howItWorks.step2Title', descKey: 'howItWorks.step2Desc', color: 'var(--pink)' },
            { icon: <ShoppingCart size={28} strokeWidth={1.5} />, titleKey: 'howItWorks.step3Title', descKey: 'howItWorks.step3Desc', color: 'var(--cyan)' },
          ].map((step, i) => (
            <m.div
              key={i}
              className={styles.stepCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <div className={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</div>
              <div className={styles.stepIcon} style={{ color: step.color, background: `${step.color}15` }}>
                {step.icon}
              </div>
              <h3>{t(step.titleKey)}</h3>
              <p>{t(step.descKey)}</p>
              {i < 2 && <div className={styles.stepConnector}></div>}
            </m.div>
          ))}
        </div>
      </section>

      <div className={styles.catalogWrapper}>
        {/* Featured Section — Compact showcase */}
        {featured.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.sectionTag}><TrendingUp size={12} strokeWidth={3} style={{ display: 'inline', marginBottom: '-2px' }} /> HOT</div>
                <h2 className={styles.sectionTitle}>{t('sections.trendingTitle')}</h2>
                <p className={styles.sectionSubtitle}>{t('sections.trendingSubtitle')}</p>
              </div>
              <Button href="/tienda" variant="secondary" size="small" iconRight={<ArrowRight size={16} />}>
                {t('categories.fashionCta')}
              </Button>
            </div>
            <ProductErrorBoundary>
            <div className={styles.grid}>
              {featured.slice(0, 4).map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onQuickView={setSelectedProduct}
                />
              ))}
            </div>
            </ProductErrorBoundary>
          </section>
        )}

        {/* B2B Banner — replaces old category banners */}
        <section className={styles.b2bBanner}>
          <m.div
            className={styles.b2bInner}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className={styles.b2bContent}>
              <span className={styles.b2bTag}>
                <Target size={14} /> {t('brands.badge')}
              </span>
              <h2 className={styles.b2bTitle}>{t('brands.heroLine1')} <span>{t('brands.heroHighlight')}</span></h2>
              <p className={styles.b2bDesc}>{t('brands.heroSub')}</p>
              <Button
                href="/para-marcas"
                variant="primary"
                size="large"
                iconRight={<ArrowRight size={18} />}
              >
                {t('brands.ctaPrimary')}
              </Button>
            </div>
          </m.div>
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
