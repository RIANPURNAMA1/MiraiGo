import { api } from './api';
import type { ApiSuccess, KotobaCategory, KotobaTopic } from '@/types';

export async function fetchKotobaCategories() {
  const res = await api.get<ApiSuccess<KotobaCategory[]>>('/kotoba-categories');
  return res.data.data;
}

export async function fetchKotobaTopics(categoryId: number) {
  const res = await api.get<ApiSuccess<KotobaTopic[]>>('/kotoba-topics', { params: { category_id: categoryId } });
  return res.data.data;
}
