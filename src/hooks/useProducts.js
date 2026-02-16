import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/apiClient';
import { useStore } from '../context/StoreContext';

/**
 * @param {{ categoryId?: string | null }} params
 */
export function useProducts(params = {}) {
  const { storeSlug } = useStore();
  const { categoryId } = params;

  const query = useQuery({
    queryKey: ['products', storeSlug, categoryId ?? 'all'],
    queryFn: async () => {
      const search = new URLSearchParams({ storeSlug });
      if (categoryId) search.set('categoryId', categoryId);
      const data = await apiGet(`/api/products?${search.toString()}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  return query;
}
