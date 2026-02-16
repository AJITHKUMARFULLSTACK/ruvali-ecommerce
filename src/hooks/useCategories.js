import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/apiClient';
import { useStore } from '../context/StoreContext';

export function buildCategoryTree(categories) {
  const nodesById = {};
  const roots = [];

  categories.forEach((cat) => {
    nodesById[cat.id] = { ...cat, children: [] };
  });

  categories.forEach((cat) => {
    const node = nodesById[cat.id];
    if (cat.parentId && nodesById[cat.parentId]) {
      nodesById[cat.parentId].children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function useCategories() {
  const { storeSlug } = useStore();

  const query = useQuery({
    queryKey: ['categories', storeSlug],
    queryFn: async () => {
      const data = await apiGet(
        `/api/categories?storeSlug=${encodeURIComponent(storeSlug)}`
      );
      console.log('[useCategories] categories', data);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  });

  const tree = query.data ? buildCategoryTree(query.data) : [];

  return {
    ...query,
    tree,
  };
}

