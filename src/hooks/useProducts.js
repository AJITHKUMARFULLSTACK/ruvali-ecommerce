import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/apiClient';
import { useStore } from '../context/StoreContext';

/**
 * @param {{ categoryId?: string | null, page?: number, limit?: number }} params
 */
export function useProducts(params = {}) {
  const { storeSlug } = useStore();
  const { categoryId, page = 1, limit = 40 } = params;

  const query = useQuery({
    queryKey: ['products', storeSlug, categoryId ?? 'all', page, limit],
    queryFn: async () => {
      const search = new URLSearchParams({ storeSlug, page: String(page), limit: String(limit) });
      if (categoryId) search.set('categoryId', categoryId);
      const data = await apiGet(`/api/products?${search.toString()}`);

      if (Array.isArray(data)) {
        return { products: data, total: data.length, page: 1, totalPages: 1 };
      }
      return {
        products: data.products ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        totalPages: data.totalPages ?? 1
      };
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  return query;
}
