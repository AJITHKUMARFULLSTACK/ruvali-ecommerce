import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '../lib/apiClient';

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useAdminOrders({ page = 1, limit = 20 } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['adminOrders', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const data = await apiGet(`/api/orders?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (Array.isArray(data)) {
        return { orders: data, total: data.length, page: 1, totalPages: 1 };
      }
      return {
        orders: data.orders ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        totalPages: data.totalPages ?? 1
      };
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
