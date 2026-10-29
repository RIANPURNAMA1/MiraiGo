import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DraggableCalculator } from '@/components/ui/DraggableCalculator';
import { LoadingState } from '@/components/ui/LoadingState';
import { Alert } from '@/components/ui/Alert';
import { useServerTimer } from '@/hooks/useServerTimer';
import { fetchAttempt, saveAnswer, submitAttempt } from '@/services/attempts';
import { getErrorMessage, ROOT_URL } from '@/services/api';
import type { Question, QuizAttempt } from '@/types';

export { ExamInstructions } from './QuizInstructions';

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
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [showCalc, setShowCalc] = useState(false);
  const shuffledRef = useRef(false);

  function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function shuffleBySection(qs: Question[]): Question[] {
    const map = new Map<string, Question[]>();
    qs.forEach(q => {
      const arr = map.get(q.section_name) ?? [];
      arr.push({
        ...q,
        options: q.selected_option_id ? q.options : shuffleArray(q.options),
      });
      map.set(q.section_name, arr);
    });
    const result: Question[] = [];
    map.forEach(arr => result.push(...shuffleArray(arr)));
    return result;
  }

  const load = useCallback(() => {
    if (!attemptId) return;
    setIsLoading(true);
    fetchAttempt(Number(attemptId))
      .then(({ attempt, questions }) => {
        setAttempt(attempt);
        const hasAnswers = questions.some(q => q.selected_option_id);
        if (!hasAnswers && !shuffledRef.current) {
          questions = shuffleBySection(questions);
          shuffledRef.current = true;
        }
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

  const currentSectionIndex = sections.findIndex((s) => s.name === currentSectionName);
  const isLastSection = currentSectionIndex === sections.length - 1;

  function handleFinishSection() {
    setShowConfirm(true);
  }

  function handleConfirmFinishSection() {
    setShowConfirm(false);
    setShowFinalConfirm(true);
  }

  function handleFinalFinishSection() {
    setShowFinalConfirm(false);
    if (isLastSection) {
      handleSubmit();
    } else {
      const nextSection = sections[currentSectionIndex + 1];
      setCurrentIndex(nextSection.startIndex);
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
    <div className="flex h-screen flex-col bg-jft-app font-jp text-jft-ink">
      <div className="sticky top-0 z-30 shadow-sm">
        <div className="bg-jft-bar text-white">
          <div className="flex h-11 items-center justify-between gap-3 px-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="hidden shrink-0 rounded-sm bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 sm:inline">Section</span>
              <span className="truncate text-xs font-semibold sm:text-sm">{currentSectionName}</span>
              <span className="hidden truncate text-[11px] text-white/40 lg:inline">• {testTitle}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <button
                onClick={handleFinishSection}
                className="shrink-0 rounded bg-[#f0c885] px-2.5 py-1 text-[11px] font-bold text-gray-900 transition-colors hover:bg-[#e0b875] sm:px-3 sm:text-xs"
              >
                Finish Section
              </button>
              <span className={`flex items-center gap-1.5 rounded px-2 py-1 font-mono text-sm font-bold tabular-nums sm:text-base ${isExpired ? 'bg-jft-warnDeep text-white' : 'text-white'}`} role="timer" aria-label="Sisa waktu">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {timeLabel}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-jft-brand text-white">
          <div className="flex h-10 items-center justify-between gap-3 px-3 sm:px-5">
            <p className="truncate text-[11px] font-semibold tracking-wide sm:text-xs">Japan Foundation Test for Basic Japanese</p>
            <div className="flex items-center gap-3">
              <p className="max-w-[55%] shrink-0 truncate text-[10px] font-medium sm:text-xs">
                <span className="text-white/60">Test:</span> {testTitle}
              </p>
              <button
                onClick={() => setShowCalc((v) => !v)}
                className="shrink-0 text-white opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Calculator"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V7h-2v2zm-4 8h2v-2H8v2zm0-4h2v-2H8v2zm0-4h2V7H8v2zm8 8h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V7h-2v2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: question navigator ── */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 md:hidden">
        <span className="shrink-0 text-[10px] font-semibold text-gray-400">Soal:</span>
        {questions.map((q, idx) => {
          const isSectionStart = idx === 0 || q.section_name !== questions[idx - 1].section_name;
          const isActive = idx === currentIndex;
          const isAnswered = !!q.selected_option_id;
          const isFlagged = flagged.has(idx);
          return (
            <div key={q.id} className="flex shrink-0 items-center gap-1.5">
              {isSectionStart && idx > 0 && (
                <span className="mx-1 h-5 w-px bg-gray-300" />
              )}
              <button
                onClick={() => setCurrentIndex(idx)}
                className={`relative flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md px-1 text-xs font-bold transition-all hover:opacity-90 ${
                  isActive
                    ? 'bg-[#5e8b5d] text-white'
                    : isAnswered
                      ? 'bg-[#474747] text-white'
                      : 'border border-gray-200 bg-[#eef2f7] text-gray-700'
                }`}
              >
                {idx + 1}
                {isFlagged && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-yellow-400" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar Navigator (desktop only) ── */}
        <aside className="hidden md:block md:w-[130px] md:shrink-0 md:overflow-y-auto md:relative md:z-10">
          <div className="flex">
            {/* Background putih full height */}
            <div className="absolute inset-y-0 left-0 w-10 bg-white" />

            {/* Kolom Kiri: Label section */}
            <div className="w-10 shrink-0 py-4 mr-2 flex flex-col relative z-10">
              {sections.map((section) => {
                const shortName = section.name.substring(0, 2) + '...';
                const pct = section.total > 0 ? (section.answered / section.total) * 100 : 0;
                return (
                  <div key={section.name} className="flex flex-col items-center px-2" style={{ flex: section.total }}>
                    <p className={`text-[12px] mb-1 ${section.name === currentSectionName ? 'font-bold text-black' : 'font-medium text-gray-500'}`}>
                      {shortName}
                    </p>
                    <div className="w-2.5 flex-1 rounded-full bg-[#e2e4e8] relative overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 w-full rounded-full bg-[#5e8b5d] transition-all duration-300"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Kolom Kanan: Tombol-tombol soal */}
            <div className="flex-1 py-4 pl-1 flex flex-col">
              {sections.map((section) => {
                const localOffset = section.startIndex;
                const sectionCount = questions.filter(q => q.section_name === section.name).length;
                return (
                  <div key={section.name} className="flex flex-col gap-2 py-1" style={{ flex: sectionCount }}>
                    {questions
                      .map((q, idx) => ({ q, idx }))
                      .filter(({ q }) => q.section_name === section.name)
                      .map(({ q, idx }) => {
                        const isActive = idx === currentIndex;
                        const isAnswered = !!q.selected_option_id;
                        const isFlagged = flagged.has(idx);
                        const localNum = idx - localOffset + 1;

                        let bgColor = '#5e8b5d';
                        if (isAnswered && !isActive) bgColor = '#474747';

                        return (
                          <div key={q.id} className="flex items-center">
                            <button
                              onClick={() => setCurrentIndex(idx)}
                              className="relative flex h-[28px] w-[56px] items-center justify-center rounded text-[13px] font-bold text-white transition-all hover:opacity-90"
                              style={{ backgroundColor: bgColor }}
                            >
                              <span className="w-full text-center">{localNum}</span>

                              {isFlagged && (
                                <svg
                                  className="absolute top-1 right-[14px] h-[10px] w-[10px] fill-[#fde047] drop-shadow-sm"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                                </svg>
                              )}
                            </button>

                            {isActive && (
                              <svg
                                className="h-[14px] w-[10px] shrink-0"
                                viewBox="0 0 10 14"
                                fill={bgColor}
                              >
                                <path d="M0 0L10 7L0 14z" />
                              </svg>
                            )}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ── Main Question Content ── */}
        <div className="flex-1 overflow-y-auto bg-jft-app p-3 sm:px-5 sm:py-4">
          <div className="mx-auto w-full max-w-4xl">
            {!isExpired && saveError && (
              <div className="mb-3">
                <Alert variant="error">{saveError}</Alert>
              </div>
            )}

            <div className="rounded-md border border-jft-instrBorder bg-jft-instrBg px-4 py-3">
              <div className="flex items-start gap-2 text-sm font-medium leading-relaxed text-jft-ink">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-jft-sel" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                <p>Pilih jawaban yang paling tepat untuk pertanyaan berikut.</p>
              </div>
            </div>

            <section className="mt-3 overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm" aria-label={`Soal ${sectionLocalIndex + 1}`}>
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded-sm bg-jft-tag px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{currentSectionName}</span>
                  <span className="truncate text-xs font-medium text-slate-500">Question {sectionLocalIndex + 1} / {sectionQuestions.length}</span>
                </div>
                <span className={`hidden shrink-0 items-center gap-1 text-xs font-semibold sm:flex ${flagged.has(currentIndex) ? 'text-jft-warnDeep' : 'text-slate-400'}`}>
                  <svg className={`h-3.5 w-3.5 ${flagged.has(currentIndex) ? 'fill-jft-warnDeep' : 'fill-slate-400'}`} viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" /></svg>
                  {flagged.has(currentIndex) ? 'Ditandai ragu-ragu' : 'Belum ditandai'}
                </span>
              </div>

              <div className="px-4 py-5 sm:px-6 sm:py-6">
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 sm:px-6">
                  {currentQuestion.image ? (
                    <div className="mb-4 flex justify-center">
                      <img
                        src={currentQuestion.image?.startsWith('http') ? currentQuestion.image : `${ROOT_URL}/storage/${currentQuestion.image}`}
                        alt="Question Context"
                        className="max-h-[320px] w-full object-contain"
                      />
                    </div>
                  ) : null}
                  <p className="whitespace-pre-wrap font-jp text-lg font-medium leading-loose text-jft-ink sm:text-xl">{currentQuestion.question_text}</p>
                </div>

                {currentQuestion.audio && (
                  <audio controls src={currentQuestion.audio} className="mt-4 w-full" />
                )}

                <fieldset className="mt-5">
                  <legend className="sr-only">Pilihan jawaban</legend>
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt) => {
                      const sel = currentQuestion.selected_option_id === opt.id;
                      return (
                        <label key={opt.id} className={`flex cursor-pointer items-center gap-3 rounded-md border-2 px-3 py-3 focus-within:ring-2 focus-within:ring-jft-sel focus-within:ring-offset-2 sm:gap-4 sm:px-4 ${sel ? 'border-jft-sel bg-jft-selBg' : 'border-jft-optBorder bg-white hover:bg-slate-50'}`}>
                          <input type="radio" name={`q-${currentQuestion.id}`} className="sr-only" checked={sel} disabled={isExpired} onChange={() => handleSelectOption(opt.id)} />
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-sm border-2 text-sm font-bold ${sel ? 'border-jft-sel bg-jft-sel text-white' : 'border-jft-optBorder text-jft-ink'}`}>{opt.option}</span>
                          <span className="flex-1 font-jp text-base leading-relaxed sm:text-lg">{opt.option_text}</span>
                          {sel && <svg className="h-5 w-5 shrink-0 text-jft-sel" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {currentQuestion.selected_option_id != null && (
                  <button type="button" className="mt-3 text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-jft-ink" onClick={() => handleSelectOption(null as unknown as number)}>Hapus jawaban</button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="sticky bottom-0 z-20 border-t-2 border-slate-300 bg-white">
        <div className="mx-auto flex max-w-4xl flex-nowrap items-center justify-between gap-2 px-3 py-2.5 sm:px-5">
          <button type="button" className="btn-jft-outline shrink-0 whitespace-nowrap px-3 py-2 text-sm font-medium inline-flex items-center gap-1.5" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
            Sebelumnya
          </button>
          <div className="flex flex-nowrap items-center justify-end gap-2">
            <button type="button" aria-pressed={flagged.has(currentIndex)} onClick={() => toggleFlag(currentIndex)}
              className={`px-3 py-2 rounded-md text-sm font-medium border inline-flex items-center gap-1.5 whitespace-nowrap ${flagged.has(currentIndex) ? 'border-jft-warn bg-amber-50 text-jft-warnDeep' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}>
              <svg className={`h-4 w-4 ${flagged.has(currentIndex) ? 'fill-jft-warnDeep' : 'fill-slate-600'}`} viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" /></svg>
              {flagged.has(currentIndex) ? 'Ragu-ragu' : 'Tandai Ragu-ragu'}
            </button>
            {currentIndex < questions.length - 1 && (
              <button type="button" className="btn-jft px-3 py-2 text-sm font-medium inline-flex items-center gap-1.5" onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}>Selanjutnya<svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg></button>
            )}
            <button type="button" className="btn-jft px-3 py-2 text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap" onClick={() => setShowConfirm(true)}>
              {currentIndex < questions.length - 1 ? 'Akhiri Bagian' : 'Selesai'}<svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
            </button>
          </div>
        </div>
      </footer>

      {/* ── Confirm modal ── */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="px-2 py-2 text-center">
          <p className="mx-auto mb-5 inline-block rounded-lg bg-gray-100 px-6 py-2 text-base font-semibold text-gray-800">
            Confirm Finish Section
          </p>

          <p className="mb-4 text-xs text-gray-400">MiraiGo.com</p>

          <p className="mb-4 text-sm leading-relaxed text-gray-700">
            If you select <strong>Finish Section</strong>, you will not be able to return to the
            section.
          </p>
          <p className="mb-6 text-sm leading-relaxed text-gray-700">
            Are you sure you would like to finish this section?
          </p>

          <div className="space-y-3">
            <button
              onClick={handleConfirmFinishSection}
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

      {/* ── Final Confirm modal ── */}
      <Modal isOpen={showFinalConfirm} onClose={() => setShowFinalConfirm(false)}>
        <div className="px-2 py-2 text-center">
          <p className="mx-auto mb-4 inline-block rounded-lg bg-gray-100 px-6 py-2 text-base font-semibold text-gray-800">
            Confirm Finish Section
          </p>

          <div className="mb-4 flex justify-center">
            <svg className="h-10 w-10 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
          </div>

          <p className="mb-4 text-xs text-gray-400">MiraiGo.com</p>

          <p className="mb-6 text-sm leading-relaxed text-gray-700">
            If you select <strong>Finish Section</strong>, your answers will be submitted and you will not be able to return to this section.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleFinalFinishSection}
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#5e8b5d] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4d7a4c] disabled:opacity-60"
            >
              Finish Section
            </button>
            <button
              onClick={() => setShowFinalConfirm(false)}
              disabled={isSubmitting}
              className="w-full rounded-lg bg-gray-100 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <DraggableCalculator isOpen={showCalc} onClose={() => setShowCalc(false)} />
    </div>
  );
}