import { api } from './api';
import type { ApiSuccess, SubscriptionData } from '@/types';

export async function fetchSubscription() {
  const res = await api.get<ApiSuccess<SubscriptionData>>('/subscription');
  return res.data.data;
}
