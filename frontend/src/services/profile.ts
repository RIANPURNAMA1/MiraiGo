import { api } from './api';
import type { ApiSuccess, User } from '@/types';

export async function updateProfile(payload: Partial<Pick<User, 'name' | 'phone' | 'email'>>) {
  const res = await api.put<ApiSuccess<User>>('/profile', payload);
  return res.data.data;
}

export async function updatePassword(payload: { current_password: string; password: string; password_confirmation: string }) {
  const res = await api.put<ApiSuccess<unknown>>('/profile/password', payload);
  return res.data.data;
}
