import { apiBaseUrl } from './apiClient';

/** Local static asset via CRA PUBLIC_URL when set (e.g. subdirectory deploy). */
function getPlaceholderPath() {
  const pub = typeof process.env.PUBLIC_URL === 'string' ? process.env.PUBLIC_URL.trim() : '';
  if (!pub) return '/placeholder.svg';
  return `${pub.replace(/\/$/, '')}/placeholder.svg`;
}

const PLACEHOLDER_PATH = getPlaceholderPath();

/** Raw item from backend gallery: prefer `fullImageUrl`, then `imageUrl`, then legacy fields. */
export function pickGalleryImageSrc(item) {
  if (item == null) return '';
  if (typeof item === 'string') return item.trim();
  if (typeof item === 'object') {
    const fu = typeof item.fullImageUrl === 'string' ? item.fullImageUrl.trim() : '';
    if (fu) return fu;
    const iu = typeof item.imageUrl === 'string' ? item.imageUrl.trim() : '';
    if (iu) return iu;
    const u = typeof item.url === 'string' ? item.url.trim() : '';
    return u || '';
  }
  return '';
}

/** First storefront image URL for cards / thumbnails (prefers primary). */
export function getProductPrimaryImageSource(product) {
  if (!product) return '';
  if (typeof product.image === 'string' && product.image.trim()) return product.image.trim();

  const list = Array.isArray(product.images) ? product.images : [];
  const primary =
    list.find((i) => i && (i.isPrimary === true || Number(i.isPrimary) === 1)) || list[0];
  return pickGalleryImageSrc(primary);
}

/**
 * Resolves image URLs for display.
 * Accepts strings or `{ fullImageUrl, imageUrl }` from product_images APIs.
 *
 * Full http(s) URLs pass through unchanged.
 * Paths starting `/uploads/` are prefixed with the API base URL.
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
    return `${apiBaseUrl}${encodeURI(trimmed.startsWith('/') ? trimmed : `/${trimmed}`)}`;
  }
  return trimmed;
}
