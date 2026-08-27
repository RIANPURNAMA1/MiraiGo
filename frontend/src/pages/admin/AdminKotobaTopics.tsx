import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { KotobaCategory, KotobaTopic } from '@/types';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminKotobaTopics() {
  const [topics, setTopics] = useState<KotobaTopic[]>([]);
  const [categories, setCategories] = useState<KotobaCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ category_id: 0, name: '', description: '', order: 0, is_active: true });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  async function load() {
    try {
      const [tRes, cRes] = await Promise.all([
        api.get('/admin/kotoba-topics', { params: { per_page: 100, ...(filterCat ? { category_id: filterCat } : {}) } }),
        api.get('/admin/kotoba-categories'),
      ]);
      setTopics(tRes.data.data.items ?? tRes.data.data);
      setCategories(cRes.data.data);
    } catch { /* empty */ } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterCat]);

  function openAdd() {
    setEditId(null);
    setForm({ category_id: filterCat || (categories[0]?.id ?? 0), name: '', description: '', order: 0, is_active: true });
    setModalOpen(true);
  }

  function openEdit(t: KotobaTopic) {
    setEditId(t.id);
    setForm({ category_id: t.category_id, name: t.name, description: t.description ?? '', order: t.order, is_active: t.is_active });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.category_id) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/admin/kotoba-topics/${editId}`, form);
      } else {
        await api.post('/admin/kotoba-topics', form);
      }
      setModalOpen(false);
      load();
    } catch { /* empty */ } finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Yakin ingin menghapus topik ini?')) return;
    await api.delete(`/admin/kotoba-topics/${id}`);
    load();
  }

  const filtered = topics.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  function catName(id: number) {
    return categories.find(c => c.id === id)?.name ?? '-';
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topik Kotoba</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola topik/kategori soal kosakata per kategori.</p>
        </div>
        <button onClick={openAdd} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Tambah Topik</button>
      </div>

      <div className="flex gap-3">
        <select value={filterCat} onChange={(e) => setFilterCat(Number(e.target.value))} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value={0}>Semua Kategori</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="text" placeholder="Cari topik..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? <LoadingState label="Memuat..." /> : filtered.length === 0 ? (
          <EmptyState title="Belum ada topik" description="Tambahkan topik kosakata baru." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Kata</th>
                <th className="px-5 py-3">Urutan</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-500">{i + 1}</td>
                  <td className="px-5 py-4 font-medium text-gray-900">{t.name}</td>
                  <td className="px-5 py-4 text-gray-600">{catName(t.category_id)}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{t.word_count}</span></td>
                  <td className="px-5 py-4 text-gray-500">{t.order}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.is_active ? 'Aktif' : 'Nonaktif'}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openEdit(t)} className="mr-2 text-xs font-medium text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="text-xs font-medium text-red-600 hover:underline">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">{editId ? 'Edit Topik' : 'Tambah Topik'}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Kategori</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value={0} disabled>Pilih kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Nama Topik</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Contoh: Kosakata Dasar JFT" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Deskripsi</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-700">Urutan</label>
                  <input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                    Aktif
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.category_id} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
