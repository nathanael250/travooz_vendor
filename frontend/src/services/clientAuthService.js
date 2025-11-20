import apiClient from './apiClient';

const CLIENT_TOKEN_KEY = 'client_token';
const CLIENT_USER_KEY = 'client_user';

const storeSession = ({ token, client }) => {
  if (token) {
    localStorage.setItem(CLIENT_TOKEN_KEY, token);
  }
  if (client) {
    localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(client));
  }
};

const clearSession = () => {
  localStorage.removeItem(CLIENT_TOKEN_KEY);
  localStorage.removeItem(CLIENT_USER_KEY);
};

const getStoredClient = () => {
  try {
    const raw = localStorage.getItem(CLIENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to parse stored client', error);
    return null;
  }
};

const clientAuthService = {
  async registerClient(payload) {
    const response = await apiClient.post('/client/auth/register', payload);
    const data = response?.data?.data || {};
    if (data.token) {
      storeSession({ token: data.token, client: data.client });
    }
    return data;
  },

  async loginClient(payload) {
    const response = await apiClient.post('/client/auth/login', payload);
    const data = response?.data?.data || {};
    if (data.token) {
      storeSession({ token: data.token, client: data.client });
    }
    return data;
  },

  async getProfile() {
    const response = await apiClient.get('/client/auth/profile');
    const profile = response?.data?.data;
    if (profile) {
      localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(profile));
    }
    return profile;
  },

  logout() {
    clearSession();
  },

  getStoredClient
};

export default clientAuthService;

