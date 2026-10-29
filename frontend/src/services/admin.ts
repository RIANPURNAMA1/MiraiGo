import { api } from './api';
import {
  AdminDashboardData,
  AdminPackage,
  AdminPackageInput,
  AdminQuestionInput,
  AdminSubscriberItem,
  AdminUserItem,
  ApiSuccess,
  Category,
  KotobaCategory,
  KotobaItem,
  KotobaInput,
  KotobaTopic,
  PaginatedResponse,
  PackageSection,
  Question,
} from '@/types';

export interface AdminPackageFilters {
  search?: string;
  status?: string;
  page?: number;
}

export interface AdminUserFilters {
  search?: string;
  status?: string;
  page?: number;
}

export async function fetchAdminDashboard() {
  const res = await api.get<ApiSuccess<AdminDashboardData>>('/admin/dashboard');
  return res.data.data;
}

export async function fetchAdminPackages(filters: AdminPackageFilters = {}) {
  const res = await api.get<ApiSuccess<PaginatedResponse<AdminPackage>>>('/admin/packages', {
    params: filters,
  });
  return res.data.data;
}

export async function createAdminPackage(input: AdminPackageInput) {
  const res = await api.post<ApiSuccess<AdminPackage>>('/admin/packages', input);
  return res.data.data;
}

export async function updateAdminPackage(id: number, input: AdminPackageInput) {
  const res = await api.put<ApiSuccess<AdminPackage>>(`/admin/packages/${id}`, input);
  return res.data.data;
}

export async function toggleAdminPackage(id: number) {
  const res = await api.post<ApiSuccess<AdminPackage>>(`/admin/packages/${id}/toggle-publish`);
  return res.data.data;
}

export async function deleteAdminPackage(id: number) {
  const res = await api.delete<ApiSuccess<null>>(`/admin/packages/${id}`);
  return res.data;
}

export async function fetchAdminSections(packageId: number) {
  const res = await api.get<ApiSuccess<PackageSection[]>>(`/admin/packages/${packageId}/sections`);
  return res.data.data;
}

export async function createAdminSection(packageId: number, input: { name: string; description?: string; duration_minutes?: number }) {
  const res = await api.post<ApiSuccess<PackageSection>>(`/admin/packages/${packageId}/sections`, input);
  return res.data.data;
}

export async function updateAdminSection(id: number, input: { name?: string; description?: string; duration_minutes?: number }) {
  const res = await api.put<ApiSuccess<PackageSection>>(`/admin/sections/${id}`, input);
  return res.data.data;
}

export async function deleteAdminSection(id: number) {
  const res = await api.delete<ApiSuccess<null>>(`/admin/sections/${id}`);
  return res.data;
}

export async function fetchSectionQuestions(sectionId: number) {
  const res = await api.get<ApiSuccess<Question[]>>(`/admin/sections/${sectionId}/questions`);
  return res.data.data;
}

export async function createAdminQuestion(input: AdminQuestionInput) {
  const res = await api.post<ApiSuccess<Question>>('/admin/questions', input);
  return res.data.data;
}

export async function updateAdminQuestion(id: number, input: Partial<AdminQuestionInput>) {
  const res = await api.put<ApiSuccess<Question>>(`/admin/questions/${id}`, input);
  return res.data.data;
}

export async function deleteAdminQuestion(id: number) {
  const res = await api.delete<ApiSuccess<null>>(`/admin/questions/${id}`);
  return res.data;
}

export async function uploadQuestionImage(questionId: number, file: File) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await api.post<ApiSuccess<{ image: string }>>(`/admin/questions/${questionId}/image`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function uploadQuestionAudio(questionId: number, file: File) {
  const fd = new FormData();
  fd.append('audio', file);
  const res = await api.post<ApiSuccess<{ audio: string }>>(`/admin/questions/${questionId}/audio`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function fetchAdminUsers(filters: AdminUserFilters = {}) {
  const res = await api.get<ApiSuccess<PaginatedResponse<AdminUserItem>>>('/admin/users', {
    params: filters,
  });
  return res.data.data;
}

export async function updateAdminUserStatus(id: number, status: 'active' | 'suspended') {
  const res = await api.put<ApiSuccess<AdminUserItem>>(`/admin/users/${id}/status`, { status });
  return res.data.data;
}

export interface AdminSubscriberFilters {
  search?: string;
  status?: string;
  page?: number;
}

export async function fetchAdminSubscribers(filters: AdminSubscriberFilters = {}) {
  const res = await api.get<ApiSuccess<PaginatedResponse<AdminSubscriberItem>>>('/admin/subscribers', {
    params: filters,
  });
  return res.data.data;
}

// ── Payment Approval ──

export interface AdminPaymentItem {
  id: number;
  type?: 'package' | 'module-premium';
  transaction: {
    id: number;
    invoice_number: string;
    total_amount: number;
    status: string;
    user: { id: number; name: string; email: string } | null;
    items: Array<{ name: string; price: number }>;
  };
  proof_image: string | null;
  notes: string | null;
  admin_notes: string | null;
  status: string;
  reviewed_at: string | null;
  created_at: string | null;
}

export async function fetchAdminPayments() {
  const res = await api.get<ApiSuccess<{ payments: AdminPaymentItem[]; total: number }>>('/admin/payments');
  return res.data.data;
}

export async function fetchAdminPendingPaymentCount() {
  const res = await api.get<ApiSuccess<{ count: number }>>('/admin/payments/pending-count');
  return res.data.data.count;
}

export async function approvePayment(id: number, adminNotes?: string) {
  const res = await api.post<ApiSuccess<Record<string, never>>>(`/admin/payments/${id}/approve`, { admin_notes: adminNotes });
  return res.data;
}

export async function rejectPayment(id: number, adminNotes: string) {
  const res = await api.post<ApiSuccess<Record<string, never>>>(`/admin/payments/${id}/reject`, { admin_notes: adminNotes });
  return res.data;
}

// ── Voucher Management ──

export interface AdminVoucherItem {
  id: number;
  code: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  min_purchase: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string | null;
}

export async function fetchAdminVouchers() {
  const res = await api.get<ApiSuccess<{ vouchers: AdminVoucherItem[]; total: number }>>('/admin/vouchers');
  return res.data.data;
}

export async function createAdminVoucher(input: {
  code: string; description?: string; type: 'percentage' | 'fixed'; value: number;
  min_purchase?: number; max_discount?: number; usage_limit?: number;
  starts_at?: string; expires_at?: string; is_active?: boolean;
}) {
  const res = await api.post<ApiSuccess<AdminVoucherItem>>('/admin/vouchers', input);
  return res.data.data;
}

export async function updateAdminVoucher(id: number, input: Partial<{
  description: string; type: 'percentage' | 'fixed'; value: number;
  min_purchase: number; max_discount: number; usage_limit: number;
  starts_at: string; expires_at: string; is_active: boolean;
}>) {
  const res = await api.put<ApiSuccess<AdminVoucherItem>>(`/admin/vouchers/${id}`, input);
  return res.data.data;
}

export async function deleteAdminVoucher(id: number) {
  const res = await api.delete<ApiSuccess<Record<string, never>>>(`/admin/vouchers/${id}`);
  return res.data;
}

// ── Category Management ──

export interface AdminCategoryFilters {
  search?: string;
  page?: number;
  per_page?: number;
}

export async function fetchAdminCategories(filters: AdminCategoryFilters = {}) {
  const res = await api.get<ApiSuccess<PaginatedResponse<Category>>>('/admin/categories', {
    params: filters,
  });
  return res.data.data;
}

export async function createAdminCategory(input: { name: string; description?: string; features?: string[] | null; is_active?: boolean; is_premium?: boolean; is_popular?: boolean; price?: number; icon?: string | null; duration_days?: number | null }) {
  const res = await api.post<ApiSuccess<Category>>('/admin/categories', input);
  return res.data.data;
}

export async function updateAdminCategory(id: number, input: { name?: string; description?: string; features?: string[] | null; is_active?: boolean; is_premium?: boolean; is_popular?: boolean; price?: number; icon?: string | null; duration_days?: number | null }) {
  const res = await api.put<ApiSuccess<Category>>(`/admin/categories/${id}`, input);
  return res.data.data;
}

export async function deleteAdminCategory(id: number) {
  const res = await api.delete<ApiSuccess<null>>(`/admin/categories/${id}`);
  return res.data;
}

export async function toggleAdminCategory(id: number) {
  const res = await api.post<ApiSuccess<Category>>(`/admin/categories/${id}/toggle-active`);
  return res.data.data;
}

// ── Module Management ──

export interface AdminModuleItem {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  file_url: string | null;
  external_url: string | null;
  is_premium: boolean;
  price: number;
  status: 'draft' | 'published';
  published_at: string | null;
  category_id: number | null;
  category?: { id: number; name: string } | null;
}

export interface AdminModuleFilters {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
}

export async function fetchAdminModules(filters: AdminModuleFilters = {}) {
  const res = await api.get<ApiSuccess<PaginatedResponse<AdminModuleItem>>>('/admin/modules', {
    params: filters,
  });
  return res.data.data;
}

export async function createAdminModule(fd: FormData) {
  const res = await api.post<ApiSuccess<AdminModuleItem>>('/admin/modules', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function updateAdminModule(id: number, fd: FormData) {
  fd.append('_method', 'PUT');
  const res = await api.post<ApiSuccess<AdminModuleItem>>(`/admin/modules/${id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function deleteAdminModule(id: number) {
  const res = await api.delete<ApiSuccess<null>>(`/admin/modules/${id}`);
  return res.data;
}

export async function toggleAdminModule(id: number) {
  const res = await api.post<ApiSuccess<AdminModuleItem>>(`/admin/modules/${id}/toggle-publish`);
  return res.data.data;
}

// ── Kotoba Categories ──────────────────────────────────────────────
export async function fetchAdminKotobaCategories() {
  const res = await api.get<ApiSuccess<KotobaCategory[]>>('/admin/kotoba-categories');
  return res.data.data;
}

export async function createAdminKotobaCategory(input: Partial<KotobaCategory>) {
  const res = await api.post<ApiSuccess<KotobaCategory>>('/admin/kotoba-categories', input);
  return res.data.data;
}

export async function updateAdminKotobaCategory(id: number, input: Partial<KotobaCategory>) {
  const res = await api.put<ApiSuccess<KotobaCategory>>(`/admin/kotoba-categories/${id}`, input);
  return res.data.data;
}

export async function deleteAdminKotobaCategory(id: number) {
  const res = await api.delete<ApiSuccess<null>>(`/admin/kotoba-categories/${id}`);
  return res.data;
}

export async function toggleAdminKotobaCategory(id: number) {
  const res = await api.post<ApiSuccess<KotobaCategory>>(`/admin/kotoba-categories/${id}/toggle-active`);
  return res.data.data;
}

// ── Kotoba Words ───────────────────────────────────────────────────
export async function fetchAdminKotoba(filters?: { category_id?: number; topic_id?: number; search?: string; page?: number; per_page?: number }) {
  const res = await api.get<ApiSuccess<PaginatedResponse<KotobaItem>>>('/admin/kotoba', { params: filters });
  return res.data.data;
}

export async function createAdminKotoba(input: KotobaInput) {
  const res = await api.post<ApiSuccess<KotobaItem>>('/admin/kotoba', input);
  return res.data.data;
}

export async function updateAdminKotoba(id: number, input: KotobaInput) {
  const res = await api.put<ApiSuccess<KotobaItem>>(`/admin/kotoba/${id}`, input);
  return res.data.data;
}

export async function deleteAdminKotoba(id: number) {
  const res = await api.delete<ApiSuccess<null>>(`/admin/kotoba/${id}`);
  return res.data;
}

export async function toggleAdminKotoba(id: number) {
  const res = await api.post<ApiSuccess<KotobaItem>>(`/admin/kotoba/${id}/toggle-active`);
  return res.data.data;
}

// ── Kotoba Topics ───────────────────────────────────────────────────
export async function fetchAdminKotobaTopics(filters?: { category_id?: number; search?: string; page?: number; per_page?: number }) {
  const res = await api.get<ApiSuccess<PaginatedResponse<KotobaTopic>>>('/admin/kotoba-topics', { params: filters });
  return res.data.data;
}

export async function syncKotobaTopicWords(topicId: number, kotobaIds: number[]) {
  const res = await api.post<ApiSuccess<KotobaTopic>>(`/admin/kotoba-topics/${topicId}/sync-words`, { kotoba_ids: kotobaIds });
  return res.data.data;
}

export async function createAdminKotobaTopic(input: Partial<KotobaTopic>) {
  const res = await api.post<ApiSuccess<KotobaTopic>>('/admin/kotoba-topics', input);
  return res.data.data;
}

// ── Module Premium Payment Approval ──

export async function approveModulePremiumPayment(id: number, adminNotes?: string) {
  const res = await api.post<ApiSuccess<Record<string, never>>>(`/admin/module-premium-payments/${id}/approve`, { admin_notes: adminNotes });
  return res.data;
}

export async function rejectModulePremiumPayment(id: number, adminNotes: string) {
  const res = await api.post<ApiSuccess<Record<string, never>>>(`/admin/module-premium-payments/${id}/reject`, { admin_notes: adminNotes });
  return res.data;
}