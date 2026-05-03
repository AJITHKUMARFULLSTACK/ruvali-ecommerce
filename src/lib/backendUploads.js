/**
 * Multipart uploads for Ruvali admin (routes match ruvali-backend).
 * Uses apiClient so x-store-slug + admin Bearer are applied consistently.
 */

import { apiPost, apiPut } from './apiClient';

/** Logo / storefront background preview — field name image (legacy-compatible). */
export async function uploadStoreBrandingImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  return apiPost('/api/store/asset', fd);
}

/** Category banner — multipart field banner. */
export async function putCategoryBanner(categoryId, file) {
  const fd = new FormData();
  fd.append('banner', file);
  return apiPut(`/api/categories/${categoryId}/banner`, fd);
}
