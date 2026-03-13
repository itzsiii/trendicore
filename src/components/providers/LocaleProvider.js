'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import esDict from '@/i18n/es.json';
import enDict from '@/i18n/en.json';

const dictionaries = { es: esDict, en: enDict };

const LocaleContext = createContext();

export function LocaleProvider({ children }) {
    const [locale, setLocaleState] = useState('es');
    const [region, setRegionState] = useState(null); // null = not selected yet
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const savedLocale = localStorage.getItem('trendicore-locale');
        const savedRegion = localStorage.getItem('trendicore-region');

        if (savedLocale) {
            setLocaleState(savedLocale);
        }

        if (savedRegion) {
            setRegionState(savedRegion);
        } else {
            // Default region if none saved
            setRegionState('es');
            // Also set default locale based on region
            if (!savedLocale) setLocaleState('es');
        }

        setReady(true);
    }, []);

    const setLocale = useCallback((l) => {
        setLocaleState(l);
        localStorage.setItem('trendicore-locale', l);
    }, []);

    const setRegion = useCallback((r) => {
        setRegionState(r);
        localStorage.setItem('trendicore-region', r);
    }, []);

    const selectCountry = useCallback((country) => {
        // country = 'us' | 'es'
        setRegion(country);
        setLocale(country === 'us' ? 'en' : 'es');
    }, [setRegion, setLocale]);

    // Translation function with dot-notation support
    const t = useCallback((key) => {
        const dict = dictionaries[locale] || dictionaries.es;
        const keys = key.split('.');
        let value = dict;
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    }, [locale]);

    return (
        <LocaleContext.Provider value={{ locale, region, ready, setLocale, setRegion, selectCountry, t }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
    return ctx;
}
