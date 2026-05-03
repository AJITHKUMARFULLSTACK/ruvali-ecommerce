import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/apiClient';
import { putCategoryBanner } from '../lib/backendUploads';

export function useAdminCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const data = await apiGet('/api/categories/admin');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return apiPost('/api/categories', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }) => {
      return apiPut(`/api/categories/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await apiDelete(`/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const uploadBannerMutation = useMutation({
    mutationFn: async ({ categoryId, file }) => putCategoryBanner(categoryId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (order) => {
      return apiPut('/api/categories/reorder', { order });
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
