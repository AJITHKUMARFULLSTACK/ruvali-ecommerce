import { apiBaseUrl } from './apiClient';

/**
 * Placeholder path when no image URL is available.
 * Ensure public/placeholder.svg exists (simple SVG: light gray bg, "No image" text).
 */
const PLACEHOLDER_PATH = '/placeholder.svg';

/**
 * Resolves image URLs for display.
 * 1. Full Cloudinary URL (https://res.cloudinary.com) → return as-is
 * 2. Full URL (http/https) → return as-is
 * 3. Relative path /uploads/xxx → prefix with backend API base URL
 * 4. Empty, null, undefined → return placeholder path
 * 5. Any other string → return as-is
 * Never returns undefined or empty string.
 */
export function resolveImageUrl(url) {
  if (url == null || typeof url !== 'string') return PLACEHOLDER_PATH;
  const trimmed = url.trim();
  if (!trimmed) return PLACEHOLDER_PATH;
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) {
    return `${apiBaseUrl}${encodeURI(trimmed.startsWith('/') ? trimmed : `/${trimmed}`)}`;
  }
  return trimmed;
}
