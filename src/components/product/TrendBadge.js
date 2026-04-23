'use client';

import { Flame, Zap, Sparkles } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from './TrendBadge.module.css';

/**
 * TrendBadge — Visual indicator of product trend intensity.
 * 
 * Tiers:
 *  - 🔥 Trending (80-100) — Red/orange pulse animation
 *  - ⚡ Rising  (50-79)  — Amber glow
 *  - ✨ Curated (1-49)   — Violet subtle
 * 
 * @param {{ score: number, size?: 'sm' | 'md', showLabel?: boolean }} props
 */
export default function TrendBadge({ score = 0, size = 'sm', showLabel = true }) {
  const { t } = useLocale();

  const tier = score >= 80 ? 'trending' : score >= 50 ? 'rising' : 'curated';

  const config = {
    trending: {
      icon: <Flame size={size === 'md' ? 16 : 12} strokeWidth={2.5} />,
      label: t('trendBadge.trending'),
      className: styles.trending,
    },
    rising: {
      icon: <Zap size={size === 'md' ? 16 : 12} strokeWidth={2.5} />,
      label: t('trendBadge.rising'),
      className: styles.rising,
    },
    curated: {
      icon: <Sparkles size={size === 'md' ? 16 : 12} strokeWidth={2.5} />,
      label: t('trendBadge.curated'),
      className: styles.curated,
    },
  };

  const { icon, label, className } = config[tier];

  return (
    <span className={`${styles.badge} ${className} ${styles[size]}`} title={`Trend Score: ${score}/100`}>
      {icon}
      {showLabel && <span className={styles.label}>{label}</span>}
      {size === 'md' && <span className={styles.score}>{score}</span>}
    </span>
  );
}
