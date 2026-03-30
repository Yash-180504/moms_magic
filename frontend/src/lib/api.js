const BASE = "https://momsmagic-production.up.railway.app/api";
const OPENINARY =
  import.meta.env.VITE_OPENINARY_BASE_URL ||
  "https://openinary.adityaraj.codes";

function getToken() {
  return localStorage.getItem("mm_token");
}

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw Object.assign(new Error(data.error || `HTTP ${res.status}`), {
      status: res.status,
      data,
    });
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const auth = {
  register: (body) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  updateMe: (body) =>
    request("/auth/me", { method: "PATCH", body: JSON.stringify(body) }),
};

// ── Providers ─────────────────────────────────────────────────────────────
export const providers = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/providers${qs ? `?${qs}` : ""}`);
  },
  get: (id) => request(`/providers/${id}`),
  myProfile: () => request("/providers/me/profile"),
  create: (body) =>
    request("/providers", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/providers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) => request(`/providers/${id}`, { method: "DELETE" }),
};

// ── Menu ─────────────────────────────────────────────────────────────────
export const menu = {
  list: (providerId) => request(`/providers/${providerId}/menu`),
  add: (providerId, body) =>
    request(`/providers/${providerId}/menu`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id, body) =>
    request(`/menu/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) => request(`/menu/${id}`, { method: "DELETE" }),
};

// ── Orders ────────────────────────────────────────────────────────────────
export const orders = {
  list: () => request("/orders"),
  get: (id) => request(`/orders/${id}`),
  create: (body) =>
    request("/orders", { method: "POST", body: JSON.stringify(body) }),
  updateStatus: (id, status) =>
    request(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

// ── Upload ────────────────────────────────────────────────────────────────
export const upload = {
  file: async (file, folder = "moms-magic") => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);

    const res = await fetch(`${BASE}/upload`, {
      method: "POST",
      headers: { ...authHeaders() },
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data;
  },
  deleteAsset: (id) => request(`/upload/${id}`, { method: "DELETE" }),
};

// ── Openinary image URL builder ───────────────────────────────────────────
export function imgUrl(fileKey, transforms = "") {
  if (!fileKey) return null;
  return `${OPENINARY}/img/${transforms}/${fileKey}`;
}
