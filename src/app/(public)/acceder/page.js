'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LogIn, UserPlus, Mail, Lock, ArrowRight, Zap, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './acceder.module.css';

export default function AccederPage() {
  const { t } = useLocale();
  const { signIn, signUp, isAuthenticated } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If already logged in, redirect
  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await signUp(email, password);
        setSuccess(t('auth.registerSuccess'));
        setMode('login');
        setPassword('');
      } else {
        await signIn(email, password);
        router.push('/');
      }
    } catch (err) {
      setError(err.message || t('auth.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Left: Branding Panel */}
        <m.div 
          className={styles.brandPanel}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.brandGlow}></div>
          <div className={styles.brandContent}>
            <Zap size={40} strokeWidth={2} className={styles.brandIcon} />
            <h2 className={styles.brandTitle}>Trendicore</h2>
            <p className={styles.brandSubtitle}>{t('auth.brandSubtitle')}</p>
            
            <div className={styles.featureList}>
              {[
                t('auth.feature1'),
                t('auth.feature2'),
                t('auth.feature3'),
              ].map((feat, i) => (
                <div key={i} className={styles.featureItem}>
                  <ArrowRight size={14} strokeWidth={2.5} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </m.div>

        {/* Right: Auth Form */}
        <m.div 
          className={styles.formPanel}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Mode Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`}
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            >
              <LogIn size={16} /> {t('auth.loginTab')}
            </button>
            <button
              className={`${styles.tab} ${mode === 'register' ? styles.active : ''}`}
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            >
              <UserPlus size={16} /> {t('auth.registerTab')}
            </button>
          </div>

          <h1 className={styles.formTitle}>
            {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h1>
          <p className={styles.formSubtitle}>
            {mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.inputGroup}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                minLength={6}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <m.div 
                className={styles.error}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </m.div>
            )}

            {success && (
              <m.div 
                className={styles.success}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {success}
              </m.div>
            )}

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner}></span>
              ) : (
                <>
                  {mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </m.div>
      </div>
    </div>
  );
}
