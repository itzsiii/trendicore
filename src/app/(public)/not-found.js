import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import styles from '../error.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.glow1} />
      <div className={styles.glow2} />
      
      <div className={styles.content}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Parece que este estilo ya no es tendencia</h2>
        <p className={styles.description}>
          La página que buscas ha sido rebajada, eliminada o nunca existió en nuestra colección.
        </p>
        
        <div className={styles.buttonGroup}>
          <Link href="/" className={styles.primaryBtn}>
            <Home size={18} />
            Volver al inicio
          </Link>
          <Link href="/moda" className={styles.secondaryBtn}>
            <Search size={18} />
            Explorar moda
          </Link>
        </div>
      </div>
    </div>
  );
}
