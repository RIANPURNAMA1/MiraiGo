import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/LoadingState';
import { Alert } from '@/components/ui/Alert';
import { useServerTimer } from '@/hooks/useServerTimer';
import { fetchAttempt, saveAnswer, submitAttempt } from '@/services/attempts';
import { getErrorMessage } from '@/services/api';
import type { Question, QuizAttempt } from '@/types';

export default function Quiz() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  const load = useCallback(() => {
    if (!attemptId) return;
    setIsLoading(true);
    fetchAttempt(Number(attemptId))
      .then(({ attempt, questions }) => {
        setAttempt(attempt);
        setQuestions(questions);
        if (attempt.status !== 'in_progress') {
          navigate(`/results/${attempt.id}`, { replace: true });
        }
      })
      .finally(() => setIsLoading(false));
  }, [attemptId, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExpire = useCallback(() => {
    if (!attemptId) return;
    fetchAttempt(Number(attemptId)).then(({ attempt }) => {
      if (attempt.status !== 'in_progress') {
        navigate(`/results/${attempt.id}`, { replace: true });
      }
    });
  }, [attemptId, navigate]);

  const { label: timeLabel, isExpired } = useServerTimer(attempt?.expires_at ?? null, handleExpire);

  const currentQuestion = questions[currentIndex];

  const sections = useMemo(() => {
    const map = new Map<string, { total: number; answered: number; startIndex: number }>();
    questions.forEach((q, i) => {
      const name = q.section_name;
      if (!map.has(name)) {
        map.set(name, { total: 0, answered: 0, startIndex: i });
      }
      const s = map.get(name)!;
      s.total += 1;
      if (q.selected_option_id) s.answered += 1;
    });
    return Array.from(map.entries()).map(([name, info]) => ({ name, ...info }));
  }, [questions]);

  const currentSectionName = currentQuestion?.section_name ?? '';
  const sectionQuestions = useMemo(() => {
    return questions.filter((q) => q.section_name === currentSectionName);
  }, [questions, currentSectionName]);
  const sectionLocalIndex = sectionQuestions.findIndex((q) => q.id === currentQuestion?.id);

  function toggleFlag(index: number) {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleSelectOption(optionId: number) {
    if (!attempt || !currentQuestion) return;
    setSaveError(null);
    setIsSaving(true);

    setQuestions((prev) =>
      prev.map((q, i) => (i === currentIndex ? { ...q, selected_option_id: optionId } : q))
    );

    try {
      await saveAnswer(attempt.id, currentQuestion.id, optionId);
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Gagal menyimpan jawaban. Periksa koneksi Anda.'));
      load();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit() {
    if (!attempt) return;
    setIsSubmitting(true);
    try {
      const result = await submitAttempt(attempt.id);
      navigate(`/results/${result.id}`, { replace: true });
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Gagal mengirim quiz.'));
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingState label="Memuat soal..." />;
  if (!attempt || !currentQuestion) {
    return <Alert variant="error">Soal tidak ditemukan atau attempt tidak valid.</Alert>;
  }

  const testTitle = (attempt as unknown as { test_name?: string }).test_name ?? 'Evaluation Test';

  return (
    <div className="flex h-screen flex-col font-sans bg-[#edf1f5]">
      {/* ── Top Header (Dark) ── */}
      <div className="relative flex items-center justify-between bg-[#1f2022] px-6 py-2">
        <div className="flex flex-col leading-tight">
          <p className="text-[13px] text-white">
            <span className="text-gray-300 font-normal">Question: </span>
            <span className="font-bold">{sectionLocalIndex + 1}</span>
          </p>
          <p className="text-[13px] text-gray-300 font-normal mt-1">Section:</p>
          <p className="text-[13px] text-white font-semibold">{currentSectionName}</p>
        </div>

        {/* Timer */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <svg
            className="h-6 w-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div className="flex flex-col">
            <p className="text-[11px] text-white tracking-wide">Time Remaining</p>
            <p className="text-lg font-bold text-white leading-tight">{timeLabel}</p>
          </div>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="rounded bg-[#f0c885] px-4 py-1.5 text-sm font-bold text-gray-900 transition-colors hover:bg-[#e0b875]"
        >
          Finish Section
        </button>
      </div>

      {/* ── Subheader (Green) ── */}
      <div className="flex items-center justify-between bg-[#5e8b5d] px-6 py-1.5 border-b border-[#4d7a4c]">
        <p className="text-[13px] text-white">
          <span className="font-bold">Test: </span>
          <span className="font-normal">{testTitle}</span>
        </p>
        {/* Calculator Icon */}
        <svg className="h-4 w-4 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V7h-2v2zm-4 8h2v-2H8v2zm0-4h2v-2H8v2zm0-4h2V7H8v2zm8 8h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V7h-2v2z" />
        </svg>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar Navigator (DIUBAH TOTAL AGAR MIRIP) ── */}
        <aside className="w-[100px] shrink-0 overflow-y-auto bg-white py-4 shadow-[1px_0_5px_rgba(0,0,0,0.1)] z-10 flex flex-col gap-4">
          {sections.map((section) => {
            const localOffset = section.startIndex;
            // Menghasilkan singkatan seperti "Sc...", "Co...", "Lis..."
            const shortName = section.name.substring(0, 2) + "...";
            
            return (
              <div key={section.name} className="flex w-full pl-2">
                {/* Kolom Kiri: Label Kategori */}
                <div className="w-8 shrink-0 text-left pt-1">
                  <p className="text-[11px] font-semibold text-gray-400">
                    {shortName}
                  </p>
                </div>
                
                {/* Kolom Kanan: Garis Vertikal (Track) dan Tombol */}
                <div className="flex-1 border-l-[4px] border-[#d1d5db] flex flex-col gap-1.5 py-1">
                  {questions
                    .map((q, idx) => ({ q, idx }))
                    .filter(({ q }) => q.section_name === section.name)
                    .map(({ q, idx }) => {
                      const isActive = idx === currentIndex;
                      const localNum = idx - localOffset + 1;
                      
                      // Pada screenshot semua tombol berwarna hijau
                      const bgClass = 'bg-[#5e8b5d]';

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIndex(idx)}
                          // h-7 = 28px height. Tombol menempel pada garis kiri (rounded-l-none).
                          className={`relative flex h-7 w-12 items-center justify-center text-[13px] font-bold text-white transition-all ${
                            isActive ? 'rounded-none' : 'rounded-r-md rounded-l-none'
                          } ${bgClass}`}
                        >
                          {localNum}
                          
                          {/* Segitiga panah CSS untuk item yang aktif */}
                          {isActive && (
                            <div className="absolute top-0 -right-[9px] w-0 h-0 border-y-[14px] border-y-transparent border-l-[10px] border-l-[#5e8b5d]" />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </aside>

        {/* ── Main Question Content ── */}
        <div className="flex-1 overflow-y-auto bg-[#edf1f5] p-6">
          <div className="mx-auto w-full max-w-5xl bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Light Blue Top Bar inside the card */}
            <div className="h-4 bg-[#e2eaf4] w-[96%] mx-auto mt-4 rounded-full" />

            <div className="p-6">
              {saveError && (
                <div className="mb-4">
                  <Alert variant="error">{saveError}</Alert>
                </div>
              )}

              {/* Question Layout */}
              <div className="mb-6 flex flex-col items-center">
                {currentQuestion.image ? (
                  <div className="w-full rounded bg-[#f3f4f6] flex justify-center relative overflow-hidden">
                    <img
                      src={currentQuestion.image}
                      alt="Question Context"
                      className="max-h-[400px] object-contain w-full mix-blend-multiply"
                    />
                  </div>
                ) : (
                  <div className="w-full rounded bg-[#f3f4f6] p-6 min-h-[150px]">
                    <p className="text-lg font-medium text-gray-900">
                      {currentQuestion.question_text}
                    </p>
                  </div>
                )}
                
                {currentQuestion.audio && (
                  <audio controls src={currentQuestion.audio} className="mt-4 w-full" />
                )}
                
                {currentQuestion.image && currentQuestion.question_text && (
                  <p className="text-lg font-medium text-gray-900 mt-6 self-start w-full">
                    {currentQuestion.question_text}
                  </p>
                )}
              </div>

              {/* Options - Vertical Stack */}
              <div className="flex flex-col gap-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = currentQuestion.selected_option_id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={isExpired}
                      className={`flex w-full items-center gap-4 rounded border p-3 text-left transition-colors disabled:opacity-50 ${
                        isSelected
                          ? 'border-[#5e8b5d] bg-[#f2f8f2]'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          isSelected 
                            ? 'bg-[#5e8b5d] text-white' 
                            : 'bg-[#eef2f7] text-gray-600'
                        }`}
                      >
                        {opt.option}
                      </span>
                      <span className="text-base text-gray-800">
                        {opt.option_text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between bg-[#1f2022] px-6 py-2.5">
        <div className="flex items-center gap-3">
           {/* Fake Visual Toggles */}
           <div className="flex items-center gap-2">
             <div className="flex h-6 w-12 items-center rounded-full bg-[#36c073] p-1">
                <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#36c073]">A</span>
                </div>
             </div>
             <div className="flex h-6 w-12 items-center rounded-full bg-[#4682ea] p-1">
                <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#4682ea]" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
             </div>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleFlag(currentIndex)}
            className="flex h-9 w-10 items-center justify-center rounded bg-[#405640] transition-colors hover:bg-[#4d664d]"
          >
             <svg 
               className={`h-4 w-4 ${flagged.has(currentIndex) ? 'fill-[#f0c885]' : 'fill-white'}`} 
               viewBox="0 0 24 24"
             >
               <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
             </svg>
          </button>
          
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="rounded bg-[#405640] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4d664d] disabled:opacity-50"
          >
            &lt; Back
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="rounded bg-[#5e8b5d] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4d7a4c]"
            >
              Next &gt;
            </button>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded bg-[#5e8b5d] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4d7a4c]"
            >
              Finish
            </button>
          )}
        </div>
      </div>

      {/* ── Confirm modal ── */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="px-2 py-2 text-center">
          <p className="mx-auto mb-5 inline-block rounded-lg bg-gray-100 px-6 py-2 text-base font-semibold text-gray-800">
            Confirm Finish Section
          </p>

          <p className="mb-4 text-xs text-gray-400">sswgoukaku.com</p>

          <p className="mb-4 text-sm leading-relaxed text-gray-700">
            If you select <strong>Finish Section</strong>, you will not be able to return to the
            section.
          </p>
          <p className="mb-6 text-sm leading-relaxed text-gray-700">
            Are you sure you would like to finish this section?
          </p>

          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#5e8b5d] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4d7a4c] disabled:opacity-60"
            >
              {isSubmitting ? 'Menyimpan...' : 'Yes, I would like to finish this section'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isSubmitting}
              className="w-full rounded-lg bg-gray-100 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-60"
            >
              No, I would like to return to this section
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}