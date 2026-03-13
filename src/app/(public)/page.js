'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/components/providers/LocaleProvider';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import Link from 'next/link';
import { TrendingUp, Cpu, Sparkles, Flame, ArrowRight } from 'lucide-react';
import styles from './home.module.css';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const { region, t } = useLocale();

  useEffect(() => {
    async function fetchProducts() {
      if (!region) return;
      setLoading(true);

      let featuredQuery = supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('status', 'published')
        .eq('region', region)
        .order('created_at', { ascending: false })
        .limit(6);

      let latestQuery = supabase
        .from('products')
        .select('*')
        .eq('status', 'published')
        .eq('region', region)
        .order('created_at', { ascending: false });
      
      if (activeTag) {
        // Asumiendo que las etiquetas están en una columna 'tags' o 'title'
        // Para simplificar, filtraremos por 'category' si el tag coincide con una categoría 
        // o buscaremos en el título si es un tag genérico.
        const tagMap = {
          'aesthetic': 'moda-mujer',
          'coquette': 'moda-mujer',
          'dark academia': 'moda-hombre',
          'tech setup': 'tech',
          'viral': null
        };
        
        if (tagMap[activeTag] !== undefined && tagMap[activeTag] !== null) {
          latestQuery = latestQuery.eq('category', tagMap[activeTag]);
        } else if (tagMap[activeTag] === null) {
          // 'viral' = all categories, no extra filter
        } else {
          latestQuery = latestQuery.ilike('title', `%${activeTag}%`);
        }
      }

      latestQuery = latestQuery.limit(12);

      const [featuredRes, latestRes] = await Promise.all([featuredQuery, latestQuery]);

      setFeatured(featuredRes.data || []);
      setLatest(latestRes.data || []);
      setLoading(false);
    }

    fetchProducts();
  }, [region, activeTag]);

  const handleTagClick = (tag) => {
    setActiveTag(activeTag === tag ? null : tag);
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Animated Background Orbs */}
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
            <Link href="/moda" className={styles.ctaPrimary}>
              <span className={styles.ctaIcon}><TrendingUp size={18} strokeWidth={2} /></span>
              <span>{t('hero.ctaFashion')}</span>
              <span className={styles.ctaArrow}><ArrowRight size={18} /></span>
            </Link>
            <Link href="/tech" className={styles.ctaSecondary}>
              <span className={styles.ctaIcon}><Cpu size={18} strokeWidth={2} /></span>
              <span>{t('hero.ctaTech')}</span>
              <span className={styles.ctaArrow}><ArrowRight size={18} /></span>
            </Link>
          </motion.div>

          <motion.div
            className={styles.heroTags}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {['aesthetic', 'coquette', 'dark academia', 'tech setup', 'viral'].map((tag) => (
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

        {/* Stats Bar */}
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
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}><Sparkles size={12} strokeWidth={3} style={{ display: 'inline', marginBottom: '-2px' }} /> {activeTag ? t('sections.filtered') : t('sections.newTag')}</div>
          <h2 className={styles.sectionTitle}>{activeTag ? `${t('sections.trendsFor')} #${activeTag}` : t('sections.newTitle')}</h2>
          <p className={styles.sectionSubtitle}>{activeTag ? `${t('sections.browsingTag')} ${activeTag}` : t('sections.newSubtitle')}</p>
        </div>
        {loading ? (
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
        ) : latest.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyGlow}></div>
            <span className={styles.emptyEmoji}><Sparkles size={48} strokeWidth={1.5} color="var(--accent)" /></span>
            <h3 className={styles.emptyTitle}>{t('sections.emptyTitle')}</h3>
            <p className={styles.emptyText}>{t('sections.emptyText')}</p>
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

      {/* Category Banners */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('sections.categoriesTitle')}</h2>
        </div>
        <div className={styles.categoryGrid}>
          <Link href="/moda" className={styles.categoryBanner}>
            <motion.div
              className={`${styles.categoryCard} ${styles.modaCard}`}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.categoryGlow}></div>
              <div className={styles.categoryContent}>
                <span className={styles.categoryEmoji}><TrendingUp size={40} strokeWidth={1.5} color="var(--pink)" /></span>
                <h3 className={styles.categoryTitle}>{t('categories.fashionTitle')}</h3>
                <p className={styles.categoryDesc}>{t('categories.fashionDesc')}</p>
                <span className={styles.categoryArrow}>
                  {t('categories.fashionCta')}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </span>
              </div>
              <div className={styles.categoryPattern}></div>
            </motion.div>
          </Link>

          <Link href="/tech" className={styles.categoryBanner}>
            <motion.div
              className={`${styles.categoryCard} ${styles.techCard}`}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.categoryGlow}></div>
              <div className={styles.categoryContent}>
                <span className={styles.categoryEmoji}><Cpu size={40} strokeWidth={1.5} color="var(--cyan)" /></span>
                <h3 className={styles.categoryTitle}>{t('categories.techTitle')}</h3>
                <p className={styles.categoryDesc}>{t('categories.techDesc')}</p>
                <span className={styles.categoryArrow}>
                  {t('categories.techCta')}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </span>
              </div>
              <div className={styles.categoryPattern}></div>
            </motion.div>
          </Link>
        </div>
      </section>

      <QuickViewModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
