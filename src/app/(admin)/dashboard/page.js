'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Globe, Plus, Search, LogOut, Package, Star, Trash2, AlertCircle, CheckCircle2, Clock, X, Sun, Moon, MousePointerClick } from 'lucide-react';
import styles from './dashboard.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();

  const CATEGORIES = [
    { value: 'moda-hombre', label: t('product.categoryLabels.moda-hombre'), icon: '👕' },
    { value: 'moda-mujer', label: t('product.categoryLabels.moda-mujer'), icon: '👗' },
    { value: 'tech', label: t('product.categoryLabels.tech'), icon: '🎮' },
  ];

  const SOURCES = [
    { value: 'amazon', label: 'Amazon', icon: '🟠' },
    { value: 'shein', label: 'Shein', icon: '🟣' },
  ];

  const EMPTY_FORM = {
    title: '',
    category: 'moda-hombre',
    affiliate_link: '',
    affiliate_source: 'amazon',
    region: 'es',
    featured: false,
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('published'); // 'published' o 'pending'

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('Error al cargar productos', 'error');
    }
    setLoading(false);
  }, []);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    } else {
      // Obtener el perfil con el rol
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setCurrentUser({ ...session.user, role: profile?.role || 'worker' });
      fetchProducts();
    }
  }, [router, fetchProducts]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth, fetchProducts]);

  const stats = {
    total: products.length,
    clicks: products.reduce((sum, p) => sum + (p.clicks || 0), 0),
    es: products.filter(p => p.region === 'es').length,
    us: products.filter(p => p.region === 'us').length,
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    return result.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Get auth token for API calls
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showToast('Sesión expirada, inicia sesión de nuevo', 'error');
        setSaving(false);
        return;
      }
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      };

      let imageUrl = editingId
        ? products.find((p) => p.id === editingId)?.image_url
        : '';

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (!imageUrl) {
        showToast(t('admin.form.error_image'), 'error');
        setSaving(false);
        return;
      }

      const cleanUrl = form.affiliate_link.replace(/[\s\n\r]/g, '').trim();

      const productData = {
        title: form.title.trim(),
        price: 0,
        category: form.category,
        affiliate_link: cleanUrl,
        affiliate_source: form.affiliate_source,
        region: form.region,
        featured: form.featured,
        image_url: imageUrl,
      };

      let response;
      if (editingId) {
        response = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ id: editingId, ...productData }),
        });
      } else {
        const initialStatus = currentUser?.role === 'admin' ? 'published' : 'draft';
        response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ ...productData, status: initialStatus }),
        });
      }

      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          showToast('Ya existe un producto con este nombre', 'error');
          return;
        }
        throw new Error(result.error || 'Error saving product');
      }

      showToast(editingId ? t('admin.toast.updated') : t('admin.toast.added'));
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('Error saving:', err);
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      title: product.title,
      category: product.category,
      affiliate_link: product.affiliate_link,
      affiliate_source: product.affiliate_source || 'amazon',
      region: product.region || 'es',
      featured: product.featured,
    });
    setEditingId(product.id);
    setImagePreview(product.image_url);
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showToast(t('admin.toast.deleted'));
      fetchProducts();
    } catch (err) {
      console.error('Error deleting:', err);
      showToast(t('admin.toast.error_delete'), 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setImageFile(null);
    setImagePreview('');
    setShowForm(false);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ featured: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      showToast(!currentStatus ? t('admin.toast.featured_on') : t('admin.toast.featured_off'));
      fetchProducts();
    } catch (err) {
      console.error('Error toggling featured:', err);
      showToast(t('admin.toast.error_delete'), 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`¿Eliminar ${selectedIds.length} productos definitivamente?`)) return;

    setIsBulkDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      showToast(`${selectedIds.length} ${t('admin.toast.deleted')}`);
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error('Error in bulk delete:', err);
      showToast(t('admin.toast.error_delete'), 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkFeatured = async (status) => {
    if (!selectedIds.length) return;
    setSaving(true);
    try {
      console.log('Actualizando destacados masivamente:', status, selectedIds);
      const { error } = await supabase
        .from('products')
        .update({ featured: status })
        .in('id', selectedIds);

      if (error) throw error;

      showToast(`Estado actualizado para ${selectedIds.length} productos`);
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error('Error in bulk featured:', err);
      showToast('Error al actualizar productos (Solo administradores)', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'published' })
        .eq('id', id);
      
      if (error) throw error;
      showToast(t('admin.toast.published'));
      fetchProducts();
    } catch (err) {
      console.error('Error publishing:', err);
      showToast('Error al publicar', 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleLanguage = () => {
    setLocale(locale === 'es' ? 'en' : 'es');
  };

  const filteredProducts = products.filter((p) => {
    const isPending = p.status === 'draft';
    const isPublished = p.status === 'published';
    const matchesTab = activeTab === 'published' ? isPublished : isPending;
    const canSee = currentUser?.role === 'admin' || !isPending || p.created_by === currentUser?.id;
    if (!canSee) return false;

    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesPlatform = filterPlatform === 'all' || p.affiliate_source === filterPlatform;
    const matchesStaff = filterStaff === 'all' || p.created_by === filterStaff;
    const matchesFeatured = filterFeatured === 'all' || (filterFeatured === 'yes' ? p.featured : !p.featured);
    return matchesTab && matchesSearch && matchesCategory && matchesPlatform && matchesStaff && matchesFeatured;
  });

  return (
    <div className={styles.container}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Deletion Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalIcon}>🗑️</div>
            <h3 className={styles.modalTitle}>{t('admin.modal.delete_title')}</h3>
            <p className={styles.modalText}>
              {t('admin.delete_confirm').replace('{title}', deleteConfirm.title)}
            </p>
            <div className={styles.modalActions}>
              <button onClick={() => setDeleteConfirm(null)} className={styles.modalCancelBtn}>
                {t('admin.form.cancel')}
              </button>
              <button onClick={executeDelete} className={styles.modalDeleteBtn}>
                {t('admin.modal.delete_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.headerTitle}>Trendicore</h1>
          <span className={`${styles.badge} ${currentUser?.role === 'admin' ? styles.adminBadge : styles.staffBadge}`}>
            {currentUser?.role === 'admin' ? t('admin.roles.admin') : t('admin.roles.staff')}
          </span>
        </div>
        <div className={styles.headerRight}>
          <button
            onClick={toggleTheme}
            className={styles.themeBtn}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={toggleLanguage}
            className={styles.langBtn}
            title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <Globe size={18} />
            <span className={styles.langLabel}>{locale.toUpperCase()}</span>
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} />
            {t('admin.logout')}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>📦</span>
            <span className={styles.statLabel}>{t('admin.stats.total')}</span>
            <span className={styles.statValue}>{stats.total}</span>
            <div className={styles.statGraph}>
              <div className={styles.statBar} style={{ width: '100%', background: 'rgba(255,255,255,0.2)' }}></div>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}><MousePointerClick size={24} color="#9d4edd" /></span>
            <span className={styles.statLabel}>Total Clicks</span>
            <span className={styles.statValue}>{stats.clicks}</span>
            <div className={styles.statGraph}>
              <div 
                className={styles.statBar} 
                style={{ width: `${stats.clicks > 0 ? 100 : 0}%`, background: '#9d4edd' }}
              ></div>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>
              <img src="/images/flags/es.svg" alt="Spain" className={styles.statFlag} />
            </span>
            <span className={styles.statLabel}>{t('regionSelector.es')}</span>
            <span className={styles.statValue}>{stats.es}</span>
            <div className={styles.statGraph}>
              <div 
                className={styles.statBar} 
                style={{ width: `${stats.total > 0 ? (stats.es / stats.total) * 100 : 0}%`, background: '#ff4b2b' }}
              ></div>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>
              <img src="/images/flags/us.svg" alt="USA" className={styles.statFlag} />
            </span>
            <span className={styles.statLabel}>{t('regionSelector.us')}</span>
            <span className={styles.statValue}>{stats.us}</span>
            <div className={styles.statGraph}>
              <div 
                className={styles.statBar} 
                style={{ width: `${stats.total > 0 ? (stats.us / stats.total) * 100 : 0}%`, background: '#3b82f6' }}
              ></div>
            </div>
          </div>
        </div>

        <div className={styles.tabsContainer}>
          <div className={styles.tabsRow}>
            <button
              className={`${styles.navTab} ${activeTab === 'published' ? styles.activePublished : ''}`}
              onClick={() => setActiveTab('published')}
            >
              <CheckCircle2 size={18} className={styles.tabIcon} />
              <div className={styles.tabInfo}>
                <span className={styles.tabLabel}>
                  {currentUser?.role === 'admin' ? t('admin.tabs.published') : t('admin.tabs.my_published')}
                </span>
                <span className={styles.tabCountBadge}>
                  {products.filter(p => p.status === 'published' && (currentUser?.role === 'admin' || p.created_by === currentUser?.id)).length}
                </span>
              </div>
            </button>

            <button
              className={`${styles.navTab} ${activeTab === 'pending' ? styles.activePending : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <Clock size={18} className={styles.tabIcon} />
              <div className={styles.tabInfo}>
                <span className={styles.tabLabel}>
                  {currentUser?.role === 'admin' ? t('admin.tabs.pending') : t('admin.tabs.my_pending')}
                </span>
                {products.filter(p => p.status === 'draft' && (currentUser?.role === 'admin' || p.created_by === currentUser?.id)).length > 0 && (
                  <span className={`${styles.tabCountBadge} ${styles.pendingPulse}`}>
                    {products.filter(p => p.status === 'draft' && (currentUser?.role === 'admin' || p.created_by === currentUser?.id)).length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <div className={styles.filtersGroup}>
            <button
              onClick={toggleSelectAll}
              className={`${styles.selectAllBtn} ${selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? styles.active : ''}`}
            >
              {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? t('nav.categoryAll') : t('nav.categoryAll')}
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
                  {uid === currentUser?.id ? t('admin.roles.me') : `Trabajador ${uid.slice(0, 4)}`}
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

        {/* Product Form */}
        {showForm && (
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>
              {editingId ? t('admin.edit_product_title') : t('admin.new_product_title')}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className={styles.formCloseBtn}
              aria-label={t('admin.close')}
            >
              <X size={20} />
            </button>
            <form onSubmit={handleSubmit} className={styles.formLayout}>
              {/* LEFT COLUMN — Form Fields */}
              <div className={styles.formLeft}>
                {/* Title */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('admin.form.title')}</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder={t('admin.form.title_placeholder')}
                    className={styles.formInput}
                    required
                  />
                </div>

                {/* Category + Source in a row */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('admin.form.category')}</label>
                    <div className={styles.categoryGrid}>
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          className={`${styles.selectorOption} ${form.category === c.value ? styles.active : ''}`}
                          onClick={() => setForm({ ...form, category: c.value })}
                        >
                          <span>{c.icon}</span>
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('admin.form.platform')}</label>
                    <div className={styles.platformSelector}>
                      {SOURCES.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          className={`${styles.selectorOption} ${form.affiliate_source === s.value ? styles.active : ''}`}
                          onClick={() => setForm({ ...form, affiliate_source: s.value })}
                        >
                          <span>{s.icon}</span>
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Region + Featured in a row */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('admin.form.region')}</label>
                    <div className={styles.regionSelector}>
                      <button
                        type="button"
                        className={`${styles.regionOption} ${form.region === 'es' ? styles.activeRegion : ''}`}
                        onClick={() => setForm({ ...form, region: 'es' })}
                      >
                        <img src="/images/flags/es.svg" alt="Spain" />
                        <span>{t('regionSelector.es')}</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.regionOption} ${form.region === 'us' ? styles.activeRegion : ''}`}
                        onClick={() => setForm({ ...form, region: 'us' })}
                      >
                        <img src="/images/flags/us.svg" alt="USA" />
                        <span>{t('regionSelector.us')}</span>
                      </button>
                    </div>
                  </div>

                  {currentUser?.role === 'admin' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('admin.form.featured')}</label>
                      <div className={styles.switchContainer} onClick={() => setForm({ ...form, featured: !form.featured })}>
                        <label className={styles.switch}>
                          <input type="checkbox" checked={form.featured} readOnly />
                          <span className={styles.slider}></span>
                        </label>
                        <span className={styles.checkboxLabel}>
                          <Star size={16} color={form.featured ? 'var(--accent)' : 'var(--text-muted)'} />
                          {t('admin.form.featured')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Affiliate Link — Textarea for long URLs */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('admin.form.affiliate_link')}</label>
                  <textarea
                    value={form.affiliate_link}
                    onChange={(e) => setForm({ ...form, affiliate_link: e.target.value.replace(/[\n\r]/g, '') })}
                    placeholder={t('admin.form.link_placeholder')}
                    className={styles.urlTextarea}
                    required
                    rows={3}
                  />
                  {form.affiliate_link && (
                    <div className={styles.urlPreview}>
                      <span className={styles.urlDomain}>
                        {(() => { try { return new URL(form.affiliate_link).hostname; } catch { return '—'; } })()}
                      </span>
                      <span className={styles.urlLength}>{form.affiliate_link.length} chars</span>
                    </div>
                  )}
                </div>

                {/* Image Upload */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('admin.form.image')}</label>
                  <div className={styles.imageUpload}>
                    {imagePreview ? (
                      <div className={styles.imagePreviewBox}>
                        <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                        <button
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(''); }}
                          className={styles.removeImg}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className={styles.uploadLabel}>
                        <Package size={32} className={styles.uploadIcon} />
                        <span>{t('admin.form.image_click')}</span>
                        <span className={styles.uploadHint}>{t('admin.form.image_hint')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className={styles.fileInput}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className={styles.formActions}>
                  <button type="button" onClick={resetForm} className={styles.cancelBtn}>
                    {t('admin.form.cancel')}
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={saving}>
                    {saving
                      ? t('admin.form.saving')
                      : editingId
                        ? t('admin.form.save_update')
                        : currentUser?.role === 'admin' 
                          ? t('admin.form.save_new') 
                          : t('admin.form.send_review')}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN — Rich Preview */}
              <div className={styles.formRight}>
                <label className={styles.formLabel}>{t('admin.form.preview') || 'Vista Previa'}</label>
                <div className={styles.previewCardRich}>
                  {/* Preview Image */}
                  <div className={styles.previewImageRich}>
                    {imagePreview || (editingId && products.find(p => p.id === editingId)?.image_url) ? (
                      <img src={imagePreview || products.find(p => p.id === editingId)?.image_url} alt="Preview" />
                    ) : (
                      <div className={styles.previewPlaceholder}>
                        <Package size={48} />
                        <span>{t('admin.form.image_click')}</span>
                      </div>
                    )}
                    {/* Badges on image */}
                    <div className={styles.previewRegionBadge}>
                      <img src={`/images/flags/${form.region}.svg`} alt={form.region} />
                      <span>{form.region.toUpperCase()}</span>
                    </div>
                    <div className={`${styles.previewStatusBadge}`}>✅ {t('admin.tabs.published')}</div>
                    <div className={`${styles.previewSourceBadge} ${styles[form.affiliate_source]}`}>
                      {form.affiliate_source === 'amazon' ? '🟠' : '🟣'} {form.affiliate_source === 'amazon' ? 'Amazon' : 'Shein'}
                    </div>
                    {form.featured && (
                      <div className={styles.previewFeaturedBadge}>
                        <Star size={12} fill="#f1c40f" color="#f1c40f" />
                      </div>
                    )}
                  </div>
                  {/* Preview Info */}
                  <div className={styles.previewInfoRich}>
                    <h4 className={styles.previewTitleRich}>
                      {form.title || t('admin.form.title_placeholder')}
                    </h4>
                    <div className={styles.previewMetaRich}>
                      <span className={styles.previewCategoryBadge}>
                        {CATEGORIES.find(c => c.value === form.category)?.icon} {CATEGORIES.find(c => c.value === form.category)?.label}
                      </span>
                    </div>
                    <div className={styles.previewActionsPreview}>
                      <span className={styles.previewEditBtn}>✏️ {t('admin.actions.edit')}</span>
                      <span className={styles.previewDeleteBtn}>🗑️</span>
                    </div>
                  </div>
                </div>

                {/* URL Check */}
                {form.affiliate_link && (
                  <div className={styles.previewUrlCheck}>
                    <span className={styles.previewUrlLabel}>🔗 {t('admin.form.affiliate_link')}</span>
                    <a 
                      href={form.affiliate_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.previewUrlLink}
                    >
                      {(() => { try { return new URL(form.affiliate_link).hostname; } catch { return form.affiliate_link.substring(0, 40); } })()}
                    </a>
                  </div>
                )}

                {/* Checklist */}
                <div className={styles.previewChecklist}>
                  <div className={`${styles.checkItem} ${form.title ? styles.checkDone : ''}`}>
                    {form.title ? '✅' : '⬜'} {t('admin.form.title')}
                  </div>
                  <div className={`${styles.checkItem} ${form.affiliate_link ? styles.checkDone : ''}`}>
                    {form.affiliate_link ? '✅' : '⬜'} {t('admin.form.affiliate_link')}
                  </div>
                  <div className={`${styles.checkItem} ${(imagePreview || (editingId && products.find(p => p.id === editingId)?.image_url)) ? styles.checkDone : ''}`}>
                    {(imagePreview || (editingId && products.find(p => p.id === editingId)?.image_url)) ? '✅' : '⬜'} {t('admin.form.image')}
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className={styles.productsGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImage}></div>
                <div className={styles.skeletonInfo}>
                  <div className={styles.skeletonTitle}></div>
                  <div className={styles.skeletonMeta}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.empty}>
            {/* Force HMR V2 */}
            <span className={styles.emptyIcon}>📦</span>
            <h3>{t('admin.empty_title')}</h3>
            <p>{t('admin.empty_text')}</p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className={`${styles.productCard} ${selectedIds.includes(product.id) ? styles.selected : ''} ${product.status === 'published' ? styles.publishedCard : styles.pendingCard}`}
              >
                <div className={styles.productImageCover}>
                  <div className={styles.selectionOverlay} onClick={() => toggleSelect(product.id)}>
                    <div className={`${styles.checkbox} ${selectedIds.includes(product.id) ? styles.checked : ''}`}>
                      {selectedIds.includes(product.id) && <CheckCircle2 size={16} />}
                    </div>
                  </div>
                  <img src={product.image_url} alt={product.title} />
                  
                  {/* Status Badge */}
                  <div className={`${styles.statusBadge} ${product.status === 'draft' ? styles.draft : styles.published}`}>
                    {product.status === 'published' ? t('admin.state_published') : t('admin.state_pending')}
                  </div>

                  {currentUser?.role === 'admin' && (
                    <button 
                      className={`${styles.featuredToggle} ${product.featured ? styles.active : ''}`}
                      onClick={() => handleToggleFeatured(product.id, product.featured)}
                      title={product.featured ? t('admin.featured_remove_title') : t('admin.featured_add_title')}
                    >
                      <Star size={14} fill={product.featured ? 'currentColor' : 'none'} />
                    </button>
                  )}
                  <span className={`${styles.sourceBadge} ${styles[product.affiliate_source]}`}>
                    {product.affiliate_source === 'amazon' ? '🟠 Amazon' : '🟣 Shein'}
                  </span>
                  <span className={styles.regionFlag}>
                    <img
                      src={`/images/flags/${product.region === 'us' ? 'us' : 'es'}.svg`}
                      alt={product.region === 'us' ? 'US' : 'ES'}
                    />
                    {product.region === 'us' ? 'US' : 'ES'}
                  </span>
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productTitle}>{product.title}</h3>
                  <div className={styles.productMeta}>
                    <span className={styles.productCategory}>
                      {CATEGORIES.find((c) => c.value === product.category)?.icon} {CATEGORIES.find((c) => c.value === product.category)?.label}
                    </span>
                    <span className={styles.productAuthor}>
                      <MousePointerClick size={14} style={{ marginRight: '4px' }} />
                      {product.clicks || 0} clics
                    </span>
                    {product.created_by && (
                      <span className={styles.productAuthor}>
                        👤 {currentUser?.id === product.created_by ? t('admin.roles.me') : 'Staff'}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.productActions}>
                  {activeTab === 'pending' && currentUser?.role === 'admin' && (
                    <button
                      onClick={() => handlePublish(product.id)}
                      className={styles.publishBtn}
                    >
                      {t('admin.actions.publish')}
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(product)}
                    className={styles.editBtn}
                  >
                    {t('admin.edit_btn')}
                  </button>
                  <button
                    onClick={() => {
                      const isOwner = product.created_by === currentUser?.id;
                      const isAdmin = currentUser?.role === 'admin';
                      
                      if (isAdmin || isOwner) {
                        setDeleteConfirm({ id: product.id, title: product.title });
                      } else {
                        showToast(t('admin.toast.error_delete'), 'error');
                      }
                    }}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bulk Action Floating Bar */}
      {selectedIds.length > 0 && (
        <motion.div
          className={styles.bulkBar}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
        >
          <div className={styles.bulkInfo}>
            <span className={styles.bulkCount}>{selectedIds.length}</span>
            <span className={styles.bulkLabel}>{t('admin.bulk.selected')}</span>
          </div>
          <div className={styles.bulkActions}>
            {currentUser?.role === 'admin' && (
              <>
                <button onClick={() => handleBulkFeatured(true)} className={styles.bulkActionBtn}>
                  <Star size={16} fill="currentColor" /> {t('admin.stats.featured')}
                </button>
                <button onClick={() => handleBulkFeatured(false)} className={styles.bulkActionBtn}>
                  <Star size={16} /> {t('admin.bulk.remove')}
                </button>
              </>
            )}
            <button onClick={handleBulkDelete} className={styles.bulkDeleteBtn} disabled={isBulkDeleting}>
              <Trash2 size={16} /> {isBulkDeleting ? t('admin.bulk.deleting') : t('admin.bulk.delete')}
            </button>
            <button onClick={() => setSelectedIds([])} className={styles.bulkCancelBtn}>
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}


