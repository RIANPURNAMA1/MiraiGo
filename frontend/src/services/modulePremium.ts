import { api } from './api';
import type { ApiSuccess } from '@/types';

export interface ModulePremiumSettingData {
  id?: number;
  premium_price: number;
  premium_description: string | null;
}

export interface ModulePremiumAccessData {
  has_access: boolean;
}

export interface ModulePremiumPaymentItem {
  id: number;
  amount: number;
  proof_image: string | null;
  notes: string | null;
  admin_notes: string | null;
  status: string;
  reviewed_at: string | null;
  created_at: string | null;
}

export async function fetchModulePremiumSettings() {
  const res = await api.get<ApiSuccess<ModulePremiumSettingData>>('/module-premium-settings');
  return res.data.data;
}

export async function fetchModulePremiumAccess() {
  const res = await api.get<ApiSuccess<ModulePremiumAccessData>>('/module-premium-access');
  return res.data.data;
}

export async function fetchModulePremiumPayments() {
  const res = await api.get<ApiSuccess<{ payments: ModulePremiumPaymentItem[] }>>('/module-premium-payments');
  return res.data.data;
}

export async function createModulePremiumPayment(input: { proof_image: File; notes?: string }) {
  const formData = new FormData();
  formData.append('proof_image', input.proof_image);
  if (input.notes) formData.append('notes', input.notes);

  const res = await api.post<ApiSuccess<{ id: number; amount: number; status: string }>>(
    '/module-premium-payments',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data;
}
