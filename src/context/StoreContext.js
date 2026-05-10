import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiBaseUrl, STORE_SLUG } from '../lib/apiClient';

const StoreContext = createContext(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
};

const BACKEND_URL = apiBaseUrl;
const DEFAULT_STORE_SLUG = STORE_SLUG;

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

  const storeSlug = getStoreSlug(location, DEFAULT_STORE_SLUG);

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', storeSlug],
    queryFn: () => apiGet(`/api/store/${storeSlug}`),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!storeSlug,
  });

  const value = useMemo(
    () => ({
      backendUrl: BACKEND_URL,
      storeSlug,
      store,
      loading: isLoading,
    }),
    [storeSlug, store, isLoading]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
