// Same-origin API — no env var needed, works in dev and production
const BASE = '/api'
const OPENINARY = process.env.NEXT_PUBLIC_OPENINARY_BASE_URL || 'https://openinary.adityaraj.codes'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('mm_token')
}

function authHeaders() {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { status: res.status, data })
  return data
}

export const auth = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  updateMe: (body) => request('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),
}

export const providers = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/providers${q ? `?${q}` : ''}`)
  },
  get: (id) => request(`/providers/${id}`),
  myProfile: () => request('/providers/me/profile'),
  create: (body) => request('/providers', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/providers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/providers/${id}`, { method: 'DELETE' }),
}

export const menu = {
  list: (providerId) => request(`/providers/${providerId}/menu`),
  add: (providerId, body) => request(`/providers/${providerId}/menu`, { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/menu/${id}`, { method: 'DELETE' }),
}

export const orders = {
  list: () => request('/orders'),
  get: (id) => request(`/orders/${id}`),
  create: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
}

export const upload = {
  file: async (file, folder = 'moms-magic') => {
    const form = new FormData()
    form.append('file', file)
    form.append('folder', folder)
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  },
  deleteAsset: (id) => request(`/upload/${id}`, { method: 'DELETE' }),
}

export function imgUrl(fileKey, transforms = '') {
  if (!fileKey) return null
  if (fileKey.startsWith('http')) return fileKey
  return `${OPENINARY}/file/${transforms ? transforms + '/' : ''}${fileKey}`
}
