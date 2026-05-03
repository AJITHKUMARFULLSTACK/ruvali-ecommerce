import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Input, Button, Alert } from 'antd';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { apiGet, apiPut, apiPost, fetchApi } from '../../../lib/apiClient';
import { uploadStoreBrandingImage } from '../../../lib/backendUploads';
import { toast } from '../../../lib/toast';
import { resolveImageUrl } from '../../../lib/imageUtils';
import { applyStoreTheme } from '../../../context/StoreContext';
import './AdminSettings.css';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [waStatus, setWaStatus] = useState(null);
  const [waQr, setWaQr] = useState(null);
  const [waConnected, setWaConnected] = useState(false);
  const [waStreamError, setWaStreamError] = useState(null);
  const [waInitMessage, setWaInitMessage] = useState(null);
  const qrStreamAbortRef = useRef(null);

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

  /* WhatsApp status and QR stream */
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    let cancelled = false;

    const stopQrStream = () => {
      qrStreamAbortRef.current?.();
      qrStreamAbortRef.current = null;
    };

    const startQrStream = async () => {
      stopQrStream();
      setWaStreamError(null);

      const controller = new AbortController();
      const res = await fetchApi('/api/admin/whatsapp/qr-stream', {
        signal: controller.signal,
      });

      if (!res.ok) {
        console.error('[WhatsApp] qr-stream non-200:', res.status, res.statusText);
        setWaStreamError('Could not open WhatsApp QR stream. Please try initializing again.');
        return;
      }

      const reader = res.body?.getReader?.();
      if (!reader) {
        console.error('[WhatsApp] qr-stream missing readable body');
        setWaStreamError('Could not read WhatsApp QR stream. Please try again.');
        return;
      }

      qrStreamAbortRef.current = () => {
        try {
          controller.abort();
        } catch {}
        try {
          reader.cancel();
        } catch {}
      };

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done || cancelled) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            console.log('[WhatsApp] SSE event:', payload?.type);
            if (payload.type === 'qr') setWaQr(payload.qr);
            if (payload.type === 'ready') {
              setWaConnected(true);
              setWaQr(null);
              setWaInitMessage(null);
            }
          } catch (e) {
            // heartbeat or non-JSON line, ignore
          }
        }
      }
    };

    const fetchStatus = async () => {
      try {
        const data = await apiGet('/api/admin/whatsapp/status');
        if (cancelled) return;
        setWaStatus(data);
        setWaConnected(data.ready);

        if (data.enabled && !data.ready) {
          if (!data.hasQr) {
            await apiPost('/api/admin/whatsapp/init', {});
          }
          await startQrStream();
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[WhatsApp] status/stream error:', err);
          setWaStreamError('Could not load WhatsApp status. Please refresh and try again.');
        }
      }
    };

    fetchStatus();
    return () => {
      cancelled = true;
      stopQrStream();
    };
  }, []);

  const handleInitWhatsApp = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setWaStreamError(null);
    setWaInitMessage('Starting... please wait for QR code');
    setWaQr(null);
    try {
      await apiPost('/api/admin/whatsapp/init', {});
      // The stream will deliver QR/ready if init succeeds
      const controller = new AbortController();
      const res = await fetchApi('/api/admin/whatsapp/qr-stream', {
        signal: controller.signal,
      });
      if (!res.ok) {
        console.error('[WhatsApp] qr-stream non-200 after init:', res.status, res.statusText);
        setWaStreamError('Could not open WhatsApp QR stream. Please try again.');
        setWaInitMessage(null);
        return;
      }

      const reader = res.body?.getReader?.();
      if (!reader) {
        console.error('[WhatsApp] qr-stream missing readable body after init');
        setWaStreamError('Could not read WhatsApp QR stream. Please try again.');
        setWaInitMessage(null);
        return;
      }

      qrStreamAbortRef.current?.();
      qrStreamAbortRef.current = () => {
        try {
          controller.abort();
        } catch {}
        try {
          reader.cancel();
        } catch {}
      };

      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            console.log('[WhatsApp] SSE event:', payload?.type);
            if (payload.type === 'qr') setWaQr(payload.qr);
            if (payload.type === 'ready') {
              setWaConnected(true);
              setWaQr(null);
              setWaInitMessage(null);
            }
          } catch (e) {
            // heartbeat or non-JSON line, ignore
          }
        }
      }
    } catch (err) {
      console.error('[WhatsApp] init failed:', err);
      setWaStreamError('Failed to initialize WhatsApp. Please try again.');
      setWaInitMessage(null);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      await apiPut('/api/store', payload);
    },
    onSuccess: async () => {
      await apiPost('/api/store/revalidate', {});
      queryClient.invalidateQueries({ queryKey: ['adminStore', slug] });
      queryClient.invalidateQueries({ queryKey: ['store', slug] });
    },
  });

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadStoreBrandingImage(file);
      const url =
        typeof data.url === 'string'
          ? data.url
          : data.imageUrl || data.fullImageUrl || '';
      if (url) setStore((s) => ({ ...s, [field]: url }));
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(err.message || 'Upload failed');
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
      toast.success('Store settings saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to save settings');
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
        <Button type={activeTab === 'branding' ? 'primary' : 'default'} onClick={() => setActiveTab('branding')}>
          Branding & Theme
        </Button>
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
              <Input
                value={store.name}
                onChange={(e) => setStore((s) => ({ ...s, name: e.target.value }))}
                placeholder="Store name"
                size="large"
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
            </div>
            <div className="theme-preview-block">
              <p className="theme-preview-hint">This is how your store looks to customers</p>
              <div
                className="color-preview"
                style={{
                  backgroundColor: store.secondaryColor,
                  color: store.themeMode === 'DARK' ? '#fff' : '#111',
                }}
              >
                {store.logo && (
                  <div className="preview-logo-row">
                    <img
                      src={resolveImageUrl(store.logo)}
                      alt="Store logo"
                      className="preview-logo-in-preview"
                    />
                  </div>
                )}
                <div
                  className="preview-accent"
                  style={{ backgroundColor: store.primaryColor, color: '#fff' }}
                >
                  Primary
                </div>
              </div>
            </div>
          </section>

          <section className="settings-block">
            <h2>Contact</h2>
            <div className="form-group">
              <label>WhatsApp Number</label>
              <Input
                value={store.whatsappNumber}
                onChange={(e) =>
                  setStore((s) => ({ ...s, whatsappNumber: e.target.value }))
                }
                placeholder="+919876543210"
                size="large"
              />
            </div>
          </section>

          <section className="settings-block">
            <h2>WhatsApp</h2>
            {!waStatus?.enabled && (
              <div style={{ color: '#888' }}>
                WhatsApp notifications are disabled.
                Set WHATSAPP_ENABLED=true in your server environment and restart to enable.
              </div>
            )}
            {waStreamError && (
              <Alert type="error" message={waStreamError} showIcon style={{ marginTop: 12 }} />
            )}
            {waStatus?.enabled && (waConnected || waStatus?.ready) && (
              <div style={{ color: 'green', fontWeight: 500 }}>
                WhatsApp connected. Messages will be sent automatically.
              </div>
            )}
            {waStatus?.enabled && !waConnected && !waStatus?.ready && (
              <div style={{ marginTop: 12 }}>
                <Button onClick={handleInitWhatsApp} type="primary">
                  Initialize WhatsApp
                </Button>
                {waInitMessage && (
                  <div style={{ color: '#888', marginTop: 8 }}>
                    {waInitMessage}
                  </div>
                )}
              </div>
            )}
            {waStatus?.enabled && !waConnected && !waStatus?.ready && waQr && (
              <div>
                <Alert type="warning" message="WhatsApp not connected — scan the QR code below with your WhatsApp" showIcon />
                <div style={{ marginTop: 16, display: 'inline-block', padding: 16, background: 'white', borderRadius: 8 }}>
                  <QRCode value={waQr} size={200} />
                </div>
                <p style={{ color: '#888', marginTop: 8, fontSize: 13 }}>
                  Open WhatsApp on your phone → tap Menu → Linked Devices → Link a Device → scan this code
                </p>
              </div>
            )}
            {waStatus?.enabled && !waConnected && !waStatus?.ready && !waQr && (
              <div style={{ color: '#888' }}>
                Connecting to WhatsApp...
              </div>
            )}
          </section>

          <Button type="primary" size="large" onClick={handleSave} loading={saving}>
            Save Settings
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default AdminSettings;
