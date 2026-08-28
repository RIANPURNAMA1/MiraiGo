import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/services/api';
import {
  createAdminKotoba,
  createAdminKotobaTopic,
  deleteAdminKotoba,
  fetchAdminKotoba,
  fetchAdminKotobaCategories,
  fetchAdminKotobaTopics,
  toggleAdminKotoba,
  updateAdminKotoba,
} from '@/services/admin';
import type { KotobaCategory, KotobaItem, KotobaInput, KotobaOption, KotobaTopic } from '@/types';

const emptyForm: KotobaInput = {
  category_id: 0,
  japanese: '',
  reading: '',
  meaning: '',
  example_sentence: '',
  example_translation: '',
  order: 0,
  is_active: true,
  topic_ids: [],
  options: [],
};

const emptyOptions = (): KotobaOption[] => [
  { option: 'A', option_text: '', is_correct: true },
  { option: 'B', option_text: '', is_correct: false },
  { option: 'C', option_text: '', is_correct: false },
  { option: 'D', option_text: '', is_correct: false },
];

type StatusFilter = 'all' | 'active' | 'inactive';

function StatusTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminKotoba() {
  const { showToast } = useToast();

  /* ── Selectors ── */
  const [categories, setCategories] = useState<KotobaCategory[]>([]);
  const [topics, setTopics] = useState<KotobaTopic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loadingTopics, setLoadingTopics] = useState(false);

  /* ── List ── */
  const [items, setItems] = useState<KotobaItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  /* ── Quick-add topic modal ── */
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [topicForm, setTopicForm] = useState({ name: '', description: '', order: 1 });
  const [savingTopic, setSavingTopic] = useState(false);

  /* ── Word modal ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<KotobaInput>(emptyForm);
  const [formTopics, setFormTopics] = useState<KotobaTopic[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminKotobaCategories().then(setCategories);
  }, []);

  const loadTopics = useCallback(
    (categoryId: number) => {
      setLoadingTopics(true);
      setTopics([]);
      fetchAdminKotobaTopics({ category_id: categoryId, per_page: 100 })
        .then((res) => setTopics(res.items))
        .catch(() => showToast('Gagal memuat topik.', 'error'))
        .finally(() => setLoadingTopics(false));
    },
    [showToast],
  );

  const loadItems = useCallback(
    (categoryId: string, topicId: string) => {
      setLoading(true);
      fetchAdminKotoba({
        category_id: categoryId ? Number(categoryId) : undefined,
        topic_id: topicId ? Number(topicId) : undefined,
        per_page: 200,
      })
        .then((res) => setItems(res.items))
        .catch(() => {
          setItems([]);
          showToast('Gagal memuat kotoba.', 'error');
        })
        .finally(() => setLoading(false));
    },
    [showToast],
  );

  useEffect(() => {
    if (!selectedCategory) return;
    loadTopics(Number(selectedCategory));
  }, [selectedCategory, loadTopics]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (selectedCategory) loadItems(selectedCategory, selectedTopic);
    }, 150);
    return () => clearTimeout(t);
  }, [selectedCategory, selectedTopic, loadItems]);

  /* ── Form topics (follows selected kategori in form) ── */
  useEffect(() => {
    if (!form.category_id) {
      setFormTopics([]);
      return;
    }
    fetchAdminKotobaTopics({ category_id: form.category_id, per_page: 100 })
      .then((res) => setFormTopics(res.items))
      .catch(() => setFormTopics([]));
  }, [form.category_id]);

  /* ── Topic CRUD ── */
  function openAddTopic() {
    if (!selectedCategory) {
      showToast('Pilih kategori terlebih dahulu.', 'error');
      return;
    }
    setTopicForm({ name: '', description: '', order: topics.length + 1 });
    setTopicModalOpen(true);
  }

  async function handleCreateTopic(e: FormEvent) {
    e.preventDefault();
    if (!selectedCategory || !topicForm.name.trim()) {
      showToast('Nama topik wajib diisi.', 'error');
      return;
    }
    setSavingTopic(true);
    try {
      const created = await createAdminKotobaTopic({
        category_id: Number(selectedCategory),
        name: topicForm.name.trim(),
        description: topicForm.description || null,
        order: topicForm.order,
        is_active: true,
      });
      showToast('Topik dibuat.', 'success');
      setTopicModalOpen(false);
      await loadTopics(Number(selectedCategory));
      setSelectedTopic(String(created.id));
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal membuat topik.'), 'error');
    } finally {
      setSavingTopic(false);
    }
  }

  /* ── Word helpers ── */
  function resetForm() {
    setForm({
      ...emptyForm,
      category_id: selectedCategory ? Number(selectedCategory) : categories[0]?.id ?? 0,
      topic_ids: selectedTopic ? [Number(selectedTopic)] : [],
      options: emptyOptions(),
    });
  }

  function openCreate() {
    setEditId(null);
    resetForm();
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
      topic_ids: item.topics?.map((t) => t.id) ?? [],
      options: item.options && item.options.length > 0 ? item.options : emptyOptions(),
    });
    setModalOpen(true);
  }

  function toggleTopic(id: number) {
    setForm((f) => ({
      ...f,
      topic_ids: f.topic_ids?.includes(id) ? f.topic_ids.filter((t) => t !== id) : [...(f.topic_ids ?? []), id],
    }));
  }

  /* ── Option helpers ── */
  function toggleOption(idx: number) {
    setForm((f) => ({
      ...f,
      options: (f.options ?? []).map((o, i) => ({ ...o, is_correct: i === idx })),
    }));
  }

  function addOption() {
    setForm((f) => {
      const opts = f.options ?? [];
      const letter = String.fromCharCode(65 + opts.length);
      return { ...f, options: [...opts, { option: letter, option_text: '', is_correct: opts.length === 0 }] };
    });
  }

  function removeOption(idx: number) {
    setForm((f) => {
      const opts = f.options ?? [];
      if (opts.length <= 2) return f;
      const removed = opts[idx];
      const next = opts.filter((_, i) => i !== idx);
      if (removed?.is_correct) next[0] = { ...next[0], is_correct: true };
      return { ...f, options: next };
    });
  }

  async function handleToggle(item: KotobaItem) {
    try {
      await toggleAdminKotoba(item.id);
      showToast('Status diperbarui.', 'success');
      if (selectedCategory) loadItems(selectedCategory, selectedTopic);
    } catch {
      showToast('Gagal memperbarui status.', 'error');
    }
  }

  async function handleDelete(item: KotobaItem) {
    if (!window.confirm('Hapus kotoba ini?')) return;
    try {
      await deleteAdminKotoba(item.id);
      showToast('Kotoba dihapus.', 'success');
      if (selectedCategory) loadItems(selectedCategory, selectedTopic);
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal menghapus kotoba.'), 'error');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.japanese.trim() || !form.meaning.trim()) {
      showToast('Isi jepang dan arti.', 'error');
      return;
    }

    const validOptions = (form.options ?? []).filter((o) => o.option_text.trim());
    const payload: KotobaInput = { ...form };
    if (validOptions.length > 0) {
      if (validOptions.length < 2) {
        showToast('Minimal 2 pilihan jawaban.', 'error');
        return;
      }
      if (!validOptions.some((o) => o.is_correct)) {
        showToast('Tandai minimal satu jawaban benar.', 'error');
        return;
      }
      payload.options = validOptions.map((o) => ({
        option: o.option,
        option_text: o.option_text.trim(),
        is_correct: o.is_correct,
      }));
    } else {
      delete payload.options;
    }

    setSaving(true);
    try {
      if (editId) {
        await updateAdminKotoba(editId, payload);
        showToast('Kotoba diperbarui.', 'success');
      } else {
        await createAdminKotoba(payload);
        showToast('Kotoba dibuat.', 'success');
      }
      setModalOpen(false);
      if (selectedCategory) loadItems(selectedCategory, selectedTopic);
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal menyimpan kotoba.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  const countByStatus = items
    ? {
        all: items.length,
        active: items.filter((i) => i.is_active).length,
        inactive: items.filter((i) => !i.is_active).length,
      }
    : { all: 0, active: 0, inactive: 0 };

  const visible = items?.filter((i) =>
    statusFilter === 'all' ? true : statusFilter === 'active' ? i.is_active : !i.is_active,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Kelola Soal Kotoba</h2>
          <p className="text-sm text-gray-500">Buat dan atur soal kosakata (kotoba) berdasarkan kategori & topik.</p>
        </div>
        <Button onClick={openCreate} disabled={!selectedCategory}>
          + Kata Baru
        </Button>
      </div>

      {/* Selectors: Kategori → Topik */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedTopic('');
          }}
        >
          <option value="">Pilih Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </Select>
        <div className="flex gap-2">
          <Select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={!selectedCategory || loadingTopics}
            className="flex-1"
          >
            <option value="">{loadingTopics ? 'Memuat...' : 'Semua Topik'}</option>
            {topics.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name} ({t.word_count} kata)
              </option>
            ))}
          </Select>
          <Button variant="outline" onClick={openAddTopic} disabled={!selectedCategory} title="Tambah Topik">
            +
          </Button>
        </div>
      </div>

      {/* List */}
      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="p-6"><LoadingState /></div>
        ) : !selectedCategory ? (
          <div className="p-6"><EmptyState title="Pilih kategori untuk melihat kotoba." /></div>
        ) : items === null ? (
          <div className="p-6"><LoadingState /></div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center">
            <EmptyState title="Belum ada kotoba." description="Tambahkan kosakata untuk kategori/topik ini." />
            <div className="mt-3"><Button size="sm" onClick={openCreate}>+ Tambah Kotoba Pertama</Button></div>
          </div>
        ) : (
          <>
            {/* Status filter tabs */}
            <div className="flex items-center gap-1 border-b border-gray-100 px-5 py-3">
              {(['all', 'active', 'inactive'] as StatusFilter[]).map((s) => (
                <StatusTab key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                  {s === 'all' ? 'Semua' : s === 'active' ? 'Aktif' : 'Nonaktif'}
                  <span className="ml-1.5 rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                    {countByStatus[s]}
                  </span>
                </StatusTab>
              ))}
            </div>

            <div className="divide-y divide-gray-50">
              {visible?.map((item, i) => (
                <div key={item.id} className="flex items-start gap-4 px-5 py-4">
                  <span className="mt-0.5 text-xs font-medium text-gray-300">{i + 1}</span>

                  <div className="min-w-0 flex-1">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={item.is_active ? 'success' : 'warning'}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                      {item.category && <Badge variant="default">{item.category.name}</Badge>}
                      {item.topics?.map((t) => (
                        <Badge key={t.id} variant="default">{t.name}</Badge>
                      ))}
                      {item.options && item.options.length > 0 && (
                        <Badge variant="default">{item.options.length} opsi</Badge>
                      )}
                    </div>

                    {/* Word */}
                    <p className="mt-1.5 text-lg font-semibold text-gray-900">{item.japanese}</p>
                    {item.reading && <p className="text-sm text-gray-500">{item.reading}</p>}
                    <p className="mt-1 text-sm text-gray-700">{item.meaning}</p>
                    {item.example_sentence && (
                      <p className="mt-1.5 text-xs text-gray-500">{item.example_sentence}</p>
                    )}
                    {item.example_translation && (
                      <p className="text-xs text-gray-400">{item.example_translation}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
                    <button
                      onClick={() => handleToggle(item)}
                      className="text-xs font-medium text-gray-500 hover:text-gray-800"
                    >
                      {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(item)}>Hapus</Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {items && items.length > 0 && (
        <p className="text-xs text-gray-400">
          Total {items.length} kotoba
          {statusFilter !== 'all' && ` · Menampilkan ${visible?.length ?? 0} ${statusFilter === 'active' ? 'aktif' : 'nonaktif'}`}
        </p>
      )}

      {/* ── Quick-add Topik Panel ── */}
      <SlidePanel isOpen={topicModalOpen} onClose={() => setTopicModalOpen(false)} title="Topik Baru" width="md">
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <Input
            label="Nama Topik *"
            value={topicForm.name}
            onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
            placeholder="contoh: Kosakata Dasar"
            required
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Deskripsi</label>
            <textarea
              value={topicForm.description}
              onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
              rows={2}
              placeholder="Deskripsi topik..."
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <Input
            label="Urutan"
            type="number"
            min={1}
            value={topicForm.order}
            onChange={(e) => setTopicForm({ ...topicForm, order: Number(e.target.value) })}
          />
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setTopicModalOpen(false)} className="w-full sm:w-auto">
              Batal
            </Button>
            <Button type="submit" isLoading={savingTopic} className="w-full sm:w-auto">
              Simpan
            </Button>
          </div>
        </form>
      </SlidePanel>

      {/* ── Create / Edit Kotoba Panel ── */}
      <SlidePanel isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Kotoba' : 'Kotoba Baru'} width="lg">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Kategori *</label>
              <Select
                value={String(form.category_id)}
                onChange={(e) => setForm({ ...form, category_id: Number(e.target.value), topic_ids: [] })}
              >
                <option value="0" disabled>Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Topik (kelompok soal dalam kuis)</label>
              {formTopics.length === 0 ? (
                <p className="rounded-md border border-dashed border-gray-200 px-3 py-2.5 text-xs text-gray-400">
                  Tidak ada topik untuk kategori ini.
                </p>
              ) : (
                <div className="max-h-36 overflow-y-auto rounded-md border border-gray-200 p-1.5">
                  {formTopics.map((t) => (
                    <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={form.topic_ids?.includes(t.id) ?? false}
                        onChange={() => toggleTopic(t.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="flex-1 truncate">{t.name}</span>
                      <span className="text-xs text-gray-400">{t.word_count} kata</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <Input
              label="Jepang (漢字) *"
              value={form.japanese}
              onChange={(e) => setForm({ ...form, japanese: e.target.value })}
              placeholder="例: こんにちは"
              required
            />
            <Input
              label="Reading"
              value={form.reading ?? ''}
              onChange={(e) => setForm({ ...form, reading: e.target.value })}
              placeholder="例: こんにちは"
            />
          </div>

          <Input
            label="Arti (Bahasa Indonesia) *"
            value={form.meaning}
            onChange={(e) => setForm({ ...form, meaning: e.target.value })}
            placeholder="例: Selamat siang"
            required
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Contoh Kalimat (Jepang)</label>
            <textarea
              value={form.example_sentence ?? ''}
              onChange={(e) => setForm({ ...form, example_sentence: e.target.value })}
              rows={2}
              placeholder="例: こんにちは、元気ですか。"
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Contoh Kalimat (Arti)</label>
            <textarea
              value={form.example_translation ?? ''}
              onChange={(e) => setForm({ ...form, example_translation: e.target.value })}
              rows={2}
              placeholder="例: Halo, apa kabar?"
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Pilihan Jawaban */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="shrink-0 text-xs font-medium text-gray-700">Pilihan Jawaban (● = benar)</p>
              <Button type="button" size="sm" variant="ghost" onClick={addOption}>
                + Opsi
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Isi pilihan jawaban kustom. Kosongkan semuanya jika ingin pilihan digenerate otomatis.
            </p>
            <div className="space-y-1.5">
              {(form.options ?? []).map((o, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 transition-colors sm:gap-2 sm:px-3 ${
                    o.is_correct ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="kotoba-correct"
                    checked={o.is_correct}
                    onChange={() => toggleOption(idx)}
                    className="h-4 w-4 shrink-0 accent-green-600"
                    title="Jawaban benar"
                  />
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-gray-400">{o.option}.</span>
                  <input
                    value={o.option_text}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        options: (f.options ?? []).map((x, i) => (i === idx ? { ...x, option_text: e.target.value } : x)),
                      }))
                    }
                    placeholder="Teks jawaban"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-300"
                  />
                  {(form.options?.length ?? 0) > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="h-7 w-7 shrink-0 rounded p-1 text-gray-300 hover:text-red-500"
                      title="Hapus opsi"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <Input
              label="Urutan"
              type="number"
              min={0}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            />
            <div className="flex items-end pb-1">
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
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="w-full sm:w-auto">
              Batal
            </Button>
            <Button type="submit" isLoading={saving} className="w-full sm:w-auto">
              {editId ? 'Perbarui' : 'Simpan Kotoba'}
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}