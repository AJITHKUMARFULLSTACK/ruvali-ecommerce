/**
 * Backend origin only (scheme + host, optional port). Must NOT include `/api`.
 * Requests use paths like `/api/products` → `${base}/api/products`.
 *
 * Production: REACT_APP_API_URL=https://ruvali.co.in
 */
const LIVE_API_DEFAULT = 'https://ruvali.co.in';
const LOCAL_API = 'http://localhost:5005';

function normalizeBase(url) {
  let u = (url || '').trim().replace(/\/$/, '');
  // If mis-set to …/api, strip so paths like `/api/foo` don't become `/api/api/foo`
  if (u.endsWith('/api')) {
    u = u.slice(0, -4).replace(/\/$/, '');
  }
  return u;
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

function responseBodyLooksLikeHtml(text) {
  if (typeof text !== 'string') return false;
  const t = text.trim();
  return t.startsWith('<') && (t.startsWith('<!') || /^<html[\s>]/i.test(t));
}

const HTML_INSTEAD_OF_JSON = 'Server returned HTML instead of JSON. Check API URL.';

async function handleResponse(res) {
  const raw = await res.text();
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  const declaredJson = ct.includes('application/json');

  let data;
  if (declaredJson) {
    if (responseBodyLooksLikeHtml(raw)) {
      const error = new Error(HTML_INSTEAD_OF_JSON);
      error.status = res.status;
      error.data = raw;
      throw error;
    }
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      const error = new Error('Server returned malformed JSON. Check API URL.');
      error.status = res.status;
      error.data = raw;
      throw error;
    }
  } else if (/^\s*[{\[]/.test(raw)) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  } else {
    data = raw;
  }

  if (!res.ok) {
    if (typeof data === 'string' && responseBodyLooksLikeHtml(data)) {
      const error = new Error(HTML_INSTEAD_OF_JSON);
      error.status = res.status;
      error.data = data;
      throw error;
    }
    const err = data && typeof data === 'object' ? data.error : null;
    const message =
      (err?.debug?.message || err?.message || data?.message) ||
      (typeof data === 'string' && data ? data : null) ||
      res.statusText ||
      'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  if (typeof data === 'string' && responseBodyLooksLikeHtml(data)) {
    const error = new Error(HTML_INSTEAD_OF_JSON);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

/** Admin auth: POST JSON { email, password } */
export const ADMIN_LOGIN_PATH = '/api/admin/login';

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
