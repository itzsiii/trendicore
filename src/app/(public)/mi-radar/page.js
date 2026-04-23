'use client';

import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Radar, Flame, BellRing, Target, TrendingUp, Sparkles, 
  ChevronRight, Activity, Zap
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { ProductErrorBoundary } from '@/components/product/ProductErrorBoundary';
import QuickViewModal from '@/components/product/QuickViewModal';
import styles from './radar.module.css';
import { supabase } from '@/lib/supabase';

export default function MiRadarPage() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const { wishlist, count: wishlistCount } = useWishlist();

  const [alerts, setAlerts] = useState([]);
  const [forYouProducts, setForYouProducts] = useState([]);
  const [loadingRadar, setLoadingRadar] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Handle Mock Checkout Upgrade
  useEffect(() => {
    const upgradeTier = searchParams.get('upgrade_tier');
    if (upgradeTier && isAuthenticated && profile?.tier !== upgradeTier) {
      updateProfile({ tier: upgradeTier }).then(() => {
        // Clean URL to prevent recurring updates
        router.replace('/mi-radar');
        alert(`¡Felicidades! Has sido ascendido a nivel ${upgradeTier.toUpperCase()}`);
      });
    }
  }, [searchParams, isAuthenticated, profile, updateProfile, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/acceder');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch specialized data for the radar
  useEffect(() => {
    if (!isAuthenticated || !profile) return;

    let active = true;
    async function fetchRadarData() {
      try {
        // Build query string for 'For You' products
        const limit=4;
        const prefs = profile.favorite_categories?.join(',') || '';
        const res = await fetch(`/api/products?sortBy=forYou&limit=${limit}&preferredCategories=${prefs}`);
        
        if (res.ok) {
          const data = await res.json();
          if (active) setForYouProducts(data);
        }

        // Mock Trend Alerts (In a full prod app this would be a real API endpoint fetching recent drops)
        if (active) {
          setAlerts([
            { id: 1, type: 'hot', title: 'Nueva tendencia Aesthetic', time: 'Hace 2 horas', icon: <Flame size={16} color="#ff4b2b" /> },
            { id: 2, type: 'drop', title: 'Drop de Techwear que sigue tu estilo', time: 'Hace 5 horas', icon: <Zap size={16} color="#eab308" /> },
            { id: 3, type: 'match', title: '3 productos bajaron de precio en tu Wishlist', time: 'Ayer', icon: <Target size={16} color="#10b981" /> }
          ]);
        }
      } catch (err) {
        console.error('Error fetching radar data', err);
      } finally {
        if (active) setLoadingRadar(false);
      }
    }

    fetchRadarData();
    return () => { active = false; };
  }, [isAuthenticated, profile]);

  if (authLoading || !isAuthenticated) return null;

  // Gamification: Calculate Level
  const calcLevel = () => {
    const score = (profile.favorite_categories?.length || 0) * 10 
                + (profile.style_preferences?.length || 0) * 15 
                + wishlistCount * 5;
    
    if (score > 100) return { name: 'Trendsetter Pro', color: 'var(--accent)', icon: <Zap size={16} /> };
    if (score > 50) return { name: 'Early Adopter', color: 'var(--pink)', icon: <Flame size={16} /> };
    return { name: 'Newbie Explorer', color: 'var(--cyan)', icon: <Radar size={16} /> };
  };

  const level = calcLevel();

  return (
    <div className={styles.page}>
      
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Radar size={32} className={styles.titleIcon} />
            {t('dashboard.title')}
          </h1>
          <p className={styles.subtitle}>{t('dashboard.subtitle')}</p>
        </div>
      </div>

      <div className={styles.dashboard}>
        {/* Lado Izquierdo: Gamificación y Alertas */}
        <div className={styles.sidebar}>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><Activity size={18}/> {t('dashboard.level')}</h2>
            </div>
            
            <div className={styles.levelWrap}>
              <div className={styles.levelBadge} style={{ backgroundColor: `${level.color}20`, color: level.color, borderColor: level.color }}>
                <Sparkles size={16}/> {level.name}
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{wishlistCount}</span>
                <span className={styles.statLab}>{t('dashboard.saved')}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{profile?.style_preferences?.length || 0}</span>
                <span className={styles.statLab}>{t('dashboard.styles')}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><BellRing size={18}/> {t('dashboard.alerts')}</h2>
              <button className={styles.viewAllBtn}>{t('dashboard.viewAll')}</button>
            </div>
            <div className={styles.alertsList}>
              {alerts.map(alert => (
                <div key={alert.id} className={styles.alertItem}>
                  <div className={styles.alertIconWrap}>
                    {alert.type === 'drop' ? <Flame size={16} color="var(--accent)"/> : <TrendingUp size={16} color="var(--success)"/>}
                  </div>
                  <div className={styles.alertInfo}>
                    <div className={styles.alertTitle}>{alert.title}</div>
                    <div className={styles.alertTime}>{alert.time}</div>
                  </div>
                  <ChevronRight size={16} className={styles.alertArrow} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lado Derecho: Feed Personalizado */}
        <div className={styles.mainContent}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><Target size={18}/> {t('dashboard.feed')}</h2>
            </div>
            
            {loadingRadar ? (
              <div className={styles.loadingWrap}>
                <div className={styles.spinner} />
              </div>
            ) : forYouProducts.length === 0 ? (
              <div className={styles.emptyState}>
                {t('dashboard.empty')}
              </div>
            ) : (
              <ProductErrorBoundary>
                <div className={styles.productsGrid}>
                  {forYouProducts.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} onQuickView={setSelectedProduct} />
                  ))}
                </div>
              </ProductErrorBoundary>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
