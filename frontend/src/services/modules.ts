import { api } from './api';
import type { ApiSuccess, LearningModule, ModulePurchase, PaginatedResponse } from '@/types';

export async function fetchModules(page = 1) {
  const res = await api.get<ApiSuccess<PaginatedResponse<LearningModule>>>('/modules', { params: { page } });
  return res.data.data;
}

export async function purchaseModule(moduleId: number) {
  const res = await api.post<ApiSuccess<ModulePurchase>>('/modules/purchase', { module_id: moduleId });
  return res.data.data;
}

export async function fetchModulePurchases() {
  const res = await api.get<ApiSuccess<ModulePurchase[]>>('/module-purchases');
  return res.data.data;
}
