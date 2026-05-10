import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Input, Button } from 'antd';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { apiGet, apiPut, apiPost, fetchApi, getAdminToken } from '../../../lib/apiClient';
import { consumeWhatsAppSse } from '../../../lib/whatsappSseReader';
import { uploadStoreBrandingImage } from '../../../lib/backendUploads';
import { toast } from '../../../lib/toast';
import { resolveImageUrl } from '../../../lib/imageUtils';
import './AdminSettings.css';

// WhatsApp UI state machine:
// 'idle'         — enabled, not connected, ready for manual connect
// 'loading'      — init called, waiting for QR
// 'qr'           — QR received, waiting for scan
// 'connected'    — WhatsApp authenticated
// 'reconnecting' — was connected, lost connection
// 'error'        — init or stream failed
// (disabled state is handled inline via waEnabled flag)

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [waEnabled, setWaEnabled] = useState(false);
  const [waUiState, setWaUiState] = useState('idle');
  const [waQr, setWaQr] = useState(null);
  const [waError, setWaError] = useState(null);
  const [qrCountdown, setQrCountdown] = useState(60);

  const streamAbortRef = useRef(null);
  const initRunningRef = useRef(false);

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
        backgroundImage: storeData.backgroundImage || '',
        whatsappNumber: storeData.whatsappNumber || '',
      });
    }
    setLoading(!slug || isLoading);
  }, [storeData, slug, isLoading]);

  const stopStream = useCallback(() => {
    streamAbortRef.current?.();
    streamAbortRef.current = null;
  }, []);

  const openStream = useCallback(async () => {
    const token = getAdminToken();
    if (!token) return;

    stopStream();

    const controller = new AbortController();
    let res;
    try {
      res = await fetchApi('/api/admin/whatsapp/qr-stream', {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      return;
    }

    if (!res.ok || res.status === 401) return;

    const reader = res.body?.getReader?.();
    if (!reader) return;

    streamAbortRef.current = () => {
      try { controller.abort(); } catch { /* ignore */ }
      try { reader.cancel(); } catch { /* ignore */ }
    };

    let explicitlyStopped = false;
    try {
      await consumeWhatsAppSse(reader, controller.signal, {
        onQr: (qr) => {
          setWaQr(qr);
          setWaUiState('qr');
          setQrCountdown(60);
        },
        onStatus: (status) => {
          if (status === 'connected') {
            setWaUiState('connected');
            setWaQr(null);
            explicitlyStopped = true;
            stopStream();
          }
          if (status === 'disconnected') {
            setWaUiState('reconnecting');
          }
          if (status === 'qr_expired') {
            setWaQr(null);
            setWaUiState('loading');
          }
        },
        onError: (msg) => {
          setWaError(msg || 'An error occurred');
          setWaUiState('error');
          explicitlyStopped = true;
        },
      });
    } catch {
      /* stream closed */
    }

    if (!controller.signal.aborted && !explicitlyStopped) {
      setWaError('WhatsApp stream disconnected unexpectedly. Click "Try Again" to reconnect.');
      setWaUiState('error');
    }
  }, [stopStream]);

  const doInitAndStream = useCallback(async () => {
    if (initRunningRef.current) return;
    initRunningRef.current = true;

    if (!getAdminToken()) {
      initRunningRef.current = false;
      return;
    }

    setWaError(null);
    setWaQr(null);
    setWaUiState('loading');

    try {
      await apiPost('/api/admin/whatsapp/init', {});
    } catch (err) {
      setWaError(err.message || 'Could not initialize WhatsApp. Please try again.');
      setWaUiState('error');
      initRunningRef.current = false;
      return;
    }

    initRunningRef.current = false;
    await openStream();
  }, [openStream]);

  useEffect(() => {
    if (!getAdminToken()) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const data = await apiGet('/api/admin/whatsapp/status');
        if (cancelled) return;

        setWaEnabled(data.enabled);

        if (!data.enabled) return;

        if (data.ready) {
          setWaUiState('connected');
          return;
        }

        if (data.initializing || data.hasQr) {
          await openStream();
        } else {
          await doInitAndStream();
        }
      } catch {
        if (!cancelled) {
          setWaError('Could not load WhatsApp status.');
          setWaUiState('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [doInitAndStream, openStream, stopStream]);

  // QR countdown timer
  useEffect(() => {
    if (waUiState !== 'qr' || qrCountdown <= 0) return undefined;
    const t = setTimeout(() => setQrCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [waUiState, qrCountdown]);

  const handleConnectClick = () => doInitAndStream();

  const handleRefreshQr = () => doInitAndStream();

  const handleCancel = () => {
    stopStream();
    initRunningRef.current = false;
    setWaUiState('idle');
    setWaQr(null);
    setWaError(null);
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
        backgroundImage: store.backgroundImage || undefined,
        whatsappNumber: store.whatsappNumber,
      });
      toast.success('Store settings saved successfully!');
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !store) {
    return <div className="admin-settings-loading">Loading...</div>;
  }

  const renderWhatsApp = () => {
    if (!waEnabled) {
      return (
        <div className="wa-state wa-state--disabled">
          <p>WhatsApp notifications are disabled.</p>
          <p className="wa-hint">
            Set <code>WHATSAPP_ENABLED=true</code> in your server environment and restart to enable.
          </p>
        </div>
      );
    }

    if (waUiState === 'idle') {
      return (
        <div className="wa-state wa-state--idle">
          <div className="wa-status-row">
            <span className="wa-dot wa-dot--off" />
            <span className="wa-status-label">WhatsApp Not Connected</span>
          </div>
          <ul className="wa-checklist">
            <li>You haven't linked your WhatsApp account yet.</li>
            <li>Order notifications will not be sent until connected.</li>
          </ul>
          <Button type="primary" danger size="large" onClick={handleConnectClick} className="wa-main-btn">
            Connect WhatsApp
          </Button>
        </div>
      );
    }

    if (waUiState === 'loading') {
      return (
        <div className="wa-state wa-state--loading">
          <div className="wa-spinner" />
          <p className="wa-loading-text">Setting up WhatsApp...</p>
          <p className="wa-hint">This usually takes 10–20 seconds.</p>
          <Button size="small" onClick={handleCancel} className="wa-cancel-btn">
            Cancel
          </Button>
        </div>
      );
    }

    if (waUiState === 'qr') {
      return (
        <div className="wa-state wa-state--qr">
          <div className="wa-qr-wrap">
            {qrCountdown > 0 ? (
              <QRCode value={waQr} size={250} />
            ) : (
              <div className="wa-qr-expired">QR Expired</div>
            )}
          </div>
          <h3 className="wa-qr-title">Scan with WhatsApp to connect</h3>
          <ol className="wa-qr-steps">
            <li>Open WhatsApp on your phone</li>
            <li>Tap <strong>Menu (...)</strong> &rarr; <strong>Linked Devices</strong></li>
            <li>Tap <strong>Link a Device</strong></li>
            <li>Point your camera at this QR code</li>
          </ol>
          {qrCountdown > 0 ? (
            <p className="wa-countdown">QR expires in: <strong>{qrCountdown}s</strong></p>
          ) : (
            <p className="wa-countdown wa-countdown--expired">QR code expired</p>
          )}
          <Button size="small" onClick={handleRefreshQr} className="wa-refresh-btn">
            Refresh QR
          </Button>
        </div>
      );
    }

    if (waUiState === 'connected') {
      return (
        <div className="wa-state wa-state--connected">
          <div className="wa-connected-banner">
            <span className="wa-dot wa-dot--on" />
            <span className="wa-status-label">WhatsApp Connected</span>
          </div>
          <p className="wa-hint">Order notifications are active and will be sent automatically.</p>
          <Button size="small" onClick={handleConnectClick} className="wa-cancel-btn">
            Re-connect
          </Button>
        </div>
      );
    }

    if (waUiState === 'reconnecting') {
      return (
        <div className="wa-state wa-state--reconnecting">
          <div className="wa-spinner wa-spinner--orange" />
          <p className="wa-loading-text">Reconnecting to WhatsApp...</p>
          <p className="wa-hint">If this takes more than 30 seconds, cancel and try again.</p>
          <Button size="small" onClick={handleCancel} className="wa-cancel-btn">
            Cancel
          </Button>
        </div>
      );
    }

    if (waUiState === 'error') {
      return (
        <div className="wa-state wa-state--error">
          <div className="wa-error-icon">&#x274C;</div>
          <p className="wa-error-title">Connection Failed</p>
          {waError && <p className="wa-error-msg">{waError}</p>}
          <p className="wa-hint">Click "Try Again" to restart the connection process.</p>
          <Button type="primary" danger onClick={handleConnectClick} className="wa-main-btn">
            Try Again
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="admin-settings">
      <h1>Store Settings</h1>

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
            <label>Hero Background Image</label>
            <p className="settings-field-hint">Displayed on the home page and category hero banners.</p>
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
          <h2>Contact</h2>
          <div className="form-group">
            <label>Your WhatsApp Business Number</label>
            <p className="settings-field-hint">
              The number customers receive order notifications from. Include country code with no spaces or symbols (e.g. <code>919876543210</code> for India).
            </p>
            <Input
              value={store.whatsappNumber}
              onChange={(e) =>
                setStore((s) => ({ ...s, whatsappNumber: e.target.value }))
              }
              placeholder="919XXXXXXXXXX"
              size="large"
            />
          </div>
        </section>

        <section className="settings-block">
          <h2>WhatsApp</h2>
          {renderWhatsApp()}
        </section>

        <Button type="primary" size="large" onClick={handleSave} loading={saving}>
          Save Settings
        </Button>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
