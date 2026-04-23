'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useRouter } from 'next/navigation';
import { Check, Shield, Zap, Sparkles, Code, Download } from 'lucide-react';
import styles from './premium.module.css';

export default function PremiumPage() {
  const { user, profile, isAuthenticated } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [loadingStr, setLoadingStr] = useState(null);

  const handleSubscribe = async (tierId) => {
    if (!isAuthenticated) {
      router.push('/acceder?redirect=/premium');
      return;
    }
    setLoadingStr(tierId);
    try {
      const res = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert('Error al procesar pago: ' + data.error);
        setLoadingStr(null);
      }
    } catch (err) {
      console.error(err);
      setLoadingStr(null);
    }
  };

  const currentTier = profile?.tier || 'free';

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '€0',
      period: 'por siempre',
      description: t('premium.free_desc'),
      features: [
        'Catálogo completo',
        'Wishlist básica',
        'Búsqueda por categoría'
      ],
      icon: <Shield size={24} color="var(--text-muted)" />,
      cta: t('premium.currentPlan'),
      disabled: currentTier === 'free'
    },
    {
      id: 'trendsetter',
      name: 'Trendsetter',
      price: '€4.99',
      period: 'al mes',
      description: t('premium.ts_desc'),
      features: [
        'Dashboard Mi Radar personal',
        'Alertas tempranas de tendencia',
        'Feed "Para Ti" ilimitado',
        'Acceso sin anuncios'
      ],
      icon: <Zap size={24} color="var(--accent)" />,
      popular: true,
      cta: currentTier === 'trendsetter' ? t('premium.currentPlan') : 'Ser Trendsetter',
      disabled: currentTier === 'trendsetter' || currentTier === 'creator_pro'
    },
    {
      id: 'creator_pro',
      name: 'Creator Pro',
      price: '€14.99',
      period: 'al mes',
      description: t('premium.pro_desc'),
      features: [
        'Todo lo de Trendsetter',
        'Acceso a API B2B (REST)',
        'Descarga de Trend Reports CSV',
        'Badge de Cuenta Verificada'
      ],
      icon: <Code size={24} color="var(--pink)" />,
      cta: currentTier === 'creator_pro' ? t('premium.currentPlan') : 'Mejorar a Pro',
      disabled: currentTier === 'creator_pro'
    }
  ];

  return (
    <div className={styles.page}>
      
      <div className={styles.hero}>
        <div className={styles.badge}><Sparkles size={14}/> Upgrade</div>
        <h1 className={styles.title}>{t('premium.title')} <span>{t('premium.titleHighlight')}</span></h1>
        <p className={styles.subtitle}>{t('premium.subtitle')}</p>
      </div>

      <div className={styles.grid}>
        {plans.map((plan, i) => (
          <m.div 
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${styles.card} ${plan.popular ? styles.popular : ''}`}
          >
            {plan.popular && <div className={styles.popularTag}>{t('premium.popular')}</div>}
            
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>{plan.icon}</div>
              <h2 className={styles.planName}>{plan.name}</h2>
              <div className={styles.priceWrap}>
                <span className={styles.price}>{plan.price}</span>
                <span className={styles.period}>/{plan.period}</span>
              </div>
              <p className={styles.planDesc}>{plan.description}</p>
            </div>

            <div className={styles.features}>
              {plan.features.map((feat, idx) => (
                <div key={idx} className={styles.featureItem}>
                  <Check size={18} className={styles.checkIcon} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <button 
              className={`${styles.ctaBtn} ${plan.disabled ? styles.ctaDisabled : ''} ${plan.popular ? styles.ctaAccent : ''}`}
              disabled={plan.disabled || loadingStr === plan.id}
              onClick={() => handleSubscribe(plan.id)}
            >
              {loadingStr === plan.id ? 'Redirigiendo...' : plan.cta}
            </button>
          </m.div>
        ))}
      </div>

      {isAuthenticated && currentTier === 'creator_pro' && (
        <div className={styles.apiBanner}>
          <div className={styles.apiInfo}>
            <h3>Ya eres Creator Pro</h3>
            <p>Puedes empezar a generar claves API para conectar tu eCommerce a nuestro sistema de IA.</p>
          </div>
          <button className={styles.apiBtn} onClick={() => router.push('/api-docs')}>
             Ir a la API <Download size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
