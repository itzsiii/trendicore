import { Search, Plus, X } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from '@/app/(admin)/dashboard/dashboard.module.css';

export default function ProductFilters({
  searchTerm, setSearchTerm,
  filterCategory, setFilterCategory,
  filterPlatform, setFilterPlatform,
  filterStaff, setFilterStaff,
  selectedIds, filteredProducts,
  toggleSelectAll,
  showForm, setShowForm,
  resetForm,
  CATEGORIES, SOURCES,
  products, currentUser
}) {
  const { t } = useLocale();

  return (
    <div className={styles.actionBar}>
      <div className={styles.filtersGroup}>
        <button
          onClick={toggleSelectAll}
          className={`${styles.selectAllBtn} ${selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? styles.active : ''}`}
        >
          {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? t('admin.deselect_all') : t('admin.select_all')}
        </button>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t('admin.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">{t('admin.all_categories')}</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">{t('admin.all_platforms')}</option>
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filterStaff}
          onChange={(e) => setFilterStaff(e.target.value)}
          className={styles.filterSelect}
        >
          <option value='all'>{t('admin.all_staff')}</option>
          {[...new Set(products.filter(p => p.created_by).map(p => p.created_by))].map((uid) => (
            <option key={uid} value={uid}>
              {uid === currentUser?.id ? t('admin.roles.me') : t('admin.worker_label').replace('{id}', uid.slice(0, 4))}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => { resetForm(); setShowForm(!showForm); }}
        className={styles.addBtn}
      >
        {showForm ? <X size={18} /> : <Plus size={18} />}
        {showForm ? t('admin.close') : t('admin.new_product')}
      </button>
    </div>
  );
}
