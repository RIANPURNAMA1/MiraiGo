import { api } from './api';
import type { ApiSuccess, DashboardData } from '@/types';

export async function fetchDashboard() {
  const res = await api.get<ApiSuccess<DashboardData>>('/dashboard');
  return res.data.data;
}
