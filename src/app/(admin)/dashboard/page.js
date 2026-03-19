'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Globe, Plus, Search, LogOut, Package, Star, Trash2, AlertCircle, CheckCircle2, Clock, X, Sun, Moon, MousePointerClick, BarChart3, LayoutDashboard, ShieldCheck } from 'lucide-react';
import styles from './dashboard.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardCharts from '@/components/admin/DashboardCharts';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();

  const CATEGORIES = [
    { value: 'moda-hombre', label: t('product.categoryLabels.moda-hombre'), icon: '👕' },
    { value: 'moda-mujer', label: t('product.categoryLabels.moda-mujer'), icon: '👗' },
    { value: 'tech', label: t('product.categoryLabels.tech'), icon: '🎮' },
    { value: 'entretenimiento', label: t('product.categoryLabels.entretenimiento'), icon: '🍿' },
  ];

  const SOURCES = [
    { value: 'amazon', label: 'Amazon', icon: '🟠' },
    { value: 'shein', label: 'Shein', icon: '🟣' },
    { value: 'otros', label: 'Otros', icon: '🔵' },
  ];

  const EMPTY_FORM = {
    title: '',
    category: 'moda-hombre',
    affiliate_link: '',
    affiliate_source: 'amazon',
    region: 'es',
    featured: false,
  };

  const productSchema = z.object({
    title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
    category: z.string(),
    affiliate_link: z.string().url("Debe ser una URL válida"),
    affiliate_source: z.string(),
    region: z.string(),
    featured: z.boolean().default(false),
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
    reset: resetFormHook,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_FORM
  });
  
  const form = watch();
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
  const [accessToken, setAccessToken] = useState(null);
  const [activeTab, setActiveTab] = useState('published'); // 'published', 'overview', 'pending', 'roles'
  const [selectedRoleInPanel, setSelectedRoleInPanel] = useState('admin');
  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [dynamicPermissions, setDynamicPermissions] = useState({});
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async (token = accessToken) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar productos');
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('Error al cargar productos', 'error');
    }
    setLoading(false);
  }, [accessToken]);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }
      
      const res = await fetch('/api/admin/check', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      
      if (!res.ok || !data.authenticated || !data.user) {
        router.push('/login');
        return;
      }
      
      setCurrentUser(data.user);
      setAccessToken(session.access_token);
      fetchProducts(session.access_token);
    } catch (err) {
      console.error('Auth check error:', err);
      router.push('/login');
    }
  }, [router, fetchProducts]);

  const fetchPermissions = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('/api/admin/permissions', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar permisos');
      setDynamicPermissions(data);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      showToast('Error al cargar permisos', 'error');
    }
  }, [accessToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (activeTab === 'roles' && currentUser?.role === 'admin') {
      fetchPermissions();
    }
  }, [activeTab, currentUser, fetchPermissions]);

  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'co-admin')) return;

    const channel = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          if (payload.new.status === 'draft') {
            showToast(t('admin.toast.new_review').replace('{title}', payload.new.title), 'info');
            fetchProducts();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchProducts]);

  const stats = {
    total: products.length,
    clicks: products.reduce((sum, p) => sum + (p.clicks || 0), 0),
    es: products.filter(p => p.region === 'es').length,
    us: products.filter(p => p.region === 'us').length,
    pending: products.filter(p => p.status === 'draft').length,
  };

  const handleTogglePermission = (role, permId) => {
    if (role === 'admin') return;

    setDynamicPermissions(prev => {
      const currentRolePerms = prev[role] || [];
      const newPerms = currentRolePerms.includes(permId)
        ? currentRolePerms.filter(p => p !== permId)
        : [...currentRolePerms, permId];
      
      return { ...prev, [role]: newPerms };
    });
  };

  const handleSavePermissions = async () => {
    if (!accessToken) return;
    setIsSavingPermissions(true);
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}` 
        },
        body: JSON.stringify({
          role: selectedRoleInPanel,
          permissions: dynamicPermissions[selectedRoleInPanel] || []
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('admin.toast.perms_error'));
      }

      showToast(t('admin.toast.perms_success'));
    } catch (err) {
      console.error('Error saving permissions:', err);
      showToast(err.message || t('admin.toast.perms_error'), 'error');
    }
    setIsSavingPermissions(false);
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

  const uploadImage = async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    return result.url;
  };

  const handleAutoFill = async () => {
    if (!form.affiliate_link) return;
    setIsExtracting(true);
    try {
      const res = await fetch('/api/admin/products/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.affiliate_link })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al extraer datos');

      setValue('title', data.title || form.title, { shouldValidate: true });
      if (data.image) {
        setImagePreview(data.image);
      }
      showToast(t('admin.toast.extract_success'));
    } catch (error) {
      console.error('Auto-fill error:', error);
      showToast(error.message, 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);

    try {
      // Use stored accessToken for API calls
      if (!accessToken) {
        showToast(t('admin.toast.session_expired'), 'error');
        setSaving(false);
        return;
      }
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      };

      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, accessToken);
      } else if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('http')) {
        imageUrl = imagePreview;
      } else if (editingId) {
        imageUrl = products.find((p) => p.id === editingId)?.image_url || '';
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
          showToast(t('admin.toast.duplicate'), 'error');
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
    resetFormHook({
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
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al borrar producto');
      
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
    resetFormHook(EMPTY_FORM);
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
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id, featured: !currentStatus }),
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      showToast(!currentStatus ? t('admin.toast.featured_on') : t('admin.toast.featured_off'));
      fetchProducts();
    } catch (err) {
      console.error('Error toggling featured:', err);
      showToast(t('admin.toast.error_delete'), 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    setBulkDeleteConfirm(true);
  };

  const executeBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      for (const id of selectedIds) {
        const res = await fetch(`/api/admin/products?id=${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error('Error en borrado masivo');
      }

      showToast(`${selectedIds.length} ${t('admin.toast.deleted')}`);
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error('Error in bulk delete:', err);
      showToast(t('admin.toast.error_delete'), 'error');
    } finally {
      setIsBulkDeleting(false);
      setBulkDeleteConfirm(false);
    }
  };

  const handleBulkFeatured = async (status) => {
    if (!selectedIds.length) return;
    setSaving(true);
    try {
      console.log('Actualizando destacados masivamente:', status, selectedIds);
      for (const id of selectedIds) {
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ id, featured: status }),
        });
        if (!res.ok) throw new Error('Error en actualización masiva');
      }

      showToast(t('admin.toast.bulk_featured_success').replace('{count}', selectedIds.length));
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error('Error in bulk featured:', err);
      showToast(t('admin.toast.bulk_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id, status: 'published' }),
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      showToast(t('admin.toast.published'));
      fetchProducts();
    } catch (err) {
      console.error('Error publishing:', err);
      showToast('Error al publicar', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      // No need for supabase.auth.signOut() if we are decoupled
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
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
      {(deleteConfirm || bulkDeleteConfirm) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalIcon}>🗑️</div>
            <h3 className={styles.modalTitle}>
              {bulkDeleteConfirm ? t('admin.modal.bulk_delete_title') : t('admin.modal.delete_title')}
            </h3>
            <p className={styles.modalText}>
              {bulkDeleteConfirm 
                ? t('admin.modal.bulk_delete_text').replace('{count}', selectedIds.length) 
                : t('admin.delete_confirm').replace('{title}', deleteConfirm?.title)}
            </p>
            <div className={styles.modalActions}>
              <Button 
                variant="secondary"
                onClick={() => { setDeleteConfirm(null); setBulkDeleteConfirm(false); }} 
                disabled={isBulkDeleting}
                fullWidth
              >
                {t('admin.form.cancel')}
              </Button>
              <Button 
                variant="primary"
                onClick={bulkDeleteConfirm ? executeBulkDelete : executeDelete} 
                className={styles.modalDeleteBtn}
                loading={isBulkDeleting}
                fullWidth
              >
                {isBulkDeleting ? t('admin.bulk.deleting') : t('admin.modal.delete_btn')}
              </Button>
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

            <button
              className={`${styles.navTab} ${activeTab === 'overview' ? styles.activeOverview : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={18} className={styles.tabIcon} />
              <div className={styles.tabInfo}>
                <span className={styles.tabLabel}>{t('admin.tabs.overview')}</span>
              </div>
            </button>
            
            {currentUser?.role === 'admin' && (
              <button
                className={`${styles.navTab} ${activeTab === 'roles' ? styles.activeRoles : ''}`}
                onClick={() => setActiveTab('roles')}
              >
                <Star size={18} className={styles.tabIcon} />
                <div className={styles.tabInfo}>
                  <span className={styles.tabLabel}>{t('admin.tabs.roles')}</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Overview Tab Content: Stats & Charts */}
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
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
                <span className={styles.statIcon}>🕒</span>
                <span className={styles.statLabel}>{t('admin.tabs.pending')}</span>
                <span className={styles.statValue}>{stats.pending}</span>
                <div className={styles.statGraph}>
                  <div 
                    className={styles.statBar} 
                    style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%`, background: '#f1c40f' }}
                  ></div>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}><MousePointerClick size={24} color="#9d4edd" /></span>
                <span className={styles.statLabel}>{t('admin.stats.clicks')}</span>
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

            {/* Charts Section - Visible only for Admin/Co-Admin */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'co-admin') && (
              <DashboardCharts products={products} />
            )}
          </motion.div>
        )}

        {activeTab === 'roles' ? (
          <div className={styles.rolesPanel}>
            <div className={styles.rolesSidebar}>
              <div 
                className={`${styles.roleItem} ${selectedRoleInPanel === 'admin' ? styles.roleAdminActive : ''} ${styles.roleAdmin}`}
                onClick={() => setSelectedRoleInPanel('admin')}
              >
                Admin
              </div>
              <div 
                className={`${styles.roleItem} ${selectedRoleInPanel === 'co-admin' ? styles.roleCoAdminActive : ''} ${styles.roleCoAdmin}`}
                onClick={() => setSelectedRoleInPanel('co-admin')}
              >
                Co-Admin
              </div>
              <div 
                className={`${styles.roleItem} ${selectedRoleInPanel === 'staff' ? styles.roleStaffActive : ''} ${styles.roleStaff}`}
                onClick={() => setSelectedRoleInPanel('staff')}
              >
                Staff
              </div>
            </div>
            <div className={styles.permissionsContent}>
              <div className={styles.permissionsHeader}>
                <h3 className={styles.sectionTitle}>
                  {t('admin.permissions.title').replace('{role}', selectedRoleInPanel.toUpperCase())}
                </h3>
                {selectedRoleInPanel !== 'admin' && (
                  <button 
                    className={styles.savePermissionsBtn}
                    onClick={handleSavePermissions}
                    disabled={isSavingPermissions}
                  >
                    {isSavingPermissions ? t('admin.permissions.saving') : t('admin.permissions.save')}
                  </button>
                )}
              </div>
              
              {[
                { id: 'view_pending', label: t('admin.permissions.view_pending') },
                { id: 'create_product', label: t('admin.permissions.create_product') },
                { id: 'publish_product', label: t('admin.permissions.publish_product') },
                { id: 'edit_any_product', label: t('admin.permissions.edit_any_product') },
                { id: 'delete_any_product', label: t('admin.permissions.delete_any_product') },
                { id: 'delete_own_product', label: t('admin.permissions.delete_own_product') },
                { id: 'manage_roles', label: t('admin.permissions.manage_roles') }
              ].map(perm => {
                 const hasPerm = (dynamicPermissions[selectedRoleInPanel] || []).includes(perm.id) || selectedRoleInPanel === 'admin';

                 return (
                    <div 
                      key={perm.id} 
                      className={`${styles.permissionToggle} ${selectedRoleInPanel === 'admin' ? styles.disabledToggle : ''}`}
                      onClick={() => handleTogglePermission(selectedRoleInPanel, perm.id)}
                    >
                        <span>{perm.label}</span>
                        <input 
                          type="checkbox" 
                          checked={hasPerm} 
                          onChange={() => {}} // Handled by div onClick
                          readOnly={selectedRoleInPanel === 'admin'}
                        />
                    </div>
                 );
              })}
              
              <p className={styles.roleHint}>
                {selectedRoleInPanel === 'admin' 
                  ? t('admin.permissions.hint_admin') 
                  : t('admin.permissions.hint_other')}
              </p>
            </div>
          </div>
        ) : activeTab === 'overview' ? (
          null
        ) : (
          <>
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
            <form onSubmit={handleFormSubmit(onSubmit)} className={styles.formLayout}>
              {/* LEFT COLUMN — Form Fields */}
              <div className={styles.formLeft}>
                {/* Title */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('admin.form.title')}</label>
                  <input
                    type="text"
                    {...register('title')}
                    placeholder={t('admin.form.title_placeholder')}
                    className={styles.formInput}
                  />
                  {errors.title && <span className={styles.formError} style={{ color: '#ff4b2b', fontSize: '12px', marginTop: '4px' }}>{errors.title.message}</span>}
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
                          className={`${styles.selectorOption} ${form?.category === c.value ? styles.active : ''}`}
                          onClick={() => setValue('category', c.value, { shouldValidate: true })}
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
                          className={`${styles.selectorOption} ${form?.affiliate_source === s.value ? styles.active : ''}`}
                          onClick={() => setValue('affiliate_source', s.value, { shouldValidate: true })}
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
                        className={`${styles.regionOption} ${form?.region === 'es' ? styles.activeRegion : ''}`}
                        onClick={() => setValue('region', 'es', { shouldValidate: true })}
                      >
                        <img src="/images/flags/es.svg" alt="Spain" />
                        <span>{t('regionSelector.es')}</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.regionOption} ${form?.region === 'us' ? styles.activeRegion : ''}`}
                        onClick={() => setValue('region', 'us', { shouldValidate: true })}
                      >
                        <img src="/images/flags/us.svg" alt="USA" />
                        <span>{t('regionSelector.us')}</span>
                      </button>
                    </div>
                  </div>

                  {currentUser?.role === 'admin' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('admin.form.featured')}</label>
                      <div className={styles.switchContainer} onClick={() => setValue('featured', !form?.featured, { shouldValidate: true })}>
                        <label className={styles.switch}>
                          <input type="checkbox" checked={form?.featured || false} readOnly />
                          <span className={styles.slider}></span>
                        </label>
                        <span className={styles.checkboxLabel}>
                          <Star size={16} color={form?.featured ? 'var(--accent)' : 'var(--text-muted)'} />
                          {t('admin.form.featured')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.labelWithAction}>
                    <label className={styles.formLabel}>{t('admin.form.affiliate_link')}</label>
                    <button 
                      type="button" 
                      className={styles.magicButton}
                      onClick={handleAutoFill}
                      disabled={isExtracting || !form?.affiliate_link}
                      title={t('admin.magic_btn')}
                    >
                      {isExtracting ? <Clock size={14} className={styles.spin} /> : '🪄'} 
                      <span>{isExtracting ? t('admin.extracting') : t('admin.magic_btn')}</span>
                    </button>
                  </div>
                  <textarea
                    {...register('affiliate_link')}
                    placeholder={t('admin.form.link_placeholder')}
                    className={styles.urlTextarea}
                    rows={3}
                  />
                  {errors.affiliate_link && <span className={styles.formError} style={{ color: '#ff4b2b', fontSize: '12px', marginTop: '4px' }}>{errors.affiliate_link.message}</span>}
                  {form?.affiliate_link && !errors.affiliate_link && (
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
                  <Button variant="secondary" onClick={resetForm} disabled={saving} size="large" fullWidth>
                    {t('admin.form.cancel')}
                  </Button>
                  <Button variant="primary" type="submit" loading={saving} size="large" fullWidth>
                    {saving
                      ? t('admin.form.saving')
                      : editingId
                        ? t('admin.form.save_update')
                        : currentUser?.role === 'admin' 
                          ? t('admin.form.save_new') 
                          : t('admin.form.send_review')}
                  </Button>
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
                      {form.affiliate_source === 'amazon' ? '🟠' : form.affiliate_source === 'shein' ? '🟣' : '🔵'} {form.affiliate_source === 'amazon' ? 'Amazon' : form.affiliate_source === 'shein' ? 'Shein' : 'Otros'}
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
                    {product.affiliate_source === 'amazon' ? '🟠 Amazon' : product.affiliate_source === 'shein' ? '🟣 Shein' : '🔵 Otros'}
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
                    <Button
                      variant="primary"
                      onClick={() => handlePublish(product.id)}
                      style={{ flex: 1 }}
                    >
                      {t('admin.actions.publish')}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(product)}
                    style={{ flex: 1 }}
                  >
                    {t('admin.edit_btn')}
                  </Button>
                  <Button
                    variant="glass"
                    onClick={() => {
                      const isOwner = product.created_by === currentUser?.id;
                      const isAdmin = currentUser?.role === 'admin';
                      
                      if (isAdmin || isOwner) {
                        setDeleteConfirm({ id: product.id, title: product.title });
                      } else {
                        showToast(t('admin.toast.error_delete'), 'error');
                      }
                    }}
                    style={{ width: '44px', padding: '0', display: 'flex', justifyContent: 'center' }}
                  >
                    <Trash2 size={16} color="var(--danger)" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
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
