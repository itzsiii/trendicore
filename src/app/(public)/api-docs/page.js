'use client';

import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLocale } from '@/components/providers/LocaleProvider';
import { ShieldAlert, Key, Copy, CheckCircle, Database } from 'lucide-react';
import styles from './api-docs.module.css';
import Link from 'next/link';

export default function ApiDocsPage() {
  const { user, profile, isAuthenticated, loading } = useAuth();
  const { t } = useLocale();
  const [apiKey, setApiKey] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const canGenerate = profile?.tier === 'creator_pro';

  const handleGenerateKey = async () => {
    if (!isAuthenticated || !user) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/v1/keys/generate', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (res.ok && data.apikey) {
         setApiKey(data.apikey);
      } else {
         alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Trend Intelligence API <span className={styles.versionTag}>v1</span></h1>
        <p>{t('api_docs.title')}</p>
      </div>

      <div className={styles.layout}>
        
        {/* Left Col - API Spec */}
        <div className={styles.mainContent}>
          <section className={styles.section}>
            <h2>{t('api_docs.auth')}</h2>
            <p>La API restringe el acceso mediante llaves (API Keys). Todas las llamadas deben incluir el header de autorización.</p>
            <div className={styles.codeBlock}>
              <code>Authorization: Bearer tc_live_************************</code>
            </div>
          </section>

          <section className={styles.section}>
            <h2><Database size={20}/> {t('api_docs.endpoints')}</h2>
            
            <div className={styles.endpointCard}>
              <div className={styles.endpointHeader}>
                <span className={styles.methodGet}>GET</span>
                <span className={styles.path}>/api/v1/trends</span>
              </div>
              <p className={styles.desc}>Obtiene el score de tendencias en tiempo real de productos publicados. Soporta filtros por región y límite.</p>
              
              <h3>Parámetros Query (Opcionales)</h3>
              <table className={styles.paramTable}>
                <thead>
                   <tr>
                     <th>Nombre</th>
                     <th>Tipo</th>
                     <th>Descripción</th>
                   </tr>
                </thead>
                <tbody>
                   <tr>
                     <td><code>limit</code></td>
                     <td>Integer</td>
                     <td>Límite de resultados (Max: 100). Default: 10</td>
                   </tr>
                   <tr>
                     <td><code>region</code></td>
                     <td>String</td>
                     <td>Filtro geográfico <code>'es'</code> o <code>'us'</code></td>
                   </tr>
                </tbody>
              </table>

              <h3>Ejemplo de Respuesta</h3>
              <div className={styles.codeBlock}>
<pre>{`{
  "status": "success",
  "data": [
    {
      "id": "e45-...",
      "title": "Aesthetic Wireless Headphones",
      "trend_score": 88,
      "clicks": 450,
      "category": "tech"
    }
  ]
}`}</pre>
              </div>
            </div>
          </section>
        </div>

        {/* Right Col - API Key Gen */}
        <div className={styles.sidebar}>
          <div className={styles.keyCard}>
            <div className={styles.keyCardHeader}>
              <Key size={20} className={styles.keyIcon}/>
              <h2>{t('api_docs.creds')}</h2>
            </div>
            
            {!isAuthenticated ? (
              <div className={styles.alertWarning}>
                <ShieldAlert size={16}/> {t('api_docs.loginReq')}
                <Link href="/acceder?redirect=/api-docs" className={styles.loginLink}>Ir a Acceder</Link>
              </div>
            ) : !canGenerate ? (
              <div className={styles.alertWarning}>
                <ShieldAlert size={16}/> {t('api_docs.proReq')}
                <Link href="/premium" className={styles.upgradeLink}>Mejorar Plan</Link>
              </div>
            ) : (
              <div className={styles.keyGenBox}>
                <p>Genera una nueva llave de API. Esto invalidará automáticamente las llaves previas.</p>
                <button 
                  onClick={handleGenerateKey} 
                  disabled={generating}
                  className={styles.generateBtn}
                >
                  {generating ? 'Generando...' : t('api_docs.btnGen')}
                </button>
                
                {apiKey && (
                   <m.div 
                     initial={{ opacity: 0, height: 0 }} 
                     animate={{ opacity: 1, height: 'auto' }} 
                     className={styles.keyResult}
                   >
                     <p className={styles.keyWarning}>Cópiala ahora, no la volveremos a mostrar.</p>
                     <div className={styles.keyDisplayBox}>
                       <code>{apiKey}</code>
                       <button onClick={copyToClipboard} className={styles.copyBtn}>
                         {copied ? <CheckCircle size={16} color="var(--success)"/> : <Copy size={16} />}
                       </button>
                     </div>
                   </m.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
