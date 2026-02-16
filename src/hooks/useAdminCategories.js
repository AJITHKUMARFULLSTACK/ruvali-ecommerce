import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/apiClient';

const getBackendUrl = () =>
  process.env.NODE_ENV === 'development'
    ? (process.env.REACT_APP_API_URL || 'http://localhost:5005')
    : (process.env.REACT_APP_API_URL || window.location.origin);

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function uploadCategoryBanner(categoryId, file) {
  const formData = new FormData();
  formData.append('banner', file);
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/categories/${categoryId}/banner`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || res.statusText);
  }
  return res.json();
}

export function useAdminCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const data = await apiGet('/api/categories/admin', {
        headers: getAuthHeaders(),
      });
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return apiPost('/api/categories', payload, {
        headers: getAuthHeaders(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }) => {
      return apiPut(`/api/categories/${id}`, payload, {
        headers: getAuthHeaders(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await apiDelete(`/api/categories/${id}`, {
        headers: getAuthHeaders(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const uploadBannerMutation = useMutation({
    mutationFn: async ({ categoryId, file }) => uploadCategoryBanner(categoryId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (order) => {
      const base = getBackendUrl();
      const res = await fetch(`${base}/api/categories/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ order }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || err?.message || res.statusText);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    ...query,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    uploadBanner: uploadBannerMutation.mutateAsync,
    reorder: reorderMutation.mutateAsync,
    createLoading: createMutation.isPending,
    updateLoading: updateMutation.isPending,
    deleteLoading: deleteMutation.isPending,
    uploadBannerLoading: uploadBannerMutation.isPending,
    reorderLoading: reorderMutation.isPending,
  };
}
