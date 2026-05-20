/**
 * api.js — Central Axios instance for all UstadG API calls.
 *
 * Features:
 *  • Automatically attaches Bearer token from SecureStore
 *  • Logs 401 errors and clears stale token
 *  • 30-second timeout for all requests
 */
import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import { getToken, clearAll } from '../utils/tokenStorage';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

console.log('[API] Connecting to:', API_BASE_URL);

// ── Request Interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — handle 401 globally ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear credentials
      // The AuthContext will detect missing token on next render and redirect to Login
      await clearAll();
      console.warn('[API] 401 Unauthorized — token cleared. User will be redirected to Login.');
    }
    return Promise.reject(error);
  }
);

export default api;
