/**
 * Convert string to URL-safe slug.
 */
export function slugify(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get display slug for a category (use DB slug or derive from name).
 */
export function getCategorySlug(cat) {
  if (!cat) return '';
  if (cat.slug && cat.slug.trim()) return slugify(cat.slug);
  return slugify(cat.name);
}

/**
 * Find category by slug (and optional parent constraint).
 */
export function findCategoryBySlug(categories, slug, parentId = null) {
  if (!Array.isArray(categories) || !slug) return null;
  for (const c of categories) {
    const s = getCategorySlug(c);
    const matchSlug = s === slug;
    const matchParent =
      parentId === null
        ? !c.parentId
        : c.parentId === parentId;
    if (matchSlug && matchParent) return c;
  }
  return null;
}
