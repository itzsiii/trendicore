'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/components/providers/LocaleProvider';
import { Sparkles, TrendingUp, Wallet, ArrowRight, ArrowLeft, Zap, X } from 'lucide-react';
import styles from './OnboardingModal.module.css';

const STYLE_OPTIONS = [
  { id: 'aesthetic', emoji: '🦋' },
  { id: 'streetwear', emoji: '🔥' },
  { id: 'minimalist', emoji: '🤍' },
  { id: 'dark-academia', emoji: '📚' },
  { id: 'coquette', emoji: '🎀' },
  { id: 'techwear', emoji: '⚡' },
  { id: 'vintage', emoji: '🌻' },
  { id: 'sporty', emoji: '🏃' },
];

const CATEGORY_OPTIONS = [
  { id: 'moda-mujer', emoji: '👗' },
  { id: 'moda-hombre', emoji: '👔' },
  { id: 'tech', emoji: '💻' },
  { id: 'entretenimiento', emoji: '🎬' },
  { id: 'suscripciones', emoji: '📦' },
];

const BUDGET_OPTIONS = [
  { id: 'low', range: '< 30€' },
  { id: 'mid', range: '30-80€' },
  { id: 'high', range: '> 80€' },
  { id: 'any', range: '∞' },
];

/**
 * OnboardingModal — 3-step wizard shown to new users.
 * 
 * Step 1: Choose style preferences
 * Step 2: Choose favorite categories  
 * Step 3: Choose budget range
 */
export default function OnboardingModal({ onComplete, onSkip }) {
  const { t } = useLocale();
  const [step, setStep] = useState(0);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [budgetRange, setBudgetRange] = useState('any');

  const totalSteps = 3;

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

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete({
        style_preferences: selectedStyles,
        favorite_categories: selectedCategories,
        budget_range: budgetRange,
      });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const steps = [
    {
      icon: <Sparkles size={28} strokeWidth={1.5} />,
      title: t('onboarding.step1Title'),
      subtitle: t('onboarding.step1Subtitle'),
      content: (
        <div className={styles.chipGrid}>
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style.id}
              className={`${styles.chip} ${selectedStyles.includes(style.id) ? styles.chipActive : ''}`}
              onClick={() => toggleStyle(style.id)}
            >
              <span className={styles.chipEmoji}>{style.emoji}</span>
              <span>{t(`profile.style${style.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`)}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: <TrendingUp size={28} strokeWidth={1.5} />,
      title: t('onboarding.step2Title'),
      subtitle: t('onboarding.step2Subtitle'),
      content: (
        <div className={styles.chipGrid}>
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.chip} ${selectedCategories.includes(cat.id) ? styles.chipActive : ''}`}
              onClick={() => toggleCategory(cat.id)}
            >
              <span className={styles.chipEmoji}>{cat.emoji}</span>
              <span>{t(`product.categoryLabels.${cat.id}`)}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: <Wallet size={28} strokeWidth={1.5} />,
      title: t('onboarding.step3Title'),
      subtitle: t('onboarding.step3Subtitle'),
      content: (
        <div className={styles.budgetGrid}>
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`${styles.budgetCard} ${budgetRange === opt.id ? styles.budgetActive : ''}`}
              onClick={() => setBudgetRange(opt.id)}
            >
              <span className={styles.budgetRange}>{opt.range}</span>
              <span className={styles.budgetLabel}>{t(`profile.budget${opt.id.charAt(0).toUpperCase() + opt.id.slice(1)}`)}</span>
            </button>
          ))}
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className={styles.overlay}>
      <m.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <button className={styles.closeBtn} onClick={onSkip}>
          <X size={18} />
        </button>

        {/* Progress Bar */}
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          ></div>
        </div>

        {/* Step Header */}
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}>{currentStep.icon}</div>
          <div className={styles.stepCounter}>
            {t('onboarding.step')} {step + 1} / {totalSteps}
          </div>
          <h2 className={styles.stepTitle}>{currentStep.title}</h2>
          <p className={styles.stepSubtitle}>{currentStep.subtitle}</p>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <m.div
            key={step}
            className={styles.stepContent}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep.content}
          </m.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className={styles.nav}>
          {step > 0 ? (
            <button className={styles.backBtn} onClick={handleBack}>
              <ArrowLeft size={16} /> {t('onboarding.back')}
            </button>
          ) : (
            <button className={styles.skipBtn} onClick={onSkip}>
              {t('onboarding.skip')}
            </button>
          )}

          <button className={styles.nextBtn} onClick={handleNext}>
            {step === totalSteps - 1 ? (
              <>{t('onboarding.finish')} <Zap size={16} /></>
            ) : (
              <>{t('onboarding.next')} <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </m.div>
    </div>
  );
}
