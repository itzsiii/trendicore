import { Sparkles, Flame, Globe, Clock, TrendingUp as TrendingUpIcon } from 'lucide-react';
import React from 'react';

export const TAG_MAP = {
  'aesthetic': 'moda-mujer',
  'coquette': 'moda-mujer',
  'dark academia': 'moda-hombre',
  'tech setup': 'tech',
  'viral': null
};

export const HOME_SERVICES = [
  {
    icon: <Sparkles size={24} />,
    iconBg: 'rgba(var(--accent-rgb), 0.1)',
    iconColor: 'var(--accent)',
    titleKey: 'servicesPage.curationTitle',
    descKey: 'servicesPage.curationDesc',
  },
  {
    icon: <Flame size={24} />,
    iconBg: 'rgba(var(--pink-rgb), 0.1)',
    iconColor: 'var(--pink)',
    titleKey: 'footer.dailyDrops',
    descKey: 'footer.newsletterDesc',
  },
  {
    icon: <Globe size={24} />,
    iconBg: 'rgba(var(--cyan-rgb), 0.1)',
    iconColor: 'var(--cyan)',
    titleKey: 'servicesPage.globalTitle',
    descKey: 'servicesPage.globalDesc',
  },
];

export const TIENDA_CATEGORIES = (t) => [
  { id: 'all', label: t('shop.filters.allCategories') },
  { id: 'moda-mujer', label: t('product.categoryLabels.moda-mujer') },
  { id: 'moda-hombre', label: t('product.categoryLabels.moda-hombre') },
  { id: 'tech', label: t('product.categoryLabels.tech') },
  { id: 'entretenimiento', label: t('product.categoryLabels.entretenimiento') },
];

export const TIENDA_SOURCES = (t) => [
  { id: 'all', label: t('shop.filters.allSources') },
  { id: 'amazon', label: 'Amazon' },
  { id: 'shein', label: 'Shein' },
  { id: 'otros', label: 'Otros' },
];

export const SORT_OPTIONS = (t) => [
  { id: 'newest', label: t('shop.filters.newest'), icon: <Clock size={14} /> },
  { id: 'popular', label: t('shop.filters.popular'), icon: <TrendingUpIcon size={14} /> },
];
