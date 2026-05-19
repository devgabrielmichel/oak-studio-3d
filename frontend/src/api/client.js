const API_BASE = import.meta.env.VITE_API_URL || '';

export function getToken() {
  return localStorage.getItem('oak_admin_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('oak_admin_token', token);
  else localStorage.removeItem('oak_admin_token');
}

export async function api(path, options = {}) {
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || 'Erro na requisição.');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const publicApi = {
  privacy: () => api('/api/privacy'),
  submit: (formData) =>
    fetch(`${API_BASE}/api/submissions`, { method: 'POST', body: formData }).then(
      async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Falha no envio.');
        return data;
      }
    ),
};

export const adminApi = {
  login: (email, password) =>
    api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => api('/api/admin/me'),
  kanban: () => api('/api/admin/kanban'),
  updateStatus: (id, status) =>
    api(`/api/admin/submissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  clients: () => api('/api/admin/clients'),
  downloadFile: async (id, filename) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/admin/submissions/${id}/file`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Erro ao baixar arquivo.');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
