import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { useToast } from '@/components/ui/Toast';
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  toggleAdminCategory,
  updateAdminCategory,
} from '@/services/admin';
import type { Category } from '@/types';
import { CATEGORY_ICONS, getCategoryIcon } from '@/constants/categoryIcons';

interface CategoryForm {
  name: string;
  description: string;
  features: string[];
  is_active: boolean;
  is_premium: boolean;
  is_popular: boolean;
  price: number;
  duration_days: number | null;
  icon: string;
}

const emptyForm: CategoryForm = {
  name: '',
  description: '',
  features: [],
  is_active: true,
  is_premium: false,
  is_popular: false,
  price: 0,
  duration_days: null,
  icon: '',
};

export default function AdminCategories() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    fetchAdminCategories({ search: search || undefined, page })
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

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description ?? '',
      features: [...(cat.features ?? [])],
      is_active: cat.is_active,
      is_premium: cat.is_premium ?? false,
      is_popular: cat.is_popular ?? false,
      price: cat.price ?? 0,
      duration_days: cat.duration_days ?? null,
      icon: cat.icon ?? '',
    });
    setModalOpen(true);
  }

  async function handleToggle(id: number) {
    try {
      await toggleAdminCategory(id);
      showToast('Status diperbarui.', 'success');
      load();
    } catch {
      showToast('Gagal memperbarui status.', 'error');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await deleteAdminCategory(id);
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
        await updateAdminCategory(editId, form);
        showToast('Kategori diperbarui.', 'success');
      } else {
        await createAdminCategory(form);
        showToast('Kategori dibuat.', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      showToast('Gagal menyimpan kategori.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Kategori Latihan</h2>
          <p className="text-sm text-gray-500">Kelola kategori paket latihan soal.</p>
        </div>
        <Button onClick={openCreate}>+ Tambah Kategori</Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Cari kategori..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      {/* Content */}
      {isLoading ? (
        <LoadingState label="Memuat kategori..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada kategori."
          description="Tambahkan kategori untuk mengelompokkan paket latihan."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">Ikon</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Deskripsi</th>
                  <th className="px-5 py-3">Urutan</th>
                  <th className="px-5 py-3">Tipe</th>
                  <th className="px-5 py-3">Harga (Rp)</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((cat, i) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500">{(page - 1) * 15 + i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-5 py-3">
                      {(() => {
                        const Icon = getCategoryIcon(cat.icon);
                        return (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-600">
                            <Icon size={15} />
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{cat.slug}</td>
                    <td className="max-w-xs truncate px-5 py-3 text-gray-500">{cat.description ?? '-'}</td>
                    <td className="px-5 py-3 text-gray-500">{cat.order}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant={cat.is_premium ? 'warning' : 'default'}>
                          {cat.is_premium ? 'Premium (Berbayar)' : 'Gratis'}
                        </Badge>
                        {cat.is_popular && (
                          <Badge variant="success">Paling Populer</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {cat.is_premium
                        ? (cat.price ?? 0).toLocaleString('id-ID')
                        : '-'}
                      {cat.is_premium && (
                        <span className="block text-[11px] text-gray-400">
                          {cat.duration_days ? `${cat.duration_days} hari` : 'selamanya'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={cat.is_active ? 'success' : 'warning'}>
                        {cat.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(cat.id)}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                        >
                          {cat.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => openEdit(cat)}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <span className="text-xs text-gray-500">
                Halaman {page} dari {lastPage} ({total} kategori)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <SlidePanel
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Kategori' : 'Tambah Kategori'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Nama</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: JFT Basic"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Ikon</label>
            <div className="grid grid-cols-6 gap-2">
              {CATEGORY_ICONS.map((opt) => {
                const Icon = opt.icon;
                const active = form.icon === opt.name;
                return (
                  <button
                    type="button"
                    key={opt.name}
                    title={opt.label}
                    onClick={() => setForm({ ...form, icon: opt.name })}
                    className={`flex flex-col items-center justify-center gap-1 rounded-md border px-1 py-2 transition-colors ${
                      active
                        ? 'border-brand-500 bg-brand-50 text-brand-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="max-w-full truncate text-[9px] font-medium">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">
              Deskripsi
            </label>
            <textarea
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi singkat kategori..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">
              Fitur Paket (untuk halaman harga)
            </label>
            <p className="mb-2 text-xs text-gray-400">
              Tampil sebagai poin keunggulan di halaman subscription & pembayaran.
            </p>
            <div className="space-y-2">
              {form.features.map((feature, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => {
                      const features = [...form.features];
                      features[idx] = e.target.value;
                      setForm({ ...form, features });
                    }}
                    placeholder="Contoh: Pembahasan lengkap"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        features: form.features.filter((_, i) => i !== idx),
                      })
                    }
                    className="shrink-0 rounded-md px-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    title="Hapus fitur"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, features: [...form.features, ''] })}
              className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              + Tambah fitur
            </button>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              Aktif
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.is_premium}
                onChange={(e) => setForm({ ...form, is_premium: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              Premium (kategori berbayar — semua paket di dalamnya terkunci)
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.is_popular}
                onChange={(e) => setForm({ ...form, is_popular: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              Tandai Paling Populer (tampil di halaman harga)
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">
              Harga (Rp)
            </label>
            <Input
              type="number"
              min={0}
              value={String(form.price ?? 0)}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              placeholder="Contoh: 100000"
              disabled={!form.is_premium}
            />
            {!form.is_premium && (
              <p className="mt-1 text-xs text-gray-400">
                Harga berlaku saat kategori ditandai Premium.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">
              Durasi Akses
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#15a0f5] focus:ring-2 focus:ring-[#15a0f5]/20 disabled:bg-gray-100 disabled:text-gray-400"
              value={form.duration_days === null ? '0' : String(form.duration_days)}
              onChange={(e) =>
                setForm({
                  ...form,
                  duration_days: Number(e.target.value) === 0 ? null : Number(e.target.value),
                })
              }
              disabled={!form.is_premium}
            >
              <option value="0">Selamanya (unlimited)</option>
              <option value="7">7 hari</option>
              <option value="14">14 hari</option>
              <option value="30">30 hari</option>
              <option value="60">60 hari</option>
              <option value="90">90 hari</option>
              <option value="365">1 tahun (365 hari)</option>
            </select>
            {!form.is_premium && (
              <p className="mt-1 text-xs text-gray-400">
                Pilih durasi saat kategori ditandai Premium.
              </p>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="w-full sm:w-auto">
              Batal
            </Button>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? 'Menyimpan...' : editId ? 'Simpan' : 'Buat'}
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
