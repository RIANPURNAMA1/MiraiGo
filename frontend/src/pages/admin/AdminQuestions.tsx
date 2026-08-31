import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
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
  createAdminQuestion,
  createAdminSection,
  deleteAdminQuestion,
  fetchAdminPackages,
  fetchAdminSections,
  fetchSectionQuestions,
  updateAdminQuestion,
  uploadQuestionAudio,
  uploadQuestionImage,
} from '@/services/admin';
import type { AdminPackage, PackageSection, Question } from '@/types';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

interface OptionDraft {
  option: string;
  option_text: string;
  is_correct: boolean;
}

type QuestionType = 'all' | 'text' | 'image' | 'audio';

const emptyOptions = (): OptionDraft[] => [
  { option: 'A', option_text: '', is_correct: true },
  { option: 'B', option_text: '', is_correct: false },
  { option: 'C', option_text: '', is_correct: false },
  { option: 'D', option_text: '', is_correct: false },
];

function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_ROOT}/storage/${path}`;
}

/* ──────────────────────────────────────────────────────── */
/*  Tab button                                             */
/* ──────────────────────────────────────────────────────── */
function TypeTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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

/* ──────────────────────────────────────────────────────── */
/*  Media upload zone (image or audio)                     */
/* ──────────────────────────────────────────────────────── */
function MediaUpload({
  label,
  accept,
  previewUrl,
  onFile,
  onRemove,
  icon,
}: {
  label: string;
  accept: string;
  previewUrl: string | null;
  onFile: (file: File) => void;
  onRemove: () => void;
  icon: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    e.target.value = '';
  }

  if (previewUrl) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        {accept.includes('audio') ? (
          <div className="flex items-center gap-2 p-2 sm:gap-3 sm:p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 sm:h-10 sm:w-10">
              {icon}
            </div>
            <audio controls src={previewUrl} className="h-8 min-w-0 flex-1 sm:h-9" />
          </div>
        ) : (
          <img src={previewUrl} alt="Preview" className="max-h-32 w-full object-contain sm:max-h-40" />
        )}
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 rounded-md bg-white/90 p-1 text-gray-400 shadow-sm hover:text-red-500 sm:right-2 sm:top-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex w-full items-center gap-2.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-3.5 text-left text-sm text-gray-500 transition-colors hover:border-brand-400 hover:bg-brand-50/30 sm:gap-3 sm:px-4 sm:py-5"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 sm:h-10 sm:w-10">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-gray-700">{label}</p>
        <p className="mt-0.5 text-xs text-gray-400">Klik untuk memilih file</p>
      </div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
    </button>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Main component                                         */
/* ──────────────────────────────────────────────────────── */
export default function AdminQuestions() {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [sections, setSections] = useState<PackageSection[]>([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [typeFilter, setTypeFilter] = useState<QuestionType>('all');

  /* ── Section modal ── */
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [sectionDesc, setSectionDesc] = useState('');
  const [sectionDuration, setSectionDuration] = useState('');
  const [savingSection, setSavingSection] = useState(false);

  /* ── Question modal ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [qText, setQText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [score, setScore] = useState('1');
  const [options, setOptions] = useState<OptionDraft[]>([]);
  const [saving, setSaving] = useState(false);

  /* ── Media state ── */
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [existingAudio, setExistingAudio] = useState<string | null>(null);

  /* ── Load packages ── */
  useEffect(() => {
    fetchAdminPackages({ page: 1 })
      .then((res) => setPackages(res.items))
      .catch(() => showToast('Gagal memuat daftar paket.', 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Load sections ── */
  const loadSections = useCallback(
    (pkgId: string) => {
      setLoadingSections(true);
      setSections([]);
      setSelectedSection('');
      setQuestions(null);
      fetchAdminSections(Number(pkgId))
        .then((res) => setSections(res))
        .catch(() => showToast('Gagal memuat section.', 'error'))
        .finally(() => setLoadingSections(false));
    },
    [showToast],
  );

  useEffect(() => {
    if (!selectedPackage) return;
    loadSections(selectedPackage);
  }, [selectedPackage, loadSections]);

  /* ── Load questions ── */
  const loadQuestions = useCallback(
    (sectionId: string) => {
      setLoadingQuestions(true);
      fetchSectionQuestions(Number(sectionId))
        .then((res) => setQuestions(res))
        .catch(() => {
          setQuestions([]);
          showToast('Gagal memuat soal.', 'error');
        })
        .finally(() => setLoadingQuestions(false));
    },
    [showToast],
  );

  useEffect(() => {
    if (!selectedSection) return;
    loadQuestions(selectedSection);
  }, [selectedSection, loadQuestions]);

  /* ── Filtered questions ── */
  const filteredQuestions = questions?.filter((q) => {
    if (typeFilter === 'text') return !q.image && !q.audio;
    if (typeFilter === 'image') return !!q.image;
    if (typeFilter === 'audio') return !!q.audio;
    return true;
  });

  const countByType = questions
    ? {
        all: questions.length,
        text: questions.filter((q) => !q.image && !q.audio).length,
        image: questions.filter((q) => !!q.image).length,
        audio: questions.filter((q) => !!q.audio).length,
      }
    : { all: 0, text: 0, image: 0, audio: 0 };

  /* ── Section CRUD ── */
  function openSectionModal() {
    if (!selectedPackage) {
      showToast('Pilih paket terlebih dahulu.', 'error');
      return;
    }
    setSectionName('');
    setSectionDesc('');
    setSectionDuration('');
    setSectionModalOpen(true);
  }

  async function handleCreateSection(e: FormEvent) {
    e.preventDefault();
    if (!selectedPackage || !sectionName.trim()) {
      showToast('Nama section wajib diisi.', 'error');
      return;
    }
    setSavingSection(true);
    try {
      const created = await createAdminSection(Number(selectedPackage), {
        name: sectionName.trim(),
        description: sectionDesc || undefined,
        duration_minutes: sectionDuration ? Number(sectionDuration) : undefined,
      });
      showToast('Section dibuat.', 'success');
      setSectionModalOpen(false);
      const updated = await fetchAdminSections(Number(selectedPackage));
      setSections(updated);
      setSelectedSection(String(created.id));
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal membuat section.'), 'error');
    } finally {
      setSavingSection(false);
    }
  }

  /* ── Question helpers ── */
  function resetForm() {
    setQText('');
    setExplanation('');
    setDifficulty('medium');
    setScore('1');
    setOptions(emptyOptions());
    setImageFile(null);
    setImagePreview(null);
    setAudioFile(null);
    setAudioPreview(null);
    setExistingImage(null);
    setExistingAudio(null);
  }

  function openCreate() {
    setEditId(null);
    resetForm();
    setModalOpen(true);
  }

  function openEdit(q: Question) {
    setEditId(q.id);
    setQText(q.question_text);
    setExplanation(q.explanation ?? '');
    setDifficulty(q.difficulty || 'medium');
    setScore(String(q.score || 1));
    setOptions(
      q.options.length > 0
        ? q.options.map((o) => ({ option: o.option, option_text: o.option_text, is_correct: false }))
        : emptyOptions(),
    );
    setImageFile(null);
    setImagePreview(null);
    setAudioFile(null);
    setAudioPreview(null);
    setExistingImage(q.image ?? null);
    setExistingAudio(q.audio ?? null);
    setModalOpen(true);
  }

  function handleImageFile(file: File) {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleAudioFile(file: File) {
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
  }

  function toggleOption(idx: number) {
    setOptions((prev) => prev.map((o, i) => ({ ...o, is_correct: i === idx })));
  }

  function addOption() {
    const letter = String.fromCharCode(65 + options.length);
    setOptions((prev) => [...prev, { option: letter, option_text: '', is_correct: false }]);
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleDelete(q: Question) {
    if (!window.confirm('Hapus soal ini?')) return;
    try {
      await deleteAdminQuestion(q.id);
      showToast('Soal dihapus.', 'success');
      if (selectedSection) loadQuestions(selectedSection);
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal menghapus soal.'), 'error');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedSection || !qText.trim()) {
      showToast('Pilih section dan isi teks soal.', 'error');
      return;
    }
    const validOptions = options.filter((o) => o.option_text.trim());
    if (validOptions.length < 2) {
      showToast('Minimal 2 pilihan jawaban.', 'error');
      return;
    }
    if (!validOptions.some((o) => o.is_correct)) {
      showToast('Tandai minimal satu jawaban benar.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        section_id: Number(selectedSection),
        question_text: qText.trim(),
        explanation: explanation.trim() || null,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        score: Number(score) || 1,
        options: validOptions.map((o) => ({
          option: o.option,
          option_text: o.option_text.trim(),
          is_correct: o.is_correct,
        })),
      };

      let saved: Question;
      if (editId) {
        saved = await updateAdminQuestion(editId, payload);
        showToast('Soal diperbarui.', 'success');
      } else {
        saved = await createAdminQuestion(payload);
        showToast('Soal dibuat.', 'success');
      }

      if (imageFile) {
        await uploadQuestionImage(saved.id, imageFile);
      }
      if (audioFile) {
        await uploadQuestionAudio(saved.id, audioFile);
      }

      setModalOpen(false);
      loadQuestions(selectedSection);
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal menyimpan soal.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  function difficultyMeta(d?: string) {
    if (d === 'easy') return { label: 'Mudah', color: 'success' as const };
    if (d === 'hard') return { label: 'Sulit', color: 'error' as const };
    return { label: 'Sedang', color: 'warning' as const };
  }

  /* ──────────────────────────── render ──────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Kelola Soal</h2>
          <p className="text-sm text-gray-500">Buat soal teks, gambar, atau audio untuk tes kerja di Jepang.</p>
        </div>
        <Button onClick={openCreate} disabled={!selectedSection}>
          + Soal Baru
        </Button>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value)}>
          <option value="">Pilih Paket</option>
          {packages.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </Select>
        <div className="flex gap-2">
          <Select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            disabled={!selectedPackage || loadingSections}
            className="flex-1"
          >
            <option value="">{loadingSections ? 'Memuat...' : 'Pilih Section'}</option>
            {sections.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name} ({s.question_count} soal)
              </option>
            ))}
          </Select>
          <Button variant="outline" onClick={openSectionModal} disabled={!selectedPackage} title="Tambah Section">
            +
          </Button>
        </div>
      </div>

      {/* Questions */}
      <Card className="overflow-hidden p-0">
        {loadingQuestions ? (
          <div className="p-6"><LoadingState /></div>
        ) : !selectedSection ? (
          <div className="p-6"><EmptyState title="Pilih section untuk melihat soal." /></div>
        ) : questions === null ? (
          <div className="p-6"><LoadingState /></div>
        ) : questions.length === 0 ? (
          <div className="p-6 text-center">
            <EmptyState title="Belum ada soal di section ini." />
            <div className="mt-3"><Button size="sm" onClick={openCreate}>+ Tambah Soal Pertama</Button></div>
          </div>
        ) : (
          <>
            {/* Type filter tabs */}
            <div className="flex items-center gap-1 border-b border-gray-100 px-5 py-3">
              {(['all', 'text', 'image', 'audio'] as QuestionType[]).map((t) => (
                <TypeTab key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
                  {t === 'all' && 'Semua'}
                  {t === 'text' && 'Teks'}
                  {t === 'image' && 'Gambar'}
                  {t === 'audio' && 'Audio'}
                  <span className="ml-1.5 rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                    {countByType[t]}
                  </span>
                </TypeTab>
              ))}
            </div>

            <div className="divide-y divide-gray-50">
              {filteredQuestions?.map((q, i) => {
                const dm = difficultyMeta(q.difficulty);
                const hasImage = !!q.image;
                const hasAudio = !!q.audio;
                const imgSrc = mediaUrl(q.image);
                const audSrc = mediaUrl(q.audio);
                return (
                  <div key={q.id} className="flex items-start gap-4 px-5 py-4">
                    {/* Number */}
                    <span className="mt-0.5 text-xs font-medium text-gray-300">{i + 1}</span>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={dm.color}>{dm.label}</Badge>
                        {hasImage && (
                          <Badge variant="default">
                            <span className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="M21 15l-5-5L5 21" />
                              </svg>
                              Gambar
                            </span>
                          </Badge>
                        )}
                        {hasAudio && (
                          <Badge variant="default">
                            <span className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="6" cy="18" r="3" />
                                <circle cx="18" cy="16" r="3" />
                              </svg>
                              Audio
                            </span>
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">{q.options.length} opsi</span>
                      </div>

                      {/* Question text */}
                      <p className="mt-1.5 font-medium leading-relaxed text-gray-900">{q.question_text}</p>

                      {/* Media previews */}
                      <div className="mt-2 flex flex-wrap gap-3">
                        {hasImage && imgSrc && (
                          <img
                            src={imgSrc}
                            alt="Gambar soal"
                            className="max-h-28 rounded-lg border border-gray-200 object-contain"
                          />
                        )}
                        {hasAudio && audSrc && (
                          <audio controls src={audSrc} className="h-9" />
                        )}
                      </div>

                      {/* Options */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {q.options.map((o) => (
                          <span
                            key={o.id}
                            className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                          >
                            <span className="font-semibold">{o.option}.</span> {o.option_text}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => openEdit(q)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(q)}>Hapus</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {questions && questions.length > 0 && (
        <p className="text-xs text-gray-400">
          Total {questions.length} soal
          {typeFilter !== 'all' && ` · Menampilkan ${filteredQuestions?.length ?? 0} ${typeFilter}`}
        </p>
      )}

      {/* ── Create Section Panel ── */}
      <SlidePanel isOpen={sectionModalOpen} onClose={() => setSectionModalOpen(false)} title="Section Baru" width="md">
        <form onSubmit={handleCreateSection} className="space-y-4">
          <Input
            label="Nama Section *"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            placeholder="contoh: 聴解, 文法, 読解"
            required
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Deskripsi</label>
            <textarea
              value={sectionDesc}
              onChange={(e) => setSectionDesc(e.target.value)}
              rows={2}
              placeholder="Deskripsi section..."
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <Input
            label="Durasi (menit)"
            type="number"
            value={sectionDuration}
            onChange={(e) => setSectionDuration(e.target.value)}
            placeholder="Opsional"
          />
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setSectionModalOpen(false)} className="w-full sm:w-auto">
              Batal
            </Button>
            <Button type="submit" isLoading={savingSection} className="w-full sm:w-auto">
              Simpan
            </Button>
          </div>
        </form>
      </SlidePanel>

      {/* ── Create / Edit Question Panel ── */}
      <SlidePanel isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Soal' : 'Soal Baru'} width="lg">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Teks soal */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Teks Soal *</label>
            <textarea
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              rows={3}
              placeholder="Tulis pertanyaan di sini..."
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Media uploads — stacked on mobile, 2-col on sm+ */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Gambar Soal</label>
              <MediaUpload
                label="Upload Gambar"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                previewUrl={imagePreview || mediaUrl(existingImage)}
                onFile={handleImageFile}
                onRemove={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  setExistingImage(null);
                }}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Audio Soal</label>
              <MediaUpload
                label="Upload Audio"
                accept="audio/mpeg,audio/wav,audio/ogg"
                previewUrl={audioPreview || mediaUrl(existingAudio)}
                onFile={handleAudioFile}
                onRemove={() => {
                  setAudioFile(null);
                  setAudioPreview(null);
                  setExistingAudio(null);
                }}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Penjelasan */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Penjelasan Jawaban</label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              placeholder="Penjelasan mengapa jawaban ini benar..."
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Difficulty & Score — stacked on mobile, 2-col on sm+ */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Tingkat Kesulitan</label>
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Mudah (易しい)</option>
                <option value="medium">Sedang (普通)</option>
                <option value="hard">Sulit (難しい)</option>
              </Select>
            </div>
            <Input
              label="Skor"
              type="number"
              min="1"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="shrink-0 text-xs font-medium text-gray-700">Pilihan Jawaban (● = benar)</p>
              <Button type="button" size="sm" variant="ghost" onClick={addOption}>
                + Opsi
              </Button>
            </div>
            <div className="space-y-1.5">
              {options.map((o, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 transition-colors sm:gap-2 sm:px-3 ${
                    o.is_correct ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="correct"
                    checked={o.is_correct}
                    onChange={() => toggleOption(idx)}
                    className="h-4 w-4 shrink-0 accent-green-600"
                    title="Jawaban benar"
                  />
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-gray-400">{o.option}.</span>
                  <input
                    value={o.option_text}
                    onChange={(e) =>
                      setOptions((prev) => prev.map((x, i) => (i === idx ? { ...x, option_text: e.target.value } : x)))
                    }
                    placeholder="Teks jawaban"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-300"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="h-7 w-7 shrink-0 rounded p-1 text-gray-300 hover:text-red-500"
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

          {/* Submit — full width on mobile */}
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="w-full sm:w-auto">
              Batal
            </Button>
            <Button type="submit" isLoading={saving} className="w-full sm:w-auto">
              {editId ? 'Perbarui' : 'Simpan Soal'}
            </Button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
