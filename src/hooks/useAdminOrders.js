import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '../lib/apiClient';

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useAdminOrders() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const data = await apiGet('/api/orders', {
        headers: getAuthHeaders(),
      });
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      await apiPut(`/api/orders/${orderId}/status`, { status }, {
        headers: getAuthHeaders(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
  });

  return {
    ...query,
    updateStatus: updateStatusMutation.mutateAsync,
    updateLoading: updateStatusMutation.isPending,
  };
}
