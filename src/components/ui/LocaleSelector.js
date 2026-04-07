'use client';

import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/components/providers/LocaleProvider';
import { Globe, Check, ChevronDown } from 'lucide-react';
import styles from './LocaleSelector.module.css';

export default function LocaleSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const { locale, region, setLocale, setRegion, t } = useLocale();
    const containerRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const regions = [
        { id: 'es', name: 'España', flag: '🇪🇸', native: 'Español' },
        { id: 'us', name: 'United States', flag: '🇺🇸', native: 'English' }
    ];

    const currentRegion = regions.find(r => r.id === region) || regions[0];

    const handleSelect = (rId) => {
        setRegion(rId);
        // Sync language with region as default
        setLocale(rId === 'us' ? 'en' : 'es');
        setIsOpen(false);
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <button
                className={`${styles.trigger} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title={`Region: ${currentRegion.name} | Lang: ${locale.toUpperCase()}`}
            >
                <img
                    src={`/images/flags/${region || 'es'}.svg`}
                    alt={currentRegion.name}
                    className={styles.currentFlag}
                />
                <span className={styles.regionName}>{currentRegion.name}</span>
                <ChevronDown size={14} className={`${styles.chevron} ${isOpen ? styles.chevronRotate : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
                        <m.div
                            className={styles.dropdown}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <div className={styles.dropdownHeader}>
                                <Globe size={14} />
                                <span>{t('localeSelector.header')}</span>
                            </div>

                            <div className={styles.options}>
                                {regions.map((r) => (
                                    <button
                                        key={r.id}
                                        className={`${styles.option} ${region === r.id ? styles.optionSelected : ''}`}
                                        onClick={() => handleSelect(r.id)}
                                    >
                                        <div className={styles.optionMain}>
                                            <img
                                                src={`/images/flags/${r.id}.svg`}
                                                alt={r.name}
                                                className={styles.optionFlag}
                                            />
                                            <div className={styles.optionInfo}>
                                                <span className={styles.optionName}>{r.name}</span>
                                                <span className={styles.optionLang}>{r.native}</span>
                                            </div>
                                        </div>
                                        {region === r.id && <Check size={16} className={styles.checkIcon} />}
                                    </button>
                                ))}
                            </div>
                        </m.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
