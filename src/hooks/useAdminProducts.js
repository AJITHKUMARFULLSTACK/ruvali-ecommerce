import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete } from '../lib/apiClient';

export function useAdminProducts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const data = await apiGet('/api/products/admin');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await apiDelete(`/api/products/${id}`);
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
