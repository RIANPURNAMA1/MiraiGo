import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { useToast } from '@/components/ui/Toast';
import {
  createAdminModuleCategory,
  deleteAdminModuleCategory,
  fetchAdminModuleCategories,
  updateAdminModuleCategory,
} from '@/services/admin';

interface ModCat {
  id: number;
  name: string;
  slug: string;
}

export default function AdminModuleCategories() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ModCat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [panelOpen, setPanelOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    fetchAdminModuleCategories()
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((c) =>
    search ? c.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  function openCreate() {
    setEditId(null);
    setName('');
    setPanelOpen(true);
  }

  function openEdit(cat: ModCat) {
    setEditId(cat.id);
    setName(cat.name);
    setPanelOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await updateAdminModuleCategory(editId, { name });
        showToast('Kategori diperbarui.', 'success');
      } else {
        await createAdminModuleCategory({ name });
        showToast('Kategori dibuat.', 'success');
      }
      setPanelOpen(false);
      load();
    } catch {
      showToast('Gagal menyimpan kategori.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus kategori modul ini?')) return;
    try {
      await deleteAdminModuleCategory(id);
      showToast('Kategori dihapus.', 'success');
      load();
    } catch {
      showToast('Gagal menghapus kategori.', 'error');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Kategori Modul</h2>
          <p className="text-sm text-gray-500">Kelola kategori untuk materi pembelajaran (modul).</p>
        </div>
        <Button onClick={openCreate}>+ Tambah Kategori</Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Cari kategori..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:w-64"
      />

      {/* Content */}
      {isLoading ? (
        <LoadingState label="Memuat kategori..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Belum ada kategori modul."
          description="Tambahkan kategori untuk mengelompokkan modul pembelajaran."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((cat, i) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-5 py-3 text-gray-500">{cat.slug}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
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

          <div className="border-t border-gray-100 px-5 py-3">
            <span className="text-xs text-gray-500">{items.length} kategori modul</span>
          </div>
        </Card>
      )}

      {/* Slide Panel */}
      <SlidePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editId ? 'Edit Kategori Modul' : 'Tambah Kategori Modul'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Nama Kategori</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kosakata, Grammar, Listening..."
              required
            />
            <p className="mt-1 text-[11px] text-gray-400">Slug akan dibuat otomatis dari nama.</p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)} className="w-full sm:w-auto">
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
