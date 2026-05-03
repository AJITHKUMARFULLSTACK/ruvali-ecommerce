import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Input, Button, Alert } from 'antd';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { apiGet, apiPut, apiPost, fetchApi, getAdminToken } from '../../../lib/apiClient';
import { consumeWhatsAppSse, backoffBeforeRetry } from '../../../lib/whatsappSseReader';
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
  const [waInitBusy, setWaInitBusy] = useState(false);
  const [waStreamHint, setWaStreamHint] = useState('');
  const qrStreamAbortRef = useRef(null);
  const waOpsRef = useRef({});

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

  /* Live preview */
  useEffect(() => {
    if (store) applyStoreTheme(store);
  }, [store]);

  waOpsRef.current.stopStream = () => {
    qrStreamAbortRef.current?.();
    qrStreamAbortRef.current = null;
  };

  waOpsRef.current.subscribeStream = async () => {
    waOpsRef.current.stopStream();
    setWaStreamError(null);

    const tokenPresent = Boolean(getAdminToken());
    // eslint-disable-next-line no-console
    console.log('[WhatsApp][FE] token present:', tokenPresent);
    if (!tokenPresent) return;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (attempt > 0) {
        setWaStreamHint(`Reconnecting... (${attempt + 1}/3)`);
        await backoffBeforeRetry(attempt - 1);
      }

      const controller = new AbortController();
      const token = getAdminToken();
      let res;
      try {
        res = await fetchApi('/api/admin/whatsapp/qr-stream', {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[WhatsApp][FE] stream fetch error', e.message);
        continue;
      }

      if (res.status === 401) return;
      if (!res.ok) continue;

      const reader = res.body?.getReader?.();
      if (!reader) continue;

      qrStreamAbortRef.current = () => {
        try {
          controller.abort();
        } catch {
          /* ignore */
        }
        try {
          reader.cancel();
        } catch {
          /* ignore */
        }
      };

      let streamEnded = false;
      try {
        await consumeWhatsAppSse(reader, controller.signal, {
          onQr: (qr) => {
            // eslint-disable-next-line no-console
            console.log('[WhatsApp][FE] stream qr');
            setWaQr(qr);
            setWaStreamHint('');
          },
          onStatus: (status) => {
            // eslint-disable-next-line no-console
            console.log('[WhatsApp][FE] stream status', status);
            if (status === 'connected') {
              setWaConnected(true);
              setWaQr(null);
              setWaInitMessage(null);
              setWaStreamHint('');
            }
            if (status === 'disconnected') {
              setWaConnected(false);
              setWaStreamHint('Reconnecting...');
            }
            if (status === 'qr_expired') {
              setWaStreamHint('QR expired — refreshing session...');
              setTimeout(async () => {
                try {
                  await apiPost('/api/admin/whatsapp/init', {});
                } catch (err) {
                  toast.error(err.message || 'Could not refresh QR');
                }
              }, 650);
            }
          },
          onError: (msg) => toast.error(msg),
          onStreamEnd: () => {
            streamEnded = true;
          },
        });
      } catch (e) {
        streamEnded = true;
        // eslint-disable-next-line no-console
        console.error('[WhatsApp][FE] SSE read ended', e?.message || e);
      }

      if (streamEnded && !controller.signal.aborted) {
        setWaStreamHint('Server restarted, reconnecting WhatsApp...');
        try {
          await apiPost('/api/admin/whatsapp/init', {});
        } catch {
          /* ignore */
        }
      }

      return;
    }

    setWaStreamError('Could not open WhatsApp stream after retries.');
  };

  /* WhatsApp: status + SSE (retries / reconnect hints) */
  useEffect(() => {
    const token = getAdminToken();
    if (!token) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const data = await apiGet('/api/admin/whatsapp/status');
        if (cancelled) return;
        setWaStatus(data);
        setWaConnected(data.ready);

        if (!data.enabled || data.ready) return;

        if (!data.hasQr && !data.initializing) {
          setWaInitBusy(true);
          try {
            await apiPost('/api/admin/whatsapp/init', {});
          } catch (e) {
            toast.error(e.message || 'WhatsApp init failed');
          } finally {
            setWaInitBusy(false);
          }
        }

        await waOpsRef.current.subscribeStream();
      } catch (err) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.error('[WhatsApp][FE] bootstrap error:', err?.message || err);
          setWaStreamError('Could not load WhatsApp status.');
        }
      }
    })();

    return () => {
      cancelled = true;
      waOpsRef.current.stopStream();
    };
  }, []);

  const handleInitWhatsApp = async () => {
    const token = getAdminToken();
    if (!token) return;
    if (waInitBusy || waStatus?.initializing) return;

    setWaStreamError(null);
    setWaInitMessage('Initializing...');
    setWaQr(null);
    setWaInitBusy(true);

    try {
      await apiPost('/api/admin/whatsapp/init', {});
    } catch (err) {
      toast.error(err.message || 'Initialization failed');
      setWaInitMessage(null);
      return;
    } finally {
      setWaInitBusy(false);
    }

    await waOpsRef.current.subscribeStream();
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
            {waStreamHint ? (
              <Alert type="info" message={waStreamHint} showIcon style={{ marginTop: 12 }} />
            ) : null}
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
                <Button
                  onClick={handleInitWhatsApp}
                  type="primary"
                  disabled={waInitBusy || !!waStatus?.initializing}
                  loading={waInitBusy}
                >
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
