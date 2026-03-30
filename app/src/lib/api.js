import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = "https://momsmagic-production.up.railway.app/api";

async function getToken() {
  return await AsyncStorage.getItem("mm_token");
}

function authHeaders() {
  return (async () => {
    const t = await getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  })();
}

async function request(path, options = {}) {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

const auth = {
  async login(email, password) {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      await AsyncStorage.setItem("mm_token", res.token);
      await AsyncStorage.setItem("mm_user", JSON.stringify(res.user));
    }
    return res;
  },

  async register(email, password, name, role = "customer") {
    const res = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, role }),
    });
    if (res.token) {
      await AsyncStorage.setItem("mm_token", res.token);
      await AsyncStorage.setItem("mm_user", JSON.stringify(res.user));
    }
    return res;
  },

  async me() {
    return await request("/auth/me");
  },

  async logout() {
    await AsyncStorage.removeItem("mm_token");
    await AsyncStorage.removeItem("mm_user");
  },
};

const providers = {
  async list() {
    return await request("/providers");
  },

  async get(id) {
    return await request(`/providers/${id}`);
  },
};

const menu = {
  async list(providerId) {
    return await request(`/menu?provider=${providerId}`);
  },
};

const orders = {
  async create(items, deliveryAddress) {
    return await request("/orders", {
      method: "POST",
      body: JSON.stringify({ items, deliveryAddress }),
    });
  },

  async list() {
    return await request("/orders");
  },

  async get(id) {
    return await request(`/orders/${id}`);
  },
};

export const api = { auth, providers, menu, orders };
