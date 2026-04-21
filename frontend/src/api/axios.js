import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('basera_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('basera_token');
      localStorage.removeItem('basera_user');
      // Notify the app so AuthContext can react and Toast can be triggered
      try { window.dispatchEvent(new CustomEvent('basera:auth-expired')); } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;
