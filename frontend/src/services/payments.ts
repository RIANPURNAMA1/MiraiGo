import { api } from './api';
import type { ApiSuccess, PaymentsData } from '@/types';

export async function fetchPayments() {
  const res = await api.get<ApiSuccess<PaymentsData>>('/payments');
  return res.data.data;
}
