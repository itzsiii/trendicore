'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import styles from './DashboardCharts.module.css';
import { useLocale } from '@/components/providers/LocaleProvider';

export default function DashboardCharts({ products }) {
  const { t } = useLocale();

  // 1. Data processing: Categories
  const categoryData = [
    { name: t('product.categoryLabels.moda-hombre'), value: products.filter(p => p.category === 'moda-hombre').length, color: '#3b82f6' },
    { name: t('product.categoryLabels.moda-mujer'), value: products.filter(p => p.category === 'moda-mujer').length, color: '#ec4899' },
    { name: t('product.categoryLabels.tech'), value: products.filter(p => p.category === 'tech').length, color: '#8b5cf6' },
  ];

  // 2. Data processing: Affiliate Sources
  const sourceData = [
    { name: 'Amazon', value: products.filter(p => p.affiliate_source === 'amazon').length, color: '#f59e0b' },
    { name: 'Shein', value: products.filter(p => p.affiliate_source === 'shein').length, color: '#6366f1' },
  ];

  // 3. Data processing: Clicks Trend (Mocking by grouping by creation date if available)
  // Since we don't have many days of data, we use a simple grouping
  const getClicksTrend = () => {
    const dates = {};
    products.forEach(p => {
      const date = p.created_at ? new Date(p.created_at).toLocaleDateString() : t('admin.charts.unknown');
      dates[date] = (dates[date] || 0) + (p.clicks || 0);
    });
    return Object.entries(dates).map(([name, clicks]) => ({ name, clicks })).slice(-7);
  };

  const trendData = getClicksTrend();

  const COLORS = ['#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981'];

  return (
    <div className={styles.chartsGrid}>
      {/* 1. Categorías Bar Chart */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>📦 {t('admin.charts.categoryDistribution')}</h3>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Clicks Trend Area Chart */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>📈 {t('admin.charts.clicksPerformance')}</h3>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
              />
              <Area type="monotone" dataKey="clicks" stroke="#7c3aed" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Fuentes Pie Chart */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>🔗 {t('admin.charts.affiliateSources')}</h3>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
