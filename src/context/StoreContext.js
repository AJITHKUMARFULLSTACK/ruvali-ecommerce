import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiBaseUrl } from '../lib/apiClient';

const StoreContext = createContext(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
};

const BACKEND_URL = apiBaseUrl;
const DEFAULT_STORE_SLUG = 'ruvali-demo';

/** Darken hex color by amount (0-1) */
function darkenHex(hex, amount = 0.15) {
  const m = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return hex;
  const r = Math.max(0, parseInt(m[1], 16) - 255 * amount);
  const g = Math.max(0, parseInt(m[2], 16) - 255 * amount);
  const b = Math.max(0, parseInt(m[3], 16) - 255 * amount);
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

/** Apply store theme to CSS variables - single source of truth for theming */
export function applyStoreTheme(store) {
  if (!store) return;
  const root = document.documentElement;

  const primary = store.primaryColor || '#ff0000';
  const secondary = store.secondaryColor || '#ffffff';
  const isDark = (store.themeMode || 'LIGHT') === 'DARK';

  root.style.setProperty('--primary', primary);
  root.style.setProperty('--secondary', secondary);
  root.style.setProperty('--primary-color', primary);
  root.style.setProperty('--secondary-color', secondary);
  root.style.setProperty('--primary-hover', darkenHex(primary, 0.15));

  if (isDark) {
    root.style.setProperty('--bg', '#0b0b0b');
    root.style.setProperty('--text', '#ffffff');
    root.style.setProperty('--text-muted', 'rgba(255,255,255,0.7)');
    root.style.setProperty('--border', 'rgba(255,255,255,0.12)');
    root.style.setProperty('--surface', '#1a1a1a');
    root.style.setProperty('--surface-hover', '#252525');
    root.style.setProperty('--nav', 'rgba(255,255,255,0.08)');
  } else {
    root.style.setProperty('--bg', '#ffffff');
    root.style.setProperty('--text', '#111111');
    root.style.setProperty('--text-muted', '#666666');
    root.style.setProperty('--border', 'rgba(0,0,0,0.08)');
    root.style.setProperty('--surface', '#f5f5f5');
    root.style.setProperty('--surface-hover', '#eeeeee');
    root.style.setProperty('--nav', 'rgba(255,255,255,0.9)');
  }

  root.style.setProperty('--background', isDark ? '#0b0b0b' : '#ffffff');
  /* Store backgroundImage: homepage/hero only, set via StoreProvider context */
  root.style.setProperty('--store-bg-image', store.backgroundImage || 'none');
}

function getStoreSlug(location, defaultSlug) {
  if (location?.pathname?.startsWith('/admin')) {
    try {
      const adminStore = localStorage.getItem('adminStore');
      const parsed = adminStore ? JSON.parse(adminStore) : null;
      if (parsed?.slug) return parsed.slug;
    } catch {
      // ignore
    }
  }
  return defaultSlug;
}

export const StoreProvider = ({ children }) => {
  const location = useLocation();
  const [theme, setTheme] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const storeSlug = getStoreSlug(location, DEFAULT_STORE_SLUG);

  const applyTheme = useCallback((s) => {
    applyStoreTheme(s);
    setTheme({
      primaryColor: s?.primaryColor || '#ff0000',
      secondaryColor: s?.secondaryColor || '#ffffff',
      themeMode: s?.themeMode || 'LIGHT'
    });
  }, []);

  const {
    data: store,
    isLoading: storeLoading
  } = useQuery({
    queryKey: ['store', storeSlug],
    queryFn: async () => {
      const data = await apiGet(`/api/store/${storeSlug}`);
      return data;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    enabled: !!storeSlug
  });

  useEffect(() => {
    if (store) {
      applyTheme(store);
      setLastFetchTime(new Date().toISOString());
    }
  }, [store, applyTheme]);

  const {
    data: products,
    isLoading: productsLoading
  } = useQuery({
    queryKey: ['products', storeSlug],
    queryFn: async () => {
      const data = await apiGet(
        `/api/products?storeSlug=${encodeURIComponent(storeSlug)}`
      );
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    enabled: !!storeSlug
  });

  const productCount = Array.isArray(products) ? products.length : 0;
  const loading = storeLoading || productsLoading;

  const value = {
    backendUrl: BACKEND_URL,
    storeSlug,
    store,
    theme,
    productCount,
    lastFetchTime,
    loading,
    applyTheme
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
