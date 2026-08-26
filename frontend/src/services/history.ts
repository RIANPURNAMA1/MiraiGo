import { api } from './api';
import type { ApiSuccess, PaginatedResponse, QuizAttempt } from '@/types';

export async function fetchHistory(page = 1) {
  const res = await api.get<ApiSuccess<PaginatedResponse<QuizAttempt>>>('/history', { params: { page } });
  return res.data.data;
}
