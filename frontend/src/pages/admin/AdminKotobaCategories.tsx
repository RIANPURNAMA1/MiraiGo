import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/services/api';
import {
  fetchAdminKotobaCategories,
  createAdminKotobaCategory,
  updateAdminKotobaCategory,
  deleteAdminKotobaCategory,
  toggleAdminKotobaCategory,
} from '@/services/admin';
import type { KotobaCategory } from '@/types';

interface KotobaCategoryForm {
  name: string;
  description: string;
  type: 'JFT' | 'SSW';
  total_packages: number;
  icon: string;
  color: string;
  order: number;
  is_active: boolean;
}

const emptyForm: KotobaCategoryForm = {
  name: '',
  description: '',
  type: 'JFT',
  total_packages: 0,
  icon: 'book-open',
  color: 'text-gray-700',
  order: 0,
  is_active: true,
};

const iconOptions = [
  { value: 'book-open', label: 'BookOpen' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'utensils', label: 'Utensils' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'fish', label: 'Fish' },
  { value: 'building-2', label: 'Building2' },
];

const colorOptions = [
  { value: 'text-blue-700', label: 'Biru' },
  { value: 'text-rose-700', label: 'Merah Muda' },
  { value: 'text-amber-700', label: 'Kuning' },
  { value: 'text-emerald-700', label: 'Hijau' },
  { value: 'text-teal-700', label: 'Toska' },
  { value: 'text-indigo-700', label: 'Indigo' },
  { value: 'text-gray-700', label: 'Abu-abu' },
];

export default function AdminKotobaCategories() {
  const { showToast } = useToast();
  const [items, setItems] = useState<KotobaCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<KotobaCategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    fetchAdminKotobaCategories()
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(cat: KotobaCategory) {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description ?? '',
      type: cat.type,
      total_packages: cat.total_packages,
      icon: cat.icon ?? 'book-open',
      color: cat.color,
      order: cat.order,
      is_active: cat.is_active,
    });
    setModalOpen(true);
  }

  async function handleToggle(id: number) {
    try {
      await toggleAdminKotobaCategory(id);
      showToast('Status diperbarui.', 'success');
      load();
    } catch {
      showToast('Gagal memperbarui status.', 'error');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus kategori kotoba ini?')) return;
    try {
      await deleteAdminKotobaCategory(id);
      showToast('Kategori dihapus.', 'success');
      load();
    } catch {
      showToast('Gagal menghapus kategori.', 'error');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await updateAdminKotobaCategory(editId, form);
        showToast('Kategori diperbarui.', 'success');
      } else {
        await createAdminKotobaCategory(form);
        showToast('Kategori dibuat.', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal menyimpan kategori.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Kelola Kategori Kotoba</h2>
          <p className="text-sm text-gray-500">Buat dan atur kategori kosakata (kotoba) untuk JFT & SSW.</p>
        </div>
        <Button onClick={openCreate}>+ Tambah Kategori</Button>
      </div>

      {isLoading ? (
        <LoadingState label="Memuat kategori kotoba..." />
      ) : items.length === 0 ? (
        <EmptyState title="Belum ada kategori kotoba." description="Tambahkan kategori untuk mengelompokkan kosakata." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">Tipe</th>
                  <th className="px-5 py-3">Deskripsi</th>
                  <th className="px-5 py-3 text-center">Paket</th>
                  <th className="px-5 py-3 text-center">Kotoba</th>
                  <th className="px-5 py-3 text-center">Urutan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((cat, i) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-5 py-3">
                      <Badge variant={cat.type === 'JFT' ? 'info' : 'brand'}>{cat.type}</Badge>
                    </td>
                    <td className="max-w-xs truncate px-5 py-3 text-gray-500">{cat.description ?? '-'}</td>
                    <td className="px-5 py-3 text-center">{cat.total_packages}</td>
                    <td className="px-5 py-3 text-center">{cat.total_words}</td>
                    <td className="px-5 py-3 text-center">{cat.order}</td>
                    <td className="px-5 py-3">
                      <Badge variant={cat.is_active ? 'success' : 'warning'}>
                        {cat.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggle(cat.id)} className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                          {cat.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button onClick={() => openEdit(cat)} className="rounded-md px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <SlidePanel isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Kategori Kotoba' : 'Tambah Kategori Kotoba'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Nama</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: JFT Basic" required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Deskripsi</label>
            <textarea className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi kategori..." />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Tipe</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'JFT' | 'SSW' })}>
                <option value="JFT">JFT</option>
                <option value="SSW">SSW</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Icon</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                {iconOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Warna</label>
              <select className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
                {colorOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Urutan</label>
              <Input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Total Paket</label>
              <Input type="number" min={0} value={form.total_packages} onChange={(e) => setForm({ ...form, total_packages: Number(e.target.value) })} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                Aktif
              </label>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="w-full sm:w-auto">Batal</Button>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? 'Menyimpan...' : editId ? 'Simpan' : 'Buat'}
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
