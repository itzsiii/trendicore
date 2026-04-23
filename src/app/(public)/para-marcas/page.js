'use client';

import { m } from 'framer-motion';
import { useLocale } from '@/components/providers/LocaleProvider';
import { ArrowRight, TrendingUp, FileText, Users, CheckCircle, Target, Sparkles, MessageSquare, Zap, Shield } from 'lucide-react';
import styles from './para-marcas.module.css';

export default function ParaMarcasPage() {
  const { t } = useLocale();

  const services = [
    {
      icon: <TrendingUp size={28} />,
      title: t('brands.service1Title'),
      desc: t('brands.service1Desc'),
    },
    {
      icon: <FileText size={28} />,
      title: t('brands.service2Title'),
      desc: t('brands.service2Desc'),
    },
    {
      icon: <Users size={28} />,
      title: t('brands.service3Title'),
      desc: t('brands.service3Desc'),
    },
  ];

  const steps = [
    {
      number: '01',
      title: t('brands.step1Title'),
      desc: t('brands.step1Desc'),
    },
    {
      number: '02',
      title: t('brands.step2Title'),
      desc: t('brands.step2Desc'),
    },
    {
      number: '03',
      title: t('brands.step3Title'),
      desc: t('brands.step3Desc'),
    },
  ];

  const faqs = [
    { q: t('brands.faq1Q'), a: t('brands.faq1A') },
    { q: t('brands.faq2Q'), a: t('brands.faq2A') },
    { q: t('brands.faq3Q'), a: t('brands.faq3A') },
    { q: t('brands.faq4Q'), a: t('brands.faq4A') },
  ];

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroOrbs}>
          <div className={`${styles.orb} ${styles.orb1}`}></div>
          <div className={`${styles.orb} ${styles.orb2}`}></div>
        </div>

        <m.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.heroBadge}>
            <Zap size={14} /> {t('brands.badge')}
          </span>
          <h1 className={styles.heroTitle}>
            {t('brands.heroLine1')} <span>{t('brands.heroHighlight')}</span>
          </h1>
          <p className={styles.heroSub}>{t('brands.heroSub')}</p>
          <div className={styles.heroCtas}>
            <a href="#pricing" className={styles.ctaPrimary}>
              {t('brands.heroCtaMain')} <ArrowRight size={18} />
            </a>
            <a href="#como-funciona" className={styles.ctaSecondary}>
              {t('brands.ctaSecondary')}
            </a>
          </div>
          <p className={styles.heroNote}>{t('brands.heroNote')}</p>
        </m.div>
      </section>

      {/* Problem Section */}
      <section className={styles.problemSection}>
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className={styles.problemCard}
        >
          <span className={styles.problemEmoji}>😩</span>
          <h2>{t('brands.problemTitle')}</h2>
          <p>{t('brands.problemDesc')}</p>
        </m.div>
      </section>

      {/* Method Section — The Moat */}
      <section className={styles.methodSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}><Shield size={14} /> {t('brands.methodTag')}</span>
          <h2 className={styles.sectionTitle}>{t('brands.methodTitle')}</h2>
          <p className={styles.sectionSub}>{t('brands.methodSub')}</p>
        </div>
        <div className={styles.methodGrid}>
          {['S', 'V', 'E', 'T'].map((letter, i) => (
            <m.div
              key={i}
              className={styles.methodCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className={styles.methodLetter}>{letter}</span>
              <h4>{t(`brands.method${letter}Title`)}</h4>
              <p>{t(`brands.method${letter}Desc`)}</p>
            </m.div>
          ))}
        </div>
      </section>

      {/* What You Get */}
      <section className={styles.servicesSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>{t('brands.servicesTag')}</span>
          <h2 className={styles.sectionTitle}>{t('brands.servicesTitle')}</h2>
          <p className={styles.sectionSub}>{t('brands.servicesSub')}</p>
        </div>

        <div className={styles.servicesGrid}>
          {services.map((s, i) => (
            <m.div
              key={i}
              className={styles.serviceCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className={styles.serviceIcon}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </m.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className={styles.stepsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>{t('brands.stepsTag')}</span>
          <h2 className={styles.sectionTitle}>{t('brands.stepsTitle')}</h2>
        </div>

        <div className={styles.stepsGrid}>
          {steps.map((step, i) => (
            <m.div
              key={i}
              className={styles.stepCard}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <span className={styles.stepNumber}>{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </m.div>
          ))}
        </div>
      </section>

      {/* Pricing — Two Tiers */}
      <section id="pricing" className={styles.pricingSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}><Sparkles size={14} /> {t('brands.pricingTag')}</span>
          <h2 className={styles.sectionTitle}>{t('brands.pricingTitle')}</h2>
          <p className={styles.sectionSub}>{t('brands.pricingSub')}</p>
        </div>

        <div className={styles.pricingGrid}>
          {/* Tier 1 — Launch Report (Entry Point) */}
          <m.div
            className={styles.pricingCardEntry}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.pricingEntryBadge}>{t('brands.entryBadge')}</div>
            <div className={styles.pricingHeader}>
              <h3>{t('brands.entryName')}</h3>
              <div className={styles.priceBlock}>
                <span className={styles.priceAmount}>{t('brands.entryPrice')}</span>
                <span className={styles.pricePeriod}>{t('brands.entryPeriod')}</span>
              </div>
            </div>
            <p className={styles.pricingEntryDesc}>{t('brands.entryDesc')}</p>
            <div className={styles.pricingFeatures}>
              {[
                t('brands.entryF1'),
                t('brands.entryF2'),
                t('brands.entryF3'),
                t('brands.entryF4'),
              ].map((f, i) => (
                <div key={i} className={styles.pricingFeature}>
                  <CheckCircle size={18} className={styles.checkIcon} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.pricingCtaEntry}
            >
              {t('brands.entryCta')} <ArrowRight size={18} />
            </a>
          </m.div>

          {/* Tier 2 — Trendicore OS™ (Monthly) */}
          <m.div
            className={styles.pricingCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className={styles.pricingPopular}>{t('brands.planPopular')}</div>
            <div className={styles.pricingHeader}>
              <h3>{t('brands.planName')}</h3>
              <div className={styles.priceBlock}>
                <span className={styles.priceAmount}>{t('brands.planPrice')}</span>
                <span className={styles.pricePeriod}>{t('brands.planPeriod')}</span>
              </div>
            </div>
            <div className={styles.pricingFeatures}>
              {[
                t('brands.planF1'),
                t('brands.planF2'),
                t('brands.planF3'),
                t('brands.planF4'),
                t('brands.planF5'),
                t('brands.planF6'),
              ].map((f, i) => (
                <div key={i} className={styles.pricingFeature}>
                  <CheckCircle size={18} className={styles.checkIcon} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.pricingCta}
            >
              {t('brands.ctaPrimary')} <ArrowRight size={18} />
            </a>
            <p className={styles.pricingNote}>{t('brands.pricingNote')}</p>
          </m.div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('brands.faqTitle')}</h2>
        </div>
        <div className={styles.faqGrid}>
          {faqs.map((faq, i) => (
            <m.div
              key={i}
              className={styles.faqCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h4>{faq.q}</h4>
              <p>{faq.a}</p>
            </m.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={styles.finalCtaInner}
        >
          <MessageSquare size={32} className={styles.finalCtaIcon} />
          <h2>{t('brands.finalTitle')}</h2>
          <p>{t('brands.finalSub')}</p>
          <a
            href="https://calendly.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaPrimary}
          >
            {t('brands.entryCta')} <ArrowRight size={18} />
          </a>
        </m.div>
      </section>
    </div>
  );
}
