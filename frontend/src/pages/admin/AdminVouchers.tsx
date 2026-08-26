import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { fetchAdminVouchers, createAdminVoucher, updateAdminVoucher, deleteAdminVoucher } from '@/services/admin';
import type { AdminVoucherItem } from '@/services/admin';
import { getErrorMessage } from '@/services/api';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<AdminVoucherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<AdminVoucherItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState<'percentage' | 'fixed'>('percentage');
  const [formValue, setFormValue] = useState('');
  const [formMinPurchase, setFormMinPurchase] = useState('');
  const [formMaxDiscount, setFormMaxDiscount] = useState('');
  const [formUsageLimit, setFormUsageLimit] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  function load() {
    setIsLoading(true);
    fetchAdminVouchers()
      .then((data) => setVouchers(data.vouchers))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setFormCode(''); setFormDesc(''); setFormType('percentage'); setFormValue('');
    setFormMinPurchase(''); setFormMaxDiscount(''); setFormUsageLimit('');
    setFormExpiresAt(''); setFormIsActive(true);
  }

  function openCreate() {
    resetForm();
    setShowCreateModal(true);
  }

  function openEdit(v: AdminVoucherItem) {
    setSelectedVoucher(v);
    setFormCode(v.code);
    setFormDesc(v.description ?? '');
    setFormType(v.type);
    setFormValue(String(v.value));
    setFormMinPurchase(String(v.min_purchase || ''));
    setFormMaxDiscount(String(v.max_discount ?? ''));
    setFormUsageLimit(String(v.usage_limit ?? ''));
    setFormExpiresAt(v.expires_at ? v.expires_at.split('T')[0] : '');
    setFormIsActive(v.is_active);
    setShowEditModal(true);
  }

  async function handleCreate() {
    setIsProcessing(true);
    setError(null);
    try {
      await createAdminVoucher({
        code: formCode, description: formDesc || undefined, type: formType,
        value: Number(formValue), min_purchase: Number(formMinPurchase) || 0,
        max_discount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
        usage_limit: formUsageLimit ? Number(formUsageLimit) : undefined,
        expires_at: formExpiresAt || undefined, is_active: formIsActive,
      });
      setSuccess('Voucher berhasil dibuat.');
      setShowCreateModal(false);
      load();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal membuat voucher.'));
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUpdate() {
    if (!selectedVoucher) return;
    setIsProcessing(true);
    setError(null);
    try {
      await updateAdminVoucher(selectedVoucher.id, {
        description: formDesc || undefined, type: formType,
        value: Number(formValue), min_purchase: Number(formMinPurchase) || 0,
        max_discount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
        usage_limit: formUsageLimit ? Number(formUsageLimit) : undefined,
        expires_at: formExpiresAt || undefined, is_active: formIsActive,
      });
      setSuccess('Voucher berhasil diperbarui.');
      setShowEditModal(false);
      load();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memperbarui voucher.'));
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDelete(v: AdminVoucherItem) {
    if (!confirm(`Hapus voucher ${v.code}?`)) return;
    setError(null);
    try {
      await deleteAdminVoucher(v.id);
      setSuccess('Voucher berhasil dihapus.');
      load();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menghapus voucher.'));
    }
  }

  if (isLoading) return <LoadingState label="Memuat voucher..." />;

  const voucherForm = (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Kode Voucher *</label>
        <input value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())} placeholder="CONTOHVOUCHER"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm uppercase tracking-wider outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Deskripsi</label>
        <input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Diskon spesial"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Tipe *</label>
          <select value={formType} onChange={(e) => setFormType(e.target.value as 'percentage' | 'fixed')}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
            <option value="percentage">Persen (%)</option>
            <option value="fixed">Nominal (Rp)</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Nilai *</label>
          <input type="number" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder={formType === 'percentage' ? '10' : '50000'}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Min. Pembelian</label>
          <input type="number" value={formMinPurchase} onChange={(e) => setFormMinPurchase(e.target.value)} placeholder="0"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Max. Diskon (persen)</label>
          <input type="number" value={formMaxDiscount} onChange={(e) => setFormMaxDiscount(e.target.value)} placeholder="Opsional"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Batas Penggunaan</label>
          <input type="number" value={formUsageLimit} onChange={(e) => setFormUsageLimit(e.target.value)} placeholder="Unlimited"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Berlaku Sampai</label>
          <input type="date" value={formExpiresAt} onChange={(e) => setFormExpiresAt(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Aktif</label>
        <button type="button" onClick={() => setFormIsActive(!formIsActive)}
          className={`relative h-6 w-11 rounded-full transition-colors ${formIsActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${formIsActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Voucher</h2>
          <p className="text-sm text-gray-500">Kelola kode voucher diskon untuk pengguna.</p>
        </div>
        <Button onClick={openCreate}>+ Buat Voucher</Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {vouchers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">Belum ada voucher.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Kode</th>
                <th className="px-4 py-3 font-medium text-gray-500">Tipe</th>
                <th className="px-4 py-3 font-medium text-gray-500">Nilai</th>
                <th className="px-4 py-3 font-medium text-gray-500">Penggunaan</th>
                <th className="px-4 py-3 font-medium text-gray-500">Berlaku Sampai</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vouchers.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3">
                    <p className="font-mono font-semibold text-gray-900">{v.code}</p>
                    {v.description && <p className="text-xs text-gray-500">{v.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{v.type === 'percentage' ? 'Persen' : 'Nominal'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {v.type === 'percentage' ? `${v.value}%` : formatCurrency(v.value)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {v.used_count}{v.usage_limit !== null ? `/${v.usage_limit}` : ''} kali
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(v.expires_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={v.is_active ? 'success' : 'default'}>
                      {v.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(v)}>Edit</Button>
                      <Button variant="danger" size="sm" className="!bg-red-500 !text-white" onClick={() => handleDelete(v)}>Hapus</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <SlidePanel isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Buat Voucher" footer={
        <>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Batal</Button>
          <Button onClick={handleCreate} isLoading={isProcessing}>Buat Voucher</Button>
        </>
      }>
        {voucherForm}
      </SlidePanel>

      {/* Edit Modal */}
      <SlidePanel isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Voucher" footer={
        <>
          <Button variant="outline" onClick={() => setShowEditModal(false)}>Batal</Button>
          <Button onClick={handleUpdate} isLoading={isProcessing}>Simpan</Button>
        </>
      }>
        {voucherForm}
      </SlidePanel>
    </div>
  );
}
