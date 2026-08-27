import { api } from './api';
import type { ApiSuccess, Category, PaginatedResponse, Package } from '@/types';

export interface PackageFilters {
  search?: string;
  category?: string;
  level?: string;
  page?: number;
  per_page?: number;
}

export async function fetchPackages(filters: PackageFilters = {}) {
  const res = await api.get<ApiSuccess<PaginatedResponse<Package>>>('/packages', {
    params: filters,
  });
  return res.data.data;
}

export async function fetchPackage(id: number | string) {
  const res = await api.get<ApiSuccess<Package>>(`/packages/${id}`);
  return res.data.data;
}

export async function fetchCategories() {
  const res = await api.get<ApiSuccess<Category[]>>('/categories');
  return res.data.data;
}
