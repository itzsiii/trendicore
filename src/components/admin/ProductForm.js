import { Package, X, Star, Clock } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import styles from '@/app/(admin)/dashboard/dashboard.module.css';
import Button from '@/components/ui/Button';

export default function ProductForm({
  form,
  errors,
  register,
  setValue,
  handleFormSubmit,
  onSubmit,
  resetForm,
  editingId,
  saving,
  imagePreview,
  handleImageChange,
  setImageFile,
  setImagePreview,
  isExtracting,
  handleAutoFill,
  products,
  currentUser,
  CATEGORIES,
  SOURCES
}) {
  const { t } = useLocale();

  return (
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
            <label className={styles.formLabel}>
              {form?.category === 'suscripciones' ? t('admin.form.sub_name') : t('admin.form.title')}
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder={form?.category === 'suscripciones' ? t('admin.form.sub_name_placeholder') : t('admin.form.title_placeholder')}
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

            {form?.category !== 'suscripciones' && (
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
            )}
          </div>

          {/* Region + Featured in a row */}
          <div className={styles.formRow}>
            {form?.category !== 'suscripciones' && (
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
            )}

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

          {/* Price + Period Row — ONLY for subscriptions */}
          {form?.category === 'suscripciones' && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('admin.form.price')}</label>
                <div className={styles.priceInputWrapper}>
                  <span className={styles.currencySymbol}>€</span>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price')}
                    className={styles.formInput}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <span className={styles.formError}>{errors.price.message}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('admin.form.period')}</label>
                <div className={styles.periodSelector}>
                  {[
                    { value: 'dia', label: '/ Día' },
                    { value: 'mes', label: '/ Mes' },
                    { value: 'año', label: '/ Año' },
                  ].map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={`${styles.periodOption} ${form?.price_period === p.value ? styles.activePeriod : ''}`}
                      onClick={() => setValue('price_period', p.value, { shouldValidate: true })}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description — ONLY for subscriptions */}
          {form?.category === 'suscripciones' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('admin.form.description') || 'Descripción'}</label>
              <textarea
                {...register('description')}
                placeholder={t('admin.form.sub_desc_placeholder')}
                className={styles.urlTextarea}
                rows={3}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <div className={styles.labelWithAction}>
              <label className={styles.formLabel}>
                {form?.category === 'suscripciones' ? t('admin.form.sub_link') : t('admin.form.affiliate_link')}
              </label>
              {form?.category !== 'suscripciones' && (
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
              )}
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
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className={`${styles.previewImg} ${form?.category === 'suscripciones' ? styles.containImage : ''}`} 
                  />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(''); }}
                    className={styles.removeImageBtn}
                    title={t('admin.form.remove_tag')}
                  >
                    <X size={16} />
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
            <input 
              type="url"
              className={styles.formInput}
              style={{ marginTop: '12px' }}
              placeholder={t('admin.form.image_url_placeholder')}
              value={typeof imagePreview === 'string' ? imagePreview : ''}
              onChange={(e) => {
                setImagePreview(e.target.value);
                setImageFile(null); // Clear file if URL is provided
              }}
            />
          </div>

          {/* Image Credits — ONLY for subscriptions */}
          {form?.category === 'suscripciones' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('admin.form.image_credits') || 'Créditos de Imagen (Opcional)'}</label>
              <textarea
                {...register('image_credits')}
                placeholder='Ej: <a href="https://www.flaticon.es/iconos-gratis/netflix">Netflix iconos...</a>'
                className={styles.urlTextarea}
                rows={2}
              />
              <span className={styles.formHint} style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                {t('admin.form.image_credits_hint')}
              </span>
            </div>
          )}

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
                <img src={`/images/flags/${form?.region || 'es'}.svg`} alt={form?.region || 'es'} />
                <span>{(form?.region || 'es').toUpperCase()}</span>
              </div>
              <div className={`${styles.previewStatusBadge}`}>✅ {t('admin.tabs.published')}</div>
              {form?.category !== 'suscripciones' && (
                <div className={`${styles.previewSourceBadge} ${styles[form?.affiliate_source || 'amazon']}`}>
                  {form?.affiliate_source === 'amazon' ? '🟠' : form?.affiliate_source === 'shein' ? '🟣' : '🔵'} {form?.affiliate_source === 'amazon' ? 'Amazon' : form?.affiliate_source === 'shein' ? 'Shein' : 'Otros'}
                </div>
              )}
              {form?.featured && (
                <div className={styles.previewFeaturedBadge}>
                  <Star size={12} fill="#f1c40f" color="#f1c40f" />
                </div>
              )}
            </div>
            {/* Preview Info */}
            <div className={styles.previewInfoRich}>
              <h4 className={styles.previewTitleRich}>
                {form?.title || t('admin.form.title_placeholder')}
              </h4>
              <div className={styles.previewMetaRich}>
                <span className={styles.previewCategoryBadge}>
                  {CATEGORIES.find(c => c.value === form?.category)?.icon} {CATEGORIES.find(c => c.value === form?.category)?.label}
                </span>
              </div>
              <div className={styles.previewActionsPreview}>
                <span 
                  className={styles.previewEditBtn} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => document.querySelector('input[name="title"]')?.focus()}
                >
                  ✏️ {t('admin.actions.edit')}
                </span>
                <span className={styles.previewDeleteBtn}>🗑️</span>
              </div>
            </div>
          </div>

          {/* URL Check */}
          {form?.affiliate_link && (
            <div className={styles.previewUrlCheck}>
              <span className={styles.previewUrlLabel}>🔗 {t('admin.form.affiliate_link')}</span>
              <a 
                href={form?.affiliate_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.previewUrlLink}
              >
                {(() => { try { return new URL(form?.affiliate_link).hostname; } catch { return form?.affiliate_link.substring(0, 40); } })()}
              </a>
            </div>
          )}

          {/* Checklist */}
          <div className={styles.previewChecklist}>
            <div className={`${styles.checkItem} ${form?.title ? styles.checkDone : ''}`}>
              {form?.title ? '✅' : '⬜'} {t('admin.form.title')}
            </div>
            <div className={`${styles.checkItem} ${form?.affiliate_link ? styles.checkDone : ''}`}>
              {form?.affiliate_link ? '✅' : '⬜'} {t('admin.form.affiliate_link')}
            </div>
            <div className={`${styles.checkItem} ${(imagePreview || (editingId && products.find(p => p.id === editingId)?.image_url)) ? styles.checkDone : ''}`}>
              {(imagePreview || (editingId && products.find(p => p.id === editingId)?.image_url)) ? '✅' : '⬜'} {t('admin.form.image')}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
