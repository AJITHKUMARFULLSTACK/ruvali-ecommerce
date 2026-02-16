import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete } from '../lib/apiClient';

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useAdminProducts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const data = await apiGet('/api/products/admin', {
        headers: getAuthHeaders(),
      });
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await apiDelete(`/api/products/${id}`, {
        headers: getAuthHeaders(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    ...query,
    delete: deleteMutation.mutateAsync,
    deleteLoading: deleteMutation.isPending,
  };
}
