'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Flame, Sparkles, Zap } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from './TrendingBar.module.css';

/**
 * TrendingBar — Horizontal scrolling bar of trending search terms.
 * 
 * Shows below the navbar on home and shop pages.
 * Each chip links to the store with a search query.
 * Auto-scrolls horizontally for a "live ticker" effect.
 */

const TRENDING_TERMS = [
  { term: 'coquette bow', icon: '🎀', hot: true },
  { term: 'tech gadgets 2026', icon: '⚡', hot: true },
  { term: 'aesthetic room', icon: '🦋', hot: false },
  { term: 'minimalist wallet', icon: '🤍', hot: false },
  { term: 'dark academia', icon: '📚', hot: false },
  { term: 'LED gaming', icon: '🎮', hot: true },
  { term: 'crochet top', icon: '🧶', hot: false },
  { term: 'wireless earbuds', icon: '🎧', hot: false },
  { term: 'streetwear oversized', icon: '🔥', hot: true },
  { term: 'smart watch', icon: '⌚', hot: false },
  { term: 'Y2K sunglasses', icon: '🕶️', hot: false },
  { term: 'mechanical keyboard', icon: '⌨️', hot: false },
];

export default function TrendingBar() {
  const { t } = useLocale();
  const router = useRouter();
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll effect
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId;
    let scrollSpeed = 0.5;

    const scroll = () => {
      if (!isPaused && el) {
        el.scrollLeft += scrollSpeed;
        // Loop back when reaching the end
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
          el.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  const handleChipClick = (term) => {
    router.push(`/tienda?q=${encodeURIComponent(term)}`);
  };

  // Double the terms for infinite scroll illusion
  const displayTerms = [...TRENDING_TERMS, ...TRENDING_TERMS];

  return (
    <div className={styles.bar}>
      <div className={styles.label}>
        <TrendingUp size={13} strokeWidth={2.5} />
        <span>{t('trending.label')}</span>
      </div>
      <div
        ref={scrollRef}
        className={styles.track}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={styles.chips}>
          {displayTerms.map((item, i) => (
            <button
              key={`${item.term}-${i}`}
              className={`${styles.chip} ${item.hot ? styles.chipHot : ''}`}
              onClick={() => handleChipClick(item.term)}
            >
              <span className={styles.chipEmoji}>{item.icon}</span>
              <span>{item.term}</span>
              {item.hot && <Flame size={10} className={styles.hotIcon} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
