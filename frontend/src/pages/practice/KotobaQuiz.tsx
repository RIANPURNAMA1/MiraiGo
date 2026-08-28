import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import type { KotobaItem } from '@/types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDistractors(all: KotobaItem[], correct: KotobaItem): string[] {
  const pool = all.filter(k => k.id !== correct.id).map(k => k.meaning);
  return shuffle(pool).slice(0, 3);
}

const optionLetters = ['A', 'B', 'C', 'D'];

type AnswerState = 'unanswered' | 'correct' | 'wrong';

export default function KotobaQuiz() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get('topic');

  const [words, setWords] = useState<KotobaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/kotoba', { params: { category_id: categoryId } });
        const all: KotobaItem[] = res.data.data;
        const filtered = topicId ? all.filter(w => {
          const topics = (w as any).topics;
          return Array.isArray(topics) && topics.some((t: any) => t.id === Number(topicId));
        }) : all;
        setWords(shuffle(filtered.length > 0 ? filtered : all));
      } catch { /* empty */ } finally { setLoading(false); }
    }
    load();
  }, [categoryId, topicId]);

  const current = words[currentIdx];

  interface QuizOption {
    text: string;
    isCorrect: boolean;
  }

  const options = useMemo<QuizOption[]>(() => {
    if (!current) return [];
    const custom = (current.options ?? []).filter((o) => o.option_text.trim());
    if (custom.length >= 2) {
      return shuffle(custom.map((o) => ({ text: o.option_text, isCorrect: !!o.is_correct })));
    }
    const distractors = getDistractors(words, current);
    return shuffle([
      { text: current.meaning, isCorrect: true },
      ...distractors.map((d) => ({ text: d, isCorrect: false })),
    ]);
  }, [current, words]);

  const handleSelect = useCallback((idx: number) => {
    if (answerState !== 'unanswered' || !current) return;
    setSelectedIdx(idx);
    const isCorrect = options[idx]?.isCorrect ?? false;
    setAnswerState(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore(s => s + 1);
  }, [answerState, current, options]);

  const next = useCallback(() => {
    if (currentIdx + 1 >= words.length) {
      setFinished(true);
    } else {
      setCurrentIdx(i => i + 1);
      setSelectedIdx(null);
      setAnswerState('unanswered');
    }
  }, [currentIdx, words.length]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5e8b5d] border-t-transparent" />
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pb-12 pt-20 text-center">
        <p className="text-gray-500">Tidak ada kosakata untuk latihan ini.</p>
        <Link to={`/latihan-kotoba/${categoryId}`} className="text-sm font-medium text-[#5e8b5d] hover:underline">Kembali</Link>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / words.length) * 100);
    return (
      <div className="flex min-h-screen flex-col bg-[#edf1f5]">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f2f8f2]">
              <svg className="h-10 w-10 text-[#5e8b5d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Latihan Selesai!</h2>
            <p className="mt-2 text-sm text-gray-500">Skor kamu</p>
            <p className="mt-1 text-4xl font-bold text-[#5e8b5d]">{score}/{words.length}</p>
            <p className="mt-1 text-sm text-gray-400">{pct}% benar</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to={`/latihan-kotoba/${categoryId}`} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Kembali</Link>
              <button onClick={() => { setWords(shuffle(words)); setCurrentIdx(0); setSelectedIdx(null); setAnswerState('unanswered'); setScore(0); setFinished(false); }} className="rounded bg-[#5e8b5d] px-4 py-2 text-sm font-medium text-white hover:bg-[#4e7a4d]">Ulangi</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#edf1f5]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 border-b border-gray-200 md:px-6">
        <Link to={`/latihan-kotoba/${categoryId}`} className="flex shrink-0 items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Kembali
        </Link>
        <span className="shrink-0 text-sm font-semibold text-gray-900">{currentIdx + 1}/{words.length}</span>
        <span className="min-w-0 truncate text-sm font-medium text-[#5e8b5d]">{score} benar</span>
      </div>

      {/* Mobile: question navigator */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 md:hidden">
        <span className="shrink-0 text-[10px] font-semibold text-gray-400">Soal:</span>
        {words.map((_, idx) => {
          const isActive = idx === currentIdx;
          const isAnswered = idx < currentIdx || (idx === currentIdx && answerState !== 'unanswered');
          const clickable = idx <= currentIdx || idx === currentIdx + 1;
          return (
            <button
              key={idx}
              onClick={() => {
                if (idx <= currentIdx || idx === currentIdx + 1) {
                  setCurrentIdx(idx);
                  setSelectedIdx(null);
                  setAnswerState('unanswered');
                }
              }}
              className={`relative flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md px-1 text-xs font-bold transition-all hover:opacity-90 ${
                isActive
                  ? 'bg-[#5e8b5d] text-white'
                  : isAnswered
                    ? 'bg-[#474747] text-white'
                    : 'border border-gray-200 bg-[#eef2f7] text-gray-700'
              } ${clickable ? 'cursor-pointer' : 'opacity-60'}`}
            >
              {idx + 1}
              {isActive && (
                <svg className="absolute -right-[6px] h-[10px] w-[7px]" viewBox="0 0 10 14" fill="#5e8b5d">
                  <path d="M0 0L10 7L0 14z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-gray-200">
        <div className="h-full bg-[#5e8b5d] transition-all duration-300" style={{ width: `${((currentIdx + 1) / words.length) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar navigator (desktop only) */}
        <aside className="hidden md:block md:w-[100px] md:shrink-0 md:overflow-y-auto md:border-r md:border-gray-200 md:bg-white">
          <div className="flex flex-col items-center gap-2 py-4">
            {words.map((_, idx) => {
              const isActive = idx === currentIdx;
              const isAnswered = idx < currentIdx || (idx === currentIdx && answerState !== 'unanswered');
              let bgColor = '#5e8b5d';
              if (idx < currentIdx) bgColor = '#474747';

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (idx <= currentIdx || idx === currentIdx + 1) {
                      setCurrentIdx(idx);
                      setSelectedIdx(null);
                      setAnswerState('unanswered');
                    }
                  }}
                  className="relative flex h-[28px] w-[44px] items-center justify-center rounded text-[12px] font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: isActive ? bgColor : isAnswered ? '#474747' : '#d1d5db' }}
                >
                  {idx + 1}
                  {isActive && (
                    <svg className="absolute -right-[7px] h-[10px] w-[7px]" viewBox="0 0 10 14" fill={bgColor}><path d="M0 0L10 7L0 14z" /></svg>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          <div className="mx-auto w-full max-w-2xl">
            {/* Question card */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="rounded bg-[#e2f2fa] p-6 min-h-[130px] flex flex-col items-center justify-center text-center md:p-8 md:min-h-[160px]">
                  <p className="text-3xl font-bold text-gray-900 md:text-4xl">{current.japanese}</p>
                  {showFurigana && current.reading && (
                    <p className="mt-2 text-base text-gray-500 md:mt-3 md:text-lg">{current.reading}</p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2.5 px-4 pb-4 md:gap-3 md:px-6 md:pb-6">
                {options.map((opt, idx) => {
                  const isSelected = selectedIdx === idx;
                  let border = 'border-gray-300 bg-white hover:bg-gray-50';
                  let letterBg = 'bg-[#eef2f7] text-gray-600';
                  if (answerState !== 'unanswered') {
                    const isCorrect = opt.isCorrect;
                    if (isCorrect) { border = 'border-[#5e8b5d] bg-[#f2f8f2]'; letterBg = 'bg-[#5e8b5d] text-white'; }
                    else if (isSelected) { border = 'border-red-400 bg-red-50'; letterBg = 'bg-red-500 text-white'; }
                  } else if (isSelected) {
                    border = 'border-[#5e8b5d] bg-[#f2f8f2]';
                    letterBg = 'bg-[#5e8b5d] text-white';
                  }
                  return (
                    <button
                      key={`${idx}-${opt.text}`}
                      onClick={() => handleSelect(idx)}
                      disabled={answerState !== 'unanswered'}
                      className={`flex w-full items-center gap-3 rounded border p-3 text-left transition-colors disabled:cursor-default md:gap-4 ${border}`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${letterBg}`}>
                        {optionLetters[idx]}
                      </span>
                      <span className="text-sm text-gray-800 md:text-base">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback + Next */}
            {answerState !== 'unanswered' && (
              <div className={`mt-4 flex flex-col items-start justify-between gap-3 rounded-lg border p-4 text-sm md:flex-row md:items-center ${answerState === 'correct' ? 'border-[#5e8b5d] bg-[#f2f8f2] text-[#5e8b5d]' : 'border-red-300 bg-red-50 text-red-700'}`}>
                <span className="min-w-0 break-words">
                  {answerState === 'correct' ? (
                    <>Benar! <span className="text-gray-400">({current.japanese} = {current.meaning})</span></>
                  ) : (
                    <>Salah. Jawaban: <strong>{current.meaning}</strong> <span className="text-gray-400">({current.japanese})</span></>
                  )}
                </span>
                <button onClick={next} className="w-full shrink-0 rounded bg-[#1f2022] px-4 py-2 text-xs font-medium text-white hover:bg-[#333] md:w-auto">Selanjutnya</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer toggle furigana */}
      <div className="flex items-center justify-between gap-3 bg-[#1f2022] px-3 py-2.5 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFurigana(f => !f)}
            className={`flex h-6 w-14 items-center rounded-full p-1 transition-colors ${showFurigana ? 'bg-[#36c073]' : 'bg-gray-600'}`}
          >
            <div className={`flex h-4 w-4 items-center justify-center rounded-full bg-white transition-transform ${showFurigana ? 'translate-x-7' : 'translate-x-0'}`}>
              <span className={`text-[9px] font-bold ${showFurigana ? 'text-[#36c073]' : 'text-gray-500'}`}>F</span>
            </div>
          </button>
          <span className="text-xs font-medium text-gray-300">
            {showFurigana ? 'ふりがな ON' : 'FURIGANA OFF'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
          Latihan Kotoba
        </div>
      </div>
    </div>
  );
}
