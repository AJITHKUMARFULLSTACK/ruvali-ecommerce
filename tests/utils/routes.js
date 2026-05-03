/** Kept in sync with src/App.js — every path we expect to render */

const STORE_PUBLIC_ROUTES = [
  { path: '/', label: 'home' },
  { path: '/c', label: 'category-root' },
  { path: '/c/men', label: 'category-men' },
  { path: '/donate', label: 'donate' },
  { path: '/about', label: 'about' },
  { path: '/contact', label: 'contact' },
  { path: '/cart', label: 'cart' },
  { path: '/checkout', label: 'checkout' },
  { path: '/shipping', label: 'shipping' },
  { path: '/returns', label: 'returns' },
  { path: '/faq', label: 'faq' },
  { path: '/size-guide', label: 'size-guide' },
  { path: '/track-order', label: 'track-order' },
  { path: '/payment', label: 'payment' },
  { path: '/order-confirmation', label: 'order-confirmation' },
  { path: '/account/login', label: 'account-login' },
  { path: '/account/orders', label: 'account-orders' },
];

const ADMIN_PUBLIC_ROUTES = [{ path: '/admin/login', label: 'admin-login' }];

/** Shortcuts that should stay as clean URLs */
const LEGACY_REDIRECTS = [
  { from: '/men', toPattern: /\/c\/men/ },
  { from: '/women', toPattern: /\/c\/women/ },
];

/** JWT required — cleared storage tests expect /admin/login */
const ADMIN_PROTECTED_PATHS = [
  '/admin/dashboard',
  '/admin/settings',
  '/admin/categories',
  '/admin/products',
  '/admin/products/new',
  '/admin/orders',
];

module.exports = {
  STORE_PUBLIC_ROUTES,
  ADMIN_PUBLIC_ROUTES,
  LEGACY_REDIRECTS,
  ADMIN_PROTECTED_PATHS,
};
