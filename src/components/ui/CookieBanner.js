'use client';

import { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('trendicore-cookie-consent');
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('trendicore-cookie-consent', 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem('trendicore-cookie-consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <Shield size={20} />
        </div>
        <div className={styles.text}>
          <p className={styles.title}>Utilizamos cookies</p>
          <p className={styles.desc}>
            Usamos cookies esenciales para el funcionamiento del sitio y cookies analíticas para mejorar tu experiencia. 
            Consulta nuestra <a href="/legal/privacy" className={styles.link}>Política de Privacidad</a>.
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.rejectBtn} onClick={reject}>Rechazar</button>
          <button className={styles.acceptBtn} onClick={accept}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}
