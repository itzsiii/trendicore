'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const { t } = useLocale();

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.searchBox}>
        <div className={styles.searchIcon}>
          <Search size={16} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('nav.searchPlaceholder') || 'Buscar...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className={styles.clearButton} onClick={handleClear}>
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
