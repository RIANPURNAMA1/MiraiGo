import { api, initCsrfCookie } from './api';
import type { ApiSuccess, User } from '@/types';

export async function login(email: string, password: string) {
  await initCsrfCookie();
  const res = await api.post<ApiSuccess<{ user: User; token: string }>>('/auth/login', {
    email,
    password,
  });
  return res.data.data;
}

export async function register(input: { name: string; email: string; phone?: string; password: string; password_confirmation: string }) {
  await initCsrfCookie();
  const res = await api.post<ApiSuccess<{ user: User; token: string }>>('/auth/register', input);
  return res.data.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function forgotPassword(email: string) {
  await initCsrfCookie();
  const res = await api.post<ApiSuccess<Record<string, unknown>>>('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword(input: { token: string; email: string; password: string; password_confirmation: string }) {
  await initCsrfCookie();
  const res = await api.post<ApiSuccess<Record<string, unknown>>>('/auth/reset-password', input);
  return res.data;
}

export async function ssoLogin(token: string) {
  await initCsrfCookie();
  const res = await api.post<ApiSuccess<{ user: User; token: string }>>('/auth/sso-mendunia', { token });
  return res.data.data;
}

export async function fetchMe() {
  const res = await api.get<ApiSuccess<User>>('/me');
  return res.data.data;
}
