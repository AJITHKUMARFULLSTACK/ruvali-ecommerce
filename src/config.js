/**
 * API environment config
 *
 * Local dev: use proxy (empty base URL)
 * Production (Vercel): always use production backend
 *
 * REACT_APP_API_URL overrides the backend URL when set.
 */
const isProduction = process.env.NODE_ENV === 'production';

export const isTesting = !isProduction;
