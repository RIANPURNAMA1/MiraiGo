import { api } from './api';
import type { ApiSuccess, ProgressData } from '@/types';

export async function fetchProgress() {
  const res = await api.get<ApiSuccess<ProgressData>>('/progress');
  return res.data.data;
}
