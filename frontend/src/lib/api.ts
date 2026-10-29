import axios from 'axios';
import { api } from '@/services/api';

export type { ApiError } from '@/types';

export function get<T>(url: string): Promise<T> {
  return api.get(url).then((r) => r.data.data);
}

export function post<T>(url: string, body?: any): Promise<T> {
  return api.post(url, body).then((r) => r.data.data);
}

export function put<T>(url: string, body?: any): Promise<T> {
  return api.put(url, body).then((r) => r.data.data);
}

export function firstError(error: any): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    if (data?.message) return data.message;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (Array.isArray(first) && first.length > 0) return String(first[0]);
    }
  }
  return error?.message || 'Terjadi kesalahan.';
}
