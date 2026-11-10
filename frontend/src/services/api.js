import axios from 'axios';
import { clearAuth } from './auth';

const rawUrl = import.meta.env.VITE_API_URL || '';
const baseURL = rawUrl ? (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`) : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  // Send the httpOnly session cookie with every request.
  withCredentials: true,
  timeout: 30000
});

// Handle 401 (expired or revoked session) automatically
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const requestUrl = err.config?.url || '';
    const isAuthAttempt = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (!err.response) {
      err.friendlyMessage = 'The server is starting or temporarily unavailable. Please try again in a minute.';
    }

    if (err.response?.status === 401 && !isAuthAttempt) {
      clearAuth();
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // Clear local state even if the network call fails.
  }
  clearAuth();
}

export function getApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.message || err?.friendlyMessage || fallback;
}

export default api;
