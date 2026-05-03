/**
 * Dev-only UI (e.g. test card banner on payment page).
 * Backend URL is driven by REACT_APP_API_URL in src/lib/apiClient.js.
 *
 * Override: REACT_APP_SHOW_TEST_PAYMENT_BANNER=true|false
 */
export const isTesting =
  process.env.REACT_APP_SHOW_TEST_PAYMENT_BANNER === 'true' ||
  (process.env.NODE_ENV === 'development' &&
    process.env.REACT_APP_SHOW_TEST_PAYMENT_BANNER !== 'false');
