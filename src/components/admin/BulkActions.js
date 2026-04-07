import { Trash2, Star } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from '@/app/(admin)/dashboard/dashboard.module.css';

export default function BulkActions({
  selectedIds,
  handleBulkDelete,
  handleBulkFeatured
}) {
  const { t } = useLocale();

  if (selectedIds.length === 0) return null;

  return (
    <div className={styles.bulkActions}>
      <span className={styles.bulkCount}>
        {selectedIds.length} {t('admin.bulk.selected')}
      </span>
      <div className={styles.bulkBtns}>
        <button onClick={() => handleBulkFeatured(true)} className={styles.bulkBtn}>
          <Star size={16} fill="white" /> {t('admin.bulk.feature')}
        </button>
        <button onClick={() => handleBulkFeatured(false)} className={styles.bulkBtn} style={{ background: 'var(--surface-active)', color: 'var(--text)' }}>
          <Star size={16} /> {t('admin.bulk.unfeature')}
        </button>
        <button onClick={handleBulkDelete} className={`${styles.bulkBtn} ${styles.bulkDelete}`}>
          <Trash2 size={16} /> {t('admin.bulk.delete')}
        </button>
      </div>
    </div>
  );
}
