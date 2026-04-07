'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/components/providers/LocaleProvider';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Globe, LogOut, Star, AlertCircle, CheckCircle2, Clock, Sun, Moon, MousePointerClick, LayoutDashboard } from 'lucide-react';
import styles from './dashboard.module.css';
import { m } from 'framer-motion';
import DashboardCharts from '@/components/admin/DashboardCharts';
import Button from '@/components/ui/Button';

import ProductFilters from '@/components/admin/ProductFilters';
import ProductList from '@/components/admin/ProductList';
import ProductForm from '@/components/admin/ProductForm';
import BulkActions from '@/components/admin/BulkActions';

export default function DashboardPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();

  const CATEGORIES = [
    { value: 'moda-hombre', label: t('product.categoryLabels.moda-hombre'), icon: '👕' },
    { value: 'moda-mujer', label: t('product.categoryLabels.moda-mujer'), icon: '👗' },
    { value: 'tech', label: t('product.categoryLabels.tech'), icon: '🎮' },
    { value: 'entretenimiento', label: t('product.categoryLabels.entretenimiento'), icon: '🍿' },
    { value: 'suscripciones', label: t('product.categoryLabels.suscripciones') || 'Suscripciones', icon: '🎟️' },
  ];

  const SOURCES = [
    { value: 'amazon', label: 'Amazon', icon: '🟠' },
    { value: 'shein', label: 'Shein', icon: '🟣' },
    { value: 'otros', label: 'Otros', icon: '🔵' },
  ];

  const EMPTY_FORM = {
    title: '',
    description: '',
    image_credits: '',
    category: 'moda-hombre',
    price: 0,
    price_period: 'mes',
    affiliate_link: '',
    affiliate_source: 'amazon',
    region: 'es',
    featured: false,
    platform_name: '',
    brand_color: '#7c3aed',
  };

  const productSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    description: z.string().optional(),
    image_credits: z.string().optional(),
    category: z.string(),
    price: z.coerce.number().min(0, "El precio no puede ser negativo"),
    price_period: z.string().optional(),
    affiliate_link: z.string().url("Debe ser una URL válida"),
    affiliate_source: z.string(),
    region: z.string(),
    featured: z.boolean().default(false),
    platform_name: z.string().optional(),
    brand_color: z.string().optional(),
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
      const { data: { session } } = await supabase.auth.getSession();
      const currentToken = session?.access_token;
      if (!currentToken) throw new Error('Session expired');

      const res = await fetch('/api/admin/products/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
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
      const { data: { session } } = await supabase.auth.getSession();
      const currentToken = session?.access_token;

      if (!currentToken) {
        showToast(t('admin.toast.session_expired'), 'error');
        setSaving(false);
        return;
      }
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      };

      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, currentToken);
      } else if (imagePreview && typeof imagePreview === 'string' && imagePreview.length > 5) {
        imageUrl = imagePreview.startsWith('http') || imagePreview.startsWith('data:') ? imagePreview : 'https://' + imagePreview.replace(/^(https?:\/\/)?/, '');
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
        description: form.category === 'suscripciones' ? (form.description || '').trim() : '',
        image_credits: form.category === 'suscripciones' ? (form.image_credits || '').trim() : '',
        price: form.category === 'suscripciones' ? form.price : 0,
        price_period: form.category === 'suscripciones' ? (form.price_period || 'mes') : null,
        category: form.category,
        affiliate_link: cleanUrl,
        affiliate_source: form.category === 'suscripciones' ? 'otros' : form.affiliate_source,
        region: form.category === 'suscripciones' ? 'es' : form.region,
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
      description: product.description || '',
      image_credits: product.image_credits || '',
      category: product.category,
      price: product.price || 0,
      price_period: product.price_period || 'mes',
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
      const { data: { session } } = await supabase.auth.getSession();
      const currentToken = session?.access_token;
      if (!currentToken) throw new Error('Session expired');

      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentToken}` },
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
      const { data: { session } } = await supabase.auth.getSession();
      const currentToken = session?.access_token;
      if (!currentToken) throw new Error('Session expired');

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
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
      const { data: { session } } = await supabase.auth.getSession();
      const currentToken = session?.access_token;
      if (!currentToken) throw new Error('Session expired');

      const results = await Promise.allSettled(
        selectedIds.map(id =>
          fetch(`/api/admin/products?id=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentToken}` },
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to delete ${id}`);
            return res;
          })
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (failed > 0) {
        showToast(`${succeeded} eliminados, ${failed} fallaron`, 'error');
      } else {
        showToast(`${succeeded} ${t('admin.toast.deleted')}`);
      }
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
      const { data: { session } } = await supabase.auth.getSession();
      const currentToken = session?.access_token;
      if (!currentToken) throw new Error('Session expired');

      for (const id of selectedIds) {
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`,
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
          <span className={`${styles.badge} ${currentUser?.role === 'admin' ? styles.adminBadge : styles.workerBadge}`}>
            {currentUser?.role === 'admin' ? t('admin.roles.admin') : t('admin.roles.worker')}
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
          <m.div 
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
          </m.div>
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
                className={`${styles.roleItem} ${selectedRoleInPanel === 'worker' ? styles.roleWorkerActive : ''} ${styles.roleWorker}`}
                onClick={() => setSelectedRoleInPanel('worker')}
              >
                Worker / Staff
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
            <ProductFilters
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              filterCategory={filterCategory} setFilterCategory={setFilterCategory}
              filterPlatform={filterPlatform} setFilterPlatform={setFilterPlatform}
              filterStaff={filterStaff} setFilterStaff={setFilterStaff}
              selectedIds={selectedIds} filteredProducts={filteredProducts}
              toggleSelectAll={toggleSelectAll}
              showForm={showForm} setShowForm={setShowForm}
              resetForm={resetForm}
              CATEGORIES={CATEGORIES} SOURCES={SOURCES}
              products={products} currentUser={currentUser}
            />

            {showForm && (
              <ProductForm 
                form={form} errors={errors} register={register} setValue={setValue}
                handleFormSubmit={handleFormSubmit} onSubmit={onSubmit} resetForm={resetForm}
                editingId={editingId} saving={saving} imagePreview={imagePreview}
                handleImageChange={handleImageChange} setImageFile={setImageFile}
                setImagePreview={setImagePreview} isExtracting={isExtracting}
                handleAutoFill={handleAutoFill} products={products} currentUser={currentUser}
                CATEGORIES={CATEGORIES} SOURCES={SOURCES}
              />
            )}

            <ProductList
              loading={loading}
              filteredProducts={filteredProducts}
              selectedIds={selectedIds}
              toggleSelect={toggleSelect}
              currentUser={currentUser}
              handleToggleFeatured={handleToggleFeatured}
              handlePublish={handlePublish}
              handleEdit={handleEdit}
              setDeleteConfirm={setDeleteConfirm}
            />

            <BulkActions
              selectedIds={selectedIds}
              handleBulkDelete={handleBulkDelete}
              handleBulkFeatured={handleBulkFeatured}
            />
          </>
        )}
      </main>
    </div>
  );
}
