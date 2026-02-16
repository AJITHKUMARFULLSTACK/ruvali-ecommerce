import { apiBaseUrl } from './apiClient';

/**
 * Resolves image URLs for display.
 * - Relative paths (e.g. /uploads/xxx) get prepended with backend base URL
 * - Full URLs (http/https) are returned as-is
 * - Path is encoded to handle spaces and special characters
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!trimmed) return url;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const pathPart = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${apiBaseUrl}${encodeURI(pathPart)}`;
}
