import { useCallback, useEffect, useState, type FormEvent, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { useToast } from '@/components/ui/Toast';
import {
  createAdminModule,
  deleteAdminModule,
  fetchAdminModules,
  toggleAdminModule,
  updateAdminModule,
  fetchAdminModuleCategories,
  type AdminModuleItem,
  type AdminModuleFilters,
} from '@/services/admin';
import { Upload, X, FileText, ExternalLink } from 'lucide-react';

interface ModuleCategory {
  id: number;
  name: string;
}

interface ModuleForm {
  title: string;
  description: string;
  category_id: number | null;
  is_premium: boolean;
  price: number;
  status: 'draft' | 'published';
  external_url: string;
}

const emptyForm: ModuleForm = {
  title: '',
  description: '',
  category_id: null,
  is_premium: false,
  price: 0,
  status: 'draft',
  external_url: '',
};

export default function AdminModules() {
  const { showToast } = useToast();
  const [items, setItems] = useState<AdminModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ModuleForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<ModuleCategory[]>([]);

  const load = useCallback(() => {
    setIsLoading(true);
    fetchAdminModules({ search: search || undefined, type: typeFilter !== 'all' ? typeFilter : undefined, page })
      .then((res) => {
        setItems(res.items);
        setLastPage(res.meta.last_page);
        setTotal(res.meta.total ?? res.items.length);
      })
      .finally(() => setIsLoading(false));
  }, [search, typeFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    fetchAdminModuleCategories().then(setCategories).catch(() => {});
  }, []);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setFile(null);
    setThumb(null);
    setFilePreview(null);
    setThumbPreview(null);
    setPanelOpen(true);
  }

  function openEdit(mod: AdminModuleItem) {
    setEditId(mod.id);
    setForm({
      title: mod.title,
      description: mod.description ?? '',
      category_id: mod.category_id,
      is_premium: mod.is_premium,
      price: mod.price ?? 0,
      status: mod.status,
      external_url: mod.external_url ?? '',
    });
    setFile(null);
    setThumb(null);
    setFilePreview(mod.file_url ?? null);
    setThumbPreview(mod.thumbnail ?? null);
    setPanelOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'thumb') {
    const f = e.target.files?.[0];
    if (!f) return;
    if (type === 'file') {
      setFile(f);
      setFilePreview(URL.createObjectURL(f));
    } else {
      setThumb(f);
      setThumbPreview(URL.createObjectURL(f));
    }
  }

  function removeFile(type: 'file' | 'thumb') {
    if (type === 'file') {
      setFile(null);
      setFilePreview(null);
      if (fileRef.current) fileRef.current.value = '';
    } else {
      setThumb(null);
      setThumbPreview(null);
      if (thumbRef.current) thumbRef.current.value = '';
    }
  }

  async function handleToggle(id: number) {
    try {
      await toggleAdminModule(id);
      showToast('Status diperbarui.', 'success');
      load();
    } catch {
      showToast('Gagal memperbarui status.', 'error');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus modul ini?')) return;
    try {
      await deleteAdminModule(id);
      showToast('Modul dihapus.', 'success');
      load();
    } catch {
      showToast('Gagal menghapus modul.', 'error');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('status', form.status);
      fd.append('is_premium', form.is_premium ? '1' : '0');
      fd.append('price', String(form.price));
      if (form.category_id) fd.append('category_id', String(form.category_id));
      if (form.external_url) fd.append('external_url', form.external_url);
      if (file) fd.append('file', file);
      if (thumb) fd.append('thumbnail', thumb);

      if (editId) {
        await updateAdminModule(editId, fd);
        showToast('Modul diperbarui.', 'success');
      } else {
        await createAdminModule(fd);
        showToast('Modul dibuat.', 'success');
      }
      setPanelOpen(false);
      load();
    } catch {
      showToast('Gagal menyimpan modul.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const typeBadge = (isPremium: boolean) =>
    isPremium ? (
      <Badge variant="warning">Premium</Badge>
    ) : (
      <Badge variant="success">Free</Badge>
    );

  const statusBadge = (status: string) =>
    status === 'published' ? (
      <Badge variant="success">Published</Badge>
    ) : (
      <Badge variant="info">Draft</Badge>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Akses Modul</h2>
          <p className="text-sm text-gray-500">Kelola materi pembelajaran (free & premium).</p>
        </div>
        <Button onClick={openCreate}>+ Tambah Modul</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Cari modul..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="sm:w-64"
        />
        <div className="flex gap-2">
          {(['all', 'free', 'premium'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === t
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'all' ? 'Semua' : t === 'free' ? 'Free' : 'Premium'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState label="Memuat modul..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada modul."
          description="Tambahkan modul untuk memberikan materi pembelajaran."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Judul</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Tipe</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Akses</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((mod, i) => (
                  <tr key={mod.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500">{(page - 1) * 15 + i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {mod.thumbnail ? (
                          <img
                            src={mod.thumbnail.startsWith('http') ? mod.thumbnail : `/storage/${mod.thumbnail}`}
                            alt=""
                            className="h-9 w-9 shrink-0 rounded-md border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400">
                            <FileText size={15} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{mod.title}</p>
                          {mod.description && (
                            <p className="mt-0.5 max-w-[260px] truncate text-xs text-gray-500">{mod.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{mod.category?.name ?? '-'}</td>
                    <td className="px-5 py-3">
                      {mod.external_url ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <ExternalLink size={12} /> Web
                        </span>
                      ) : mod.file_url ? (
                        <span className="text-xs text-gray-500">File</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">{statusBadge(mod.status)}</td>
                    <td className="px-5 py-3">{typeBadge(mod.is_premium)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(mod.id)}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                        >
                          {mod.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => openEdit(mod)}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(mod.id)}
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
                Halaman {page} dari {lastPage} ({total} modul)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Sebelumnya
                </Button>
                <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Slide Panel */}
      <SlidePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editId ? 'Edit Modul' : 'Tambah Modul'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Judul Modul</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: Modul Kosakata JFT Basic"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Deskripsi</label>
            <textarea
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi singkat modul..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Kategori</label>
            <select
              value={form.category_id ?? ''}
              onChange={(e) => setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">— Pilih Kategori —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Akses</label>
              <select
                value={form.is_premium ? 'premium' : 'free'}
                onChange={(e) => setForm({ ...form, is_premium: e.target.value === 'premium' })}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* External URL */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">URL Eksternal (opsional)</label>
            <Input
              value={form.external_url}
              onChange={(e) => setForm({ ...form, external_url: e.target.value })}
              placeholder="https://..."
            />
            <p className="mt-1 text-[11px] text-gray-400">Isi jika modul berupa link ke resource eksternal.</p>
          </div>

          {/* File Upload */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">File Modul (opsional)</label>
            {filePreview ? (
              <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <FileText size={16} className="text-gray-400" />
                <span className="flex-1 truncate text-xs text-gray-600">
                  {file?.name ?? filePreview.split('/').pop()}
                </span>
                <button type="button" onClick={() => removeFile('file')} className="text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-4 text-center text-xs text-gray-500 transition-colors hover:border-brand-400 hover:bg-brand-50/30">
                <Upload size={15} className="text-gray-400" />
                <span>Pilih file (PDF, MP4, MP3, dll)</span>
                <input ref={fileRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, 'file')} accept=".pdf,.mp4,.webm,.mov,.mp3,.wav,.ogg,.m4a" />
              </label>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Thumbnail (opsional)</label>
            {thumbPreview ? (
              <div className="relative inline-block">
                <img
                  src={thumbPreview.startsWith('blob:') ? thumbPreview : (thumbPreview.startsWith('http') ? thumbPreview : `/storage/${thumbPreview}`)}
                  alt=""
                  className="h-20 w-20 rounded-md border border-gray-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile('thumb')}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm hover:text-red-500"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-4 text-center text-xs text-gray-500 transition-colors hover:border-brand-400 hover:bg-brand-50/30">
                <Upload size={15} className="text-gray-400" />
                <span>Pilih gambar thumbnail</span>
                <input ref={thumbRef} type="file" className="hidden" onChange={(e) => handleFileChange(e, 'thumb')} accept="image/*" />
              </label>
            )}
          </div>

          {/* Actions */}
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
