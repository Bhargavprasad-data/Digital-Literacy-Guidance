const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  async getMe(token) {
    return this.request('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // App endpoints
  async getPrefs(token) {
    return this.request('/prefs', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async updatePrefs(token, prefs) {
    return this.request('/prefs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: prefs,
    });
  },

  async savePracticeLog(token, logData) {
    return this.request('/practice', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: logData,
    });
  },

  async getPracticeLogs(token) {
    return this.request('/practice', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  
  // Transactions endpoints
  async createTransaction(token, data) {
    return this.request('/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });
  },

  async getTransactions(token, limit = 50) {
    const q = new URLSearchParams({ limit: String(limit) }).toString();
    return this.request(`/transactions?${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default api;