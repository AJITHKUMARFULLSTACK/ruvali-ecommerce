// In development, use empty string so requests go through CRA proxy to backend.
// In production, use full backend URL.
const DEFAULT_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? ''
    : (process.env.REACT_APP_API_URL || 'http://localhost:5005');

export const apiBaseUrl = DEFAULT_BASE_URL;

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const err = data?.error;
    const message = (err?.debug?.message || err?.message || data?.message) || res.statusText || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function apiGet(path, options = {}) {
  const url = `${apiBaseUrl}${path}`;
  const res = await fetch(url, {
    method: 'GET',
    ...options,
  });
  return handleResponse(res);
}

export async function apiPost(path, body, options = {}) {
  const url = `${apiBaseUrl}${path}`;
  const { headers, ...restOptions } = options;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: JSON.stringify(body),
    ...restOptions,
  });
  return handleResponse(res);
}

export async function apiDelete(path, options = {}) {
  const url = `${apiBaseUrl}${path}`;
  const res = await fetch(url, {
    method: 'DELETE',
    ...options,
  });
  return handleResponse(res);
}

export async function apiPut(path, body, options = {}) {
  const url = `${apiBaseUrl}${path}`;
  const { headers, ...restOptions } = options;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: JSON.stringify(body),
    ...restOptions,
  });
  return handleResponse(res);
}

