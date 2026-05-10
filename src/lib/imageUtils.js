import { apiBaseUrl } from './apiClient';

/** Local static asset via CRA PUBLIC_URL when set (e.g. subdirectory deploy). */
function getPlaceholderPath() {
  const pub = typeof process.env.PUBLIC_URL === 'string' ? process.env.PUBLIC_URL.trim() : '';
  if (!pub) return '/placeholder.svg';
  return `${pub.replace(/\/$/, '')}/placeholder.svg`;
}

export const PLACEHOLDER_PATH = getPlaceholderPath();

/**
 * Raw item from backend gallery: prefer relative `imageUrl` over `fullImageUrl`.
 *
 * The backend builds `fullImageUrl` by prepending PUBLIC_BASE_URL, which is the
 * *frontend* domain (ruvali.co.in), not the backend API domain (api.ruvali.co.in).
 * Using `fullImageUrl` therefore produces a URL pointing at the wrong host and 404s.
 * By preferring the relative `imageUrl` ("/uploads/products/foo.jpg"), we let
 * `resolveImageUrl` below prepend `apiBaseUrl` — the correct backend origin.
 */
export function pickGalleryImageSrc(item) {
  if (item == null) return '';
  if (typeof item === 'string') return item.trim();
  if (typeof item === 'object') {
    const iu = typeof item.imageUrl === 'string' ? item.imageUrl.trim() : '';
    if (iu) return iu;
    const fu = typeof item.fullImageUrl === 'string' ? item.fullImageUrl.trim() : '';
    if (fu) return fu;
    const u = typeof item.url === 'string' ? item.url.trim() : '';
    return u || '';
  }
  return '';
}

/** First storefront image URL for cards / thumbnails (prefers primary). */
export function getProductPrimaryImageSource(product) {
  if (!product) return '';
  if (typeof product.image === 'string' && product.image.trim()) return product.image.trim();

  // Build the candidate list — handle both Array and JSON-string (MySQL TEXT) formats
  let list = [];
  if (Array.isArray(product.images)) {
    list = product.images;
  } else if (typeof product.images === 'string' && product.images.trim()) {
    try {
      const parsed = JSON.parse(product.images);
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      // Plain string path like "/uploads/products/foo.jpg"
      return product.images.trim();
    }
  }

  // Fall back to relation-loaded productImages array
  if (list.length === 0 && Array.isArray(product.productImages)) {
    list = product.productImages;
  }

  const primary =
    list.find((i) => i && (i.isPrimary === true || Number(i.isPrimary) === 1)) || list[0];
  return pickGalleryImageSrc(primary);
}

/**
 * Resolves image URLs for display.
 * Accepts strings or `{ imageUrl, fullImageUrl }` objects from product_images APIs.
 *
 * - Full http(s) URLs pass through unchanged.
 * - Relative paths starting with `/uploads/` are prefixed with the backend API base
 *   URL so the browser fetches them from the correct origin (api.ruvali.co.in, not
 *   the frontend ruvali.co.in).
 * - Anything else (CRA public-folder paths like "/logo.png") passes through as-is.
 */
export function resolveImageUrl(urlOrObj) {
  const raw =
    typeof urlOrObj === 'object' && urlOrObj !== null ? pickGalleryImageSrc(urlOrObj) : urlOrObj;

  if (raw == null || typeof raw !== 'string') return PLACEHOLDER_PATH;
  const trimmed = raw.trim();
  if (!trimmed) return PLACEHOLDER_PATH;

  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads/')) {
    return `${apiBaseUrl}${trimmed}`;
  }

  return trimmed;
}
