'use client';

import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useRouter } from 'next/navigation';
import {
  User, Mail, LogOut, Heart, TrendingUp, Settings,
  ChevronRight, Sparkles, Save, Check, Palette
} from 'lucide-react';
import OnboardingModal from '@/components/user/OnboardingModal';
import styles from './perfil.module.css';

const STYLE_OPTIONS = [
  { id: 'aesthetic', emoji: '🦋', labelKey: 'profile.styleAesthetic' },
  { id: 'streetwear', emoji: '🔥', labelKey: 'profile.styleStreetwear' },
  { id: 'minimalist', emoji: '🤍', labelKey: 'profile.styleMinimalist' },
  { id: 'dark-academia', emoji: '📚', labelKey: 'profile.styleDarkAcademia' },
  { id: 'coquette', emoji: '🎀', labelKey: 'profile.styleCoquette' },
  { id: 'techwear', emoji: '⚡', labelKey: 'profile.styleTechwear' },
  { id: 'vintage', emoji: '🌻', labelKey: 'profile.styleVintage' },
  { id: 'sporty', emoji: '🏃', labelKey: 'profile.styleSporty' },
];

const CATEGORY_OPTIONS = [
  { id: 'moda-mujer', emoji: '👗', labelKey: 'product.categoryLabels.moda-mujer' },
  { id: 'moda-hombre', emoji: '👔', labelKey: 'product.categoryLabels.moda-hombre' },
  { id: 'tech', emoji: '💻', labelKey: 'product.categoryLabels.tech' },
  { id: 'entretenimiento', emoji: '🎬', labelKey: 'product.categoryLabels.entretenimiento' },
  { id: 'suscripciones', emoji: '📦', labelKey: 'product.categoryLabels.suscripciones' },
];

const BUDGET_OPTIONS = [
  { id: 'low', labelKey: 'profile.budgetLow', range: '< 30€' },
  { id: 'mid', labelKey: 'profile.budgetMid', range: '30-80€' },
  { id: 'high', labelKey: 'profile.budgetHigh', range: '> 80€' },
  { id: 'any', labelKey: 'profile.budgetAny', range: '∞' },
];

export default function PerfilPage() {
  const { t } = useLocale();
  const { user, profile, isAuthenticated, loading: authLoading, signOut, updateProfile } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable state
  const [displayName, setDisplayName] = useState('');
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [budgetRange, setBudgetRange] = useState('any');

  // Sync profile data to local state
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setSelectedStyles(profile.style_preferences || []);
      setSelectedCategories(profile.favorite_categories || []);
      setBudgetRange(profile.budget_range || 'any');

      // Show onboarding if not completed
      if (!profile.onboarding_completed) {
        setShowOnboarding(true);
      }
    }
  }, [profile]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/acceder');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  const toggleStyle = (id) => {
    setSelectedStyles(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName,
        style_preferences: selectedStyles,
        favorite_categories: selectedCategories,
        budget_range: budgetRange,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleOnboardingComplete = async (preferences) => {
    try {
      await updateProfile({
        ...preferences,
        onboarding_completed: true,
      });
      setShowOnboarding(false);
    } catch (err) {
      console.error('Onboarding save error:', err);
    }
  };

  const userInitial = displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <m.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.avatar}>
            <span>{userInitial}</span>
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.userName}>{displayName || user?.email}</h1>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
        </m.div>

        {/* Quick Stats */}
        <m.div
          className={styles.statsRow}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.statCard}>
            <Heart size={18} className={styles.statIcon} style={{ color: 'var(--pink)' }} />
            <span className={styles.statValue}>{wishlistCount}</span>
            <span className={styles.statLabel}>{t('profile.savedItems')}</span>
          </div>
          <div className={styles.statCard}>
            <Palette size={18} className={styles.statIcon} style={{ color: 'var(--accent)' }} />
            <span className={styles.statValue}>{selectedStyles.length}</span>
            <span className={styles.statLabel}>{t('profile.styles')}</span>
          </div>
          <div className={styles.statCard}>
            <TrendingUp size={18} className={styles.statIcon} style={{ color: 'var(--cyan)' }} />
            <span className={styles.statValue}>{selectedCategories.length}</span>
            <span className={styles.statLabel}>{t('profile.categories')}</span>
          </div>
        </m.div>

        {/* Display Name */}
        <m.section
          className={styles.section}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className={styles.sectionTitle}>
            <User size={18} /> {t('profile.displayNameLabel')}
          </h2>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t('profile.displayNamePlaceholder')}
            className={styles.input}
            maxLength={30}
          />
        </m.section>

        {/* Style Preferences */}
        <m.section
          className={styles.section}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className={styles.sectionTitle}>
            <Sparkles size={18} /> {t('profile.styleTitle')}
          </h2>
          <p className={styles.sectionDesc}>{t('profile.styleDesc')}</p>
          <div className={styles.chipGrid}>
            {STYLE_OPTIONS.map((style) => (
              <button
                key={style.id}
                className={`${styles.chip} ${selectedStyles.includes(style.id) ? styles.chipActive : ''}`}
                onClick={() => toggleStyle(style.id)}
              >
                <span className={styles.chipEmoji}>{style.emoji}</span>
                <span>{t(style.labelKey)}</span>
              </button>
            ))}
          </div>
        </m.section>

        {/* Favorite Categories */}
        <m.section
          className={styles.section}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className={styles.sectionTitle}>
            <TrendingUp size={18} /> {t('profile.categoriesTitle')}
          </h2>
          <p className={styles.sectionDesc}>{t('profile.categoriesDesc')}</p>
          <div className={styles.chipGrid}>
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.chip} ${selectedCategories.includes(cat.id) ? styles.chipActive : ''}`}
                onClick={() => toggleCategory(cat.id)}
              >
                <span className={styles.chipEmoji}>{cat.emoji}</span>
                <span>{t(cat.labelKey)}</span>
              </button>
            ))}
          </div>
        </m.section>

        {/* Budget Range */}
        <m.section
          className={styles.section}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className={styles.sectionTitle}>
            <Settings size={18} /> {t('profile.budgetTitle')}
          </h2>
          <div className={styles.budgetGrid}>
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                className={`${styles.budgetCard} ${budgetRange === opt.id ? styles.budgetActive : ''}`}
                onClick={() => setBudgetRange(opt.id)}
              >
                <span className={styles.budgetRange}>{opt.range}</span>
                <span className={styles.budgetLabel}>{t(opt.labelKey)}</span>
              </button>
            ))}
          </div>
        </m.section>

        {/* Save + Logout */}
        <m.div
          className={styles.actionsRow}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <button
            className={`${styles.saveBtn} ${saved ? styles.saveBtnSuccess : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className={styles.spinnerSm}></span>
            ) : saved ? (
              <><Check size={18} /> {t('profile.saved')}</>
            ) : (
              <><Save size={18} /> {t('profile.saveBtn')}</>
            )}
          </button>

          <button className={styles.logoutBtn} onClick={handleSignOut}>
            <LogOut size={16} /> {t('profile.logout')}
          </button>
        </m.div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
