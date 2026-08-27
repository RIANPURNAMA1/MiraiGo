import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/services/api';
import {
  fetchAdminKotobaCategories,
  fetchAdminKotoba,
  createAdminKotoba,
  updateAdminKotoba,
  deleteAdminKotoba,
  toggleAdminKotoba,
} from '@/services/admin';
import type { KotobaCategory, KotobaItem, KotobaInput } from '@/types';

const emptyForm: KotobaInput = {
  category_id: 0,
  japanese: '',
  reading: '',
  meaning: '',
  example_sentence: '',
  example_translation: '',
  order: 0,
  is_active: true,
};

export default function AdminKotoba() {
  const { showToast } = useToast();
  const [items, setItems] = useState<KotobaItem[]>([]);
  const [categories, setCategories] = useState<KotobaCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<KotobaInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminKotobaCategories().then(setCategories);
  }, []);

  const load = useCallback(() => {
    setIsLoading(true);
    fetchAdminKotoba({
      category_id: filterCategory || undefined,
      search: search || undefined,
      page,
      per_page: 20,
    })
      .then((res) => {
        setItems(res.items);
        setLastPage(res.meta.last_page);
        setTotal(res.meta.total ?? 0);
      })
      .finally(() => setIsLoading(false));
  }, [search, filterCategory, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  function openCreate() {
    setEditId(null);
    setForm({ ...emptyForm, category_id: filterCategory || (categories[0]?.id ?? 0) });
    setModalOpen(true);
  }

  function openEdit(item: KotobaItem) {
    setEditId(item.id);
    setForm({
      category_id: item.category_id,
      japanese: item.japanese,
      reading: item.reading ?? '',
      meaning: item.meaning,
      example_sentence: item.example_sentence ?? '',
      example_translation: item.example_translation ?? '',
      order: item.order,
      is_active: item.is_active,
    });
    setModalOpen(true);
  }

  async function handleToggle(id: number) {
    try {
      await toggleAdminKotoba(id);
      showToast('Status diperbarui.', 'success');
      load();
    } catch {
      showToast('Gagal memperbarui status.', 'error');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus kotoba ini?')) return;
    try {
      await deleteAdminKotoba(id);
      showToast('Kotoba dihapus.', 'success');
      load();
    } catch {
      showToast('Gagal menghapus kotoba.', 'error');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.japanese.trim() || !form.meaning.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await updateAdminKotoba(editId, form);
        showToast('Kotoba diperbarui.', 'success');
      } else {
        await createAdminKotoba(form);
        showToast('Kotoba dibuat.', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal menyimpan kotoba.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Kelola Kotoba</h2>
          <p className="text-sm text-gray-500">Buat dan atur soal kosakata (kotoba) berdasarkan kategori.</p>
        </div>
        <Button onClick={openCreate}>+ Tambah Kotoba</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input placeholder="Cari kosakata (jepang, pembacaan, arti)..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="sm:w-64">
          <select className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" value={filterCategory} onChange={(e) => { setFilterCategory(Number(e.target.value)); setPage(1); }}>
            <option value={0}>Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Memuat kotoba..." />
      ) : items.length === 0 ? (
        <EmptyState title="Belum ada kotoba." description="Tambahkan kosakata baru untuk kategori yang dipilih." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Jepang</th>
                  <th className="px-5 py-3">Reading</th>
                  <th className="px-5 py-3">Arti</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Contoh Kalimat</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500">{(page - 1) * 20 + i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{item.japanese}</td>
                    <td className="px-5 py-3 text-gray-500">{item.reading ?? '-'}</td>
                    <td className="px-5 py-3 text-gray-700">{item.meaning}</td>
                    <td className="px-5 py-3">
                      <Badge variant={item.category?.type === 'JFT' ? 'info' : 'brand'}>
                        {item.category?.name ?? '-'}
                      </Badge>
                    </td>
                    <td className="max-w-xs truncate px-5 py-3 text-gray-500">{item.example_sentence ?? '-'}</td>
                    <td className="px-5 py-3">
                      <Badge variant={item.is_active ? 'success' : 'warning'}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggle(item.id)} className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                          {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button onClick={() => openEdit(item)} className="rounded-md px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-5 py-3">
            <Pagination currentPage={page} lastPage={lastPage} onChange={setPage} />
            <p className="mt-2 text-center text-xs text-gray-400">Total: {total} kotoba</p>
          </div>
        </Card>
      )}

      <SlidePanel isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Kotoba' : 'Tambah Kotoba'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Kategori</label>
            <select className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })} required>
              <option value={0} disabled>Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Jepang (漢字)</label>
              <Input value={form.japanese} onChange={(e) => setForm({ ...form, japanese: e.target.value })} placeholder="例: バス停" required />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Reading (Reading)</label>
              <Input value={form.reading ?? ''} onChange={(e) => setForm({ ...form, reading: e.target.value })} placeholder="例: ばステイ" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Arti (Bahasa Indonesia)</label>
            <Input value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} placeholder="例: Halte bus" required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Contoh Kalimat (Jepang)</label>
            <textarea className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" rows={2} value={form.example_sentence ?? ''} onChange={(e) => setForm({ ...form, example_sentence: e.target.value })} placeholder="例: バス停はどこにありますか。" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Contoh Kalimat (Arti)</label>
            <textarea className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" rows={2} value={form.example_translation ?? ''} onChange={(e) => setForm({ ...form, example_translation: e.target.value })} placeholder="例: Di mana halte busnya?" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Urutan</label>
              <Input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
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
