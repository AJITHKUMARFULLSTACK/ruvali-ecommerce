/**
 * Backend origin only (scheme + host, optional port). Must NOT include `/api`.
 * Requests use paths like `/api/products` → `${API_BASE_URL}/api/products`.
 *
 * Production default (no REACT_APP_API_URL): backend API subdomain.
 */
const DEFAULT_PRODUCTION_API = 'https://api.ruvali.co.in';
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

  return normalizeBase(useLocal ? LOCAL_API : DEFAULT_PRODUCTION_API);
}

/** Absolute backend origin used for `fetch(`${API_BASE_URL}${path}`)`. */
export const API_BASE_URL = getApiBaseUrl();
export const apiBaseUrl = API_BASE_URL;

/** localStorage key for admin JWT (must match AdminLogin and ProtectedRoute). */
export const ADMIN_TOKEN_KEY = 'adminToken';

export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

/**
 * Clear admin session and send user to /admin/login with a one-shot notice.
 * Safe to call from apiClient (no React router needed).
 */
export function invalidateAdminSessionAndRedirect() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem('admin');
    localStorage.removeItem('adminStore');
  } catch {
    /* ignore */
  }
  if (typeof window === 'undefined') return;
  const p = window.location.pathname || '';
  if (p.startsWith('/admin') && p !== '/admin/login') {
    try {
      sessionStorage.setItem('admin_session_notice', 'Session expired');
    } catch {
      /* ignore */
    }
    window.location.replace('/admin/login');
  }
}


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

  /** All other /api/admin/* routes require Bearer when a token exists. */
  if (p.startsWith('/api/admin/')) {
    return Boolean(window.localStorage.getItem(ADMIN_TOKEN_KEY));
  }

  /** Legacy/other admin-only calls outside /api/admin/ (unlikely) — attach if logged in */
  return Boolean(window.localStorage.getItem(ADMIN_TOKEN_KEY));
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

  const pathForJwt = typeof path === 'string' ? path.split('?')[0] : path;
  const attach = shouldAttachAdminJwt(path, method);
  if (attach && !headers.Authorization && !headers.authorization) {
    const token = getAdminToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
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
  if (/^<!DOCTYPE/i.test(t)) return true;
  return t.startsWith('<') && (t.startsWith('<!') || /^<html[\s>]/i.test(t));
}

const HTML_WRONG_BACKEND = 'API is returning HTML. Wrong backend URL.';

async function handleResponse(res, meta = {}) {
  const requestPath = meta.requestPath;
  const raw = await res.text();

  const pathOnly = typeof requestPath === 'string' ? requestPath.split('?')[0] : '';
  const admin401 =
    !res.ok &&
    res.status === 401 &&
    pathOnly.startsWith('/api/admin') &&
    pathOnly !== '/api/admin/login';

  if (admin401) {
    invalidateAdminSessionAndRedirect();
    const err401 = new Error('Session expired');
    err401.status = 401;
    throw err401;
  }

  if (responseBodyLooksLikeHtml(raw)) {
    const error = new Error(HTML_WRONG_BACKEND);
    error.status = res.status;
    error.data = raw;
    throw error;
  }
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  const declaredJson = ct.includes('application/json');

  let data;
  if (declaredJson) {
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
      const error = new Error(HTML_WRONG_BACKEND);
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
    const error = new Error(HTML_WRONG_BACKEND);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

/** Admin auth: POST JSON { email, password } */
export const ADMIN_LOGIN_PATH = '/api/admin/login';

export function logApiCall(path) {
  // eslint-disable-next-line no-console -- intentional: trace outbound API URLs
  console.log('API CALL:', `${getApiBaseUrl()}${path}`);
}

/**
 * Backend fetch returning the raw Response (streaming bodies, blobs).
 * Logs and merges `buildApiHeaders` like apiGet/apiPost — does NOT run handleResponse.
 */
export async function fetchApi(pathWithQuery, init = {}) {
  const pathNorm = pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`;
  const pathOnly = pathNorm.split('?')[0];
  logApiCall(pathNorm);
  const method = (init.method || 'GET').toUpperCase();
  const url = `${getApiBaseUrl()}${pathNorm}`;
  const { headers: hdrExtra, ...rest } = init;
  const merged =
    hdrExtra && typeof hdrExtra === 'object' && !(hdrExtra instanceof Headers)
      ? buildApiHeaders(pathNorm, method, { ...hdrExtra })
      : buildApiHeaders(pathNorm, method);

  let finalHeaders = merged;
  const t = getAdminToken();
  if (
    pathOnly.startsWith('/api/admin/') &&
    pathOnly !== '/api/admin/login' &&
    t &&
    !(merged.Authorization || merged.authorization)
  ) {
    finalHeaders = { ...merged, Authorization: `Bearer ${t}` };
  }

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    method,
  });
  if (res.status === 401 && pathOnly.startsWith('/api/admin') && pathOnly !== '/api/admin/login') {
    invalidateAdminSessionAndRedirect();
  }
  return res;
}

export async function apiGet(path, options = {}) {
  const { headers: optionHeaders = {}, ...restOptions } = options;
  logApiCall(path);
  const url = `${getApiBaseUrl()}${path}`;
  const hdr = buildApiHeaders(path, 'GET', optionHeaders);

  const res = await fetch(url, {
    ...restOptions,
    headers: hdr,
  });
  return handleResponse(res, { requestPath: path });
}

function isFormDataBody(body) {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

export async function apiPost(path, body, options = {}) {
  logApiCall(path);
  const url = `${getApiBaseUrl()}${path}`;
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
  return handleResponse(res, { requestPath: path });
}

export async function apiPut(path, body, options = {}) {
  logApiCall(path);
  const url = `${getApiBaseUrl()}${path}`;
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
  return handleResponse(res, { requestPath: path });
}

export async function apiPatch(path, body, options = {}) {
  logApiCall(path);
  const url = `${getApiBaseUrl()}${path}`;
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
  return handleResponse(res, { requestPath: path });
}

export async function apiDelete(path, options = {}) {
  logApiCall(path);
  const url = `${getApiBaseUrl()}${path}`;
  const { headers: optionHeaders = {}, ...restOptions } = options;
  const hdr = buildApiHeaders(path, 'DELETE', optionHeaders);

  const res = await fetch(url, {
    method: 'DELETE',
    ...restOptions,
    headers: hdr,
  });
  return handleResponse(res, { requestPath: path });
}
