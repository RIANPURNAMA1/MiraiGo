import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/services/api';
import {
  createAdminPackage,
  deleteAdminPackage,
  fetchAdminPackages,
  toggleAdminPackage,
  updateAdminPackage,
} from '@/services/admin';
import { fetchCategories } from '@/services/packages';
import type { AdminPackage, AdminPackageInput, Category } from '@/types';

const emptyForm: AdminPackageInput = {
  name: '',
  category: '',
  level: '',
  description: '',
  duration_minutes: 30,
  price: 0,
  is_premium: false,
  status: 'draft',
};

export default function AdminPackages() {
  const { showToast } = useToast();
  const [items, setItems] = useState<AdminPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<AdminPackageInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const load = useCallback(() => {
    setIsLoading(true);
    fetchAdminPackages({ search: search || undefined, page })
      .then((res) => {
        setItems(res.items);
        setLastPage(res.meta.last_page);
        setTotal(res.meta.total ?? res.items.length);
      })
      .finally(() => setIsLoading(false));
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: AdminPackage) {
    setEditId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      level: p.level,
      description: p.description,
      duration_minutes: p.duration_minutes,
      price: p.price,
      is_premium: p.is_premium,
      status: p.status as 'draft' | 'published',
    });
    setModalOpen(true);
  }

  async function handleToggle(p: AdminPackage) {
    try {
      await toggleAdminPackage(p.id);
      showToast('Status paket diperbarui.', 'success');
      load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal mengubah status.'), 'error');
    }
  }

  async function handleDelete(p: AdminPackage) {
    if (!window.confirm(`Hapus paket "${p.name}"?`)) return;
    try {
      await deleteAdminPackage(p.id);
      showToast('Paket dihapus.', 'success');
      load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal menghapus paket.'), 'error');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name) {
      showToast('Nama paket wajib diisi.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await updateAdminPackage(editId, form);
      } else {
        await createAdminPackage(form);
      }
      showToast(editId ? 'Paket diperbarui.' : 'Paket dibuat.', 'success');
      setModalOpen(false);
      setPage(1);
      load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal menyimpan paket.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Kelola Paket</h2>
          <p className="text-sm text-gray-500">Atur paket latihan yang tersedia di platform.</p>
        </div>
        <Button onClick={openCreate}>+ Paket Baru</Button>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Cari paket..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <LoadingState />
          </div>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Belum ada paket." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">Nama</th>
                    <th className="px-5 py-3 font-medium">Kategori</th>
                    <th className="px-5 py-3 font-medium">Level</th>
                    <th className="px-5 py-3 font-medium">Section</th>
                    <th className="px-5 py-3 font-medium">Berbayar</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {items.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-400">{(page - 1) * 15 + i + 1}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-5 py-3 text-gray-700">{p.category ?? '-'}</td>
                      <td className="px-5 py-3 text-gray-700">{p.level ?? '-'}</td>
                      <td className="px-5 py-3 text-gray-700">{p.sections_count ?? 0}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {p.is_premium ? 'Premium' : 'Gratis'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={p.status === 'published' ? 'success' : 'warning'}>{p.status}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleToggle(p)}>
                            {p.status === 'published' ? 'Tarik' : 'Terbit'}
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(p)}>
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 px-5 py-3">
              <p className="text-xs text-gray-500">Total {total} paket</p>
              <Pagination currentPage={page} lastPage={lastPage} onChange={setPage} />
            </div>
          </>
        )}
      </Card>
      <SlidePanel isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Paket' : 'Paket Baru'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Kategori</label>
              <Select
                value={form.category ?? ''}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
            <Input label="Level" value={form.level ?? ''} onChange={(e) => setForm({ ...form, level: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Deskripsi</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Durasi (menit)"
              type="number"
              value={String(form.duration_minutes ?? 30)}
              onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Status</label>
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>
          </div>
          <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
            Harga & status premium paket diatur melalui kategori. Paket akan otomatis
            terkunci bila kategorinya premium.
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="w-full sm:w-auto">
              Batal
            </Button>
            <Button type="submit" isLoading={saving} className="w-full sm:w-auto">
              Simpan
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}