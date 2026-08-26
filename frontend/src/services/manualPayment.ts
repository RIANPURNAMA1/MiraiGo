import { api } from './api';
import type { ApiSuccess } from '@/types';

export interface ManualPaymentItem {
  id: number;
  transaction: {
    id: number;
    invoice_number: string;
    total_amount: number;
    status: string;
    items: Array<{ name: string; price: number }>;
  };
  proof_image: string | null;
  notes: string | null;
  admin_notes: string | null;
  status: string;
  reviewed_at: string | null;
  created_at: string | null;
}

export interface VoucherData {
  code: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  discount: number;
}

export async function fetchManualPayments() {
  const res = await api.get<ApiSuccess<{ payments: ManualPaymentItem[] }>>('/manual-payments');
  return res.data.data;
}

export async function validateVoucher(code: string, packageId: number) {
  const res = await api.post<ApiSuccess<VoucherData>>('/vouchers/validate', { code, package_id: packageId });
  return res.data.data;
}

export async function createManualPayment(input: { package_id: number; proof_image: File; notes?: string; voucher_code?: string }) {
  const formData = new FormData();
  formData.append('package_id', String(input.package_id));
  formData.append('proof_image', input.proof_image);
  if (input.notes) formData.append('notes', input.notes);
  if (input.voucher_code) formData.append('voucher_code', input.voucher_code);

  const res = await api.post<ApiSuccess<{ id: number; invoice_number: string; original_price: number; discount: number; total_amount: number; package_name: string; status: string }>>(
    '/manual-payments',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data;
}
