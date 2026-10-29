import axios, { type AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const ROOT_URL = API_URL.replace(/\/api\/?$/, '');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

export async function initCsrfCookie(): Promise<void> {
  await axios.get(`${ROOT_URL}/sanctum/csrf-cookie`, { withCredentials: true });
}

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('ssw_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (!safeMethods.includes((config.method ?? 'GET').toUpperCase())) {
    await initCsrfCookie();
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ssw_token');
      localStorage.removeItem('ssw_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a user-friendly message from an API error response,
 * falling back gracefully when the shape is unexpected.
 */
export function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return fallback;
}
