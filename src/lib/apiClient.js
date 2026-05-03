/**
 * Backend base URL — set REACT_APP_API_URL for production / remote API.
 */
const LIVE_API_DEFAULT = 'https://maroon-mongoose-803610.hostingersite.com';
const LOCAL_API = 'http://localhost:5005';

function normalizeBase(url) {
  return (url || '').replace(/\/$/, '');
}

export const STORE_SLUG = (process.env.REACT_APP_STORE_SLUG || 'ruvali').trim();

export function getApiBaseUrl() {
  const fromEnv = process.env.REACT_APP_API_URL?.trim();
  if (fromEnv) return normalizeBase(fromEnv);

  const useLocal =
    process.env.REACT_APP_USE_LOCAL_API === 'true' ||
    (process.env.NODE_ENV === 'development' &&
      process.env.REACT_APP_USE_LOCAL_API !== 'false');

  return normalizeBase(useLocal ? LOCAL_API : LIVE_API_DEFAULT);
}

export const apiBaseUrl = getApiBaseUrl();

/**
 * Paths that must never attach admin JWT (public + customer-auth routes).
 */
function shouldAttachAdminJwt(pathWithQuery, method = 'GET') {
  const p = pathWithQuery.split('?')[0];
  const m = (method || 'GET').toUpperCase();

  if (p === '/api/admin/login') return false;

  if (m === 'GET' && p === '/api/products') return false;

  if (m === 'GET' && p.startsWith('/api/store/')) return false;

  if (m === 'GET' && p.startsWith('/api/categories') && !p.includes('/admin')) return false;

  if (p.startsWith('/api/customer/')) return false;

  if (m === 'GET' && p === '/api/orders/track') return false;

  if (
    m === 'POST' &&
    (p === '/api/orders' || p.startsWith('/api/orders/razorpay/'))
  ) {
    return false;
  }

  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem('adminToken'));
}

/**
 * Always send x-store-slug; attach Bearer for admin routes only (never on public/customer calls).
 *
 * Signature: buildApiHeaders(path), buildApiHeaders(path, extraHeaders), or
 * buildApiHeaders(path, method, extraHeaders)
 */
export function buildApiHeaders(path, methodOrHeaders = {}, maybeHeaders = undefined) {
  let method = 'GET';
  let extraHeaders = {};

  if (typeof methodOrHeaders === 'string') {
    method = methodOrHeaders;
    extraHeaders = maybeHeaders || {};
  } else {
    extraHeaders = methodOrHeaders || {};
  }

  const headers = { ...extraHeaders };
  if (!headers['x-store-slug'] && !headers['X-Store-Slug']) {
    headers['x-store-slug'] = STORE_SLUG;
  }

  const attach = shouldAttachAdminJwt(path, method);
  if (attach && !headers.Authorization && !headers.authorization) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export function publicApiHeaders(extra = {}) {
  return {
    'x-store-slug': STORE_SLUG,
    ...extra,
  };
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const err = data?.error;
    const message =
      (err?.debug?.message || err?.message || data?.message) ||
      res.statusText ||
      'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function apiGet(path, options = {}) {
  const { headers: optionHeaders = {}, ...restOptions } = options;
  const url = `${apiBaseUrl}${path}`;
  const hdr = buildApiHeaders(path, 'GET', optionHeaders);

  const res = await fetch(url, {
    ...restOptions,
    headers: hdr,
  });
  return handleResponse(res);
}

function isFormDataBody(body) {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

export async function apiPost(path, body, options = {}) {
  const url = `${apiBaseUrl}${path}`;
  const { headers: optionHeaders = {}, ...restOptions } = options;
  const multipart = isFormDataBody(body);
  const hdr = multipart
    ? buildApiHeaders(path, 'POST', { ...optionHeaders })
    : buildApiHeaders(path, 'POST', {
        'Content-Type': 'application/json',
        ...optionHeaders,
      });
  if (multipart) {
    delete hdr['Content-Type'];
    delete hdr['content-type'];
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: hdr,
    body: multipart ? body : JSON.stringify(body),
    ...restOptions,
  });
  return handleResponse(res);
}

export async function apiPut(path, body, options = {}) {
  const url = `${apiBaseUrl}${path}`;
  const { headers: optionHeaders = {}, ...restOptions } = options;
  const multipart = isFormDataBody(body);
  const hdr = multipart
    ? buildApiHeaders(path, 'PUT', { ...optionHeaders })
    : buildApiHeaders(path, 'PUT', {
        'Content-Type': 'application/json',
        ...optionHeaders,
      });
  if (multipart) {
    delete hdr['Content-Type'];
    delete hdr['content-type'];
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: hdr,
    body: multipart ? body : JSON.stringify(body),
    ...restOptions,
  });
  return handleResponse(res);
}

export async function apiPatch(path, body, options = {}) {
  const url = `${apiBaseUrl}${path}`;
  const { headers: optionHeaders = {}, ...restOptions } = options;
  const multipart = isFormDataBody(body);
  const hdr = multipart
    ? buildApiHeaders(path, 'PATCH', { ...optionHeaders })
    : buildApiHeaders(path, 'PATCH', {
        'Content-Type': 'application/json',
        ...optionHeaders,
      });
  if (multipart) {
    delete hdr['Content-Type'];
    delete hdr['content-type'];
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: hdr,
    body: multipart ? body : JSON.stringify(body),
    ...restOptions,
  });
  return handleResponse(res);
}

export async function apiDelete(path, options = {}) {
  const url = `${apiBaseUrl}${path}`;
  const { headers: optionHeaders = {}, ...restOptions } = options;
  const hdr = buildApiHeaders(path, 'DELETE', optionHeaders);

  const res = await fetch(url, {
    method: 'DELETE',
    ...restOptions,
    headers: hdr,
  });
  return handleResponse(res);
}
