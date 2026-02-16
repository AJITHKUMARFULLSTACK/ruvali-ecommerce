import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiGet, apiPut, apiPost, apiBaseUrl } from '../../../lib/apiClient';
import { resolveImageUrl } from '../../../lib/imageUtils';
import { applyStoreTheme } from '../../../context/StoreContext';
import './AdminSettings.css';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');

  const adminStore = (() => {
    try {
      const s = localStorage.getItem('adminStore');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const slug = adminStore?.slug;

  const { data: storeData, isLoading } = useQuery({
    queryKey: ['adminStore', slug],
    queryFn: () => apiGet(`/api/store/${slug}`),
    enabled: !!slug,
  });

  useEffect(() => {
    if (storeData) {
      setStore({
        name: storeData.name || '',
        logo: storeData.logo || '',
        primaryColor: storeData.primaryColor || '#ff0000',
        secondaryColor: storeData.secondaryColor || '#ffffff',
        themeMode: storeData.themeMode || 'LIGHT',
        backgroundImage: storeData.backgroundImage || '',
        whatsappNumber: storeData.whatsappNumber || '',
      });
    }
    setLoading(!slug || isLoading);
  }, [storeData, slug, isLoading]);

  /* Live preview: apply theme whenever local store changes */
  useEffect(() => {
    if (store) applyStoreTheme(store);
  }, [store]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem('adminToken');
      await apiPut('/api/store', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: async () => {
      const token = localStorage.getItem('adminToken');
      await apiPost('/api/store/revalidate', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      queryClient.invalidateQueries({ queryKey: ['adminStore', slug] });
      queryClient.invalidateQueries({ queryKey: ['store', slug] });
    },
  });

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${apiBaseUrl}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      const url = data.url;
      if (url) setStore((s) => ({ ...s, [field]: url }));
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleSave = async () => {
    if (!store) return;
    setSaving(true);
    try {
      await updateMutation.mutateAsync({
        name: store.name,
        logo: store.logo || undefined,
        primaryColor: store.primaryColor,
        secondaryColor: store.secondaryColor,
        themeMode: store.themeMode || 'LIGHT',
        backgroundImage: store.backgroundImage || undefined,
        whatsappNumber: store.whatsappNumber,
      });
      setStore((s) => ({ ...s }));
      alert('Store settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !store) {
    return <div className="admin-settings-loading">Loading...</div>;
  }

  return (
    <div className="admin-settings">
      <h1>Store Settings</h1>

      <div className="settings-tabs">
        <button
          className={activeTab === 'branding' ? 'active' : ''}
          onClick={() => setActiveTab('branding')}
        >
          Branding & Theme
        </button>
      </div>

      {activeTab === 'branding' && (
        <motion.div
          className="settings-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <section className="settings-block">
            <h2>Store Identity</h2>
            <div className="form-group">
              <label>Store Name</label>
              <input
                type="text"
                value={store.name}
                onChange={(e) => setStore((s) => ({ ...s, name: e.target.value }))}
                placeholder="Store name"
              />
            </div>

            <div className="form-group">
              <label>Logo</label>
              <div className="upload-preview">
                {store.logo && (
                  <img src={resolveImageUrl(store.logo)} alt="Logo" className="preview-logo" />
                )}
                <div className="upload-actions">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, 'logo')}
                    id="logo-upload"
                    hidden
                  />
                  <label htmlFor="logo-upload" className="upload-btn">
                    {store.logo ? 'Change Logo' : 'Upload Logo'}
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Background Image</label>
              <div className="upload-preview">
                {store.backgroundImage && (
                  <img src={resolveImageUrl(store.backgroundImage)} alt="Background" className="preview-bg" />
                )}
                <div className="upload-actions">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, 'backgroundImage')}
                    id="bg-upload"
                    hidden
                  />
                  <label htmlFor="bg-upload" className="upload-btn">
                    {store.backgroundImage ? 'Change Background' : 'Upload Background'}
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="settings-block">
            <h2>Theme Colors</h2>
            <div className="theme-colors">
              <div className="color-group">
                <label>Primary Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={store.primaryColor}
                    onChange={(e) =>
                      setStore((s) => ({ ...s, primaryColor: e.target.value }))
                    }
                  />
                  <input
                    type="text"
                    value={store.primaryColor}
                    onChange={(e) =>
                      setStore((s) => ({ ...s, primaryColor: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="color-group">
                <label>Secondary Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={store.secondaryColor}
                    onChange={(e) =>
                      setStore((s) => ({ ...s, secondaryColor: e.target.value }))
                    }
                  />
                  <input
                    type="text"
                    value={store.secondaryColor}
                    onChange={(e) =>
                      setStore((s) => ({ ...s, secondaryColor: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Theme Mode</label>
              <div className="theme-mode-toggle">
                <button
                  type="button"
                  className={store.themeMode === 'LIGHT' ? 'active' : ''}
                  onClick={() => setStore((s) => ({ ...s, themeMode: 'LIGHT' }))}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={store.themeMode === 'DARK' ? 'active' : ''}
                  onClick={() => setStore((s) => ({ ...s, themeMode: 'DARK' }))}
                >
                  Dark
                </button>
              </div>
              <p className="theme-preview-hint">This is how your store looks to customers</p>
            </div>
            <div
              className="color-preview"
              style={{
                backgroundColor: store.secondaryColor,
                color: store.themeMode === 'DARK' ? '#fff' : '#111',
              }}
            >
              <div
                className="preview-accent"
                style={{ backgroundColor: store.primaryColor, color: '#fff' }}
              >
                Primary
              </div>
            </div>
          </section>

          <section className="settings-block">
            <h2>Contact</h2>
            <div className="form-group">
              <label>WhatsApp Number</label>
              <input
                type="text"
                value={store.whatsappNumber}
                onChange={(e) =>
                  setStore((s) => ({ ...s, whatsappNumber: e.target.value }))
                }
                placeholder="+919876543210"
              />
            </div>
          </section>

          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default AdminSettings;
