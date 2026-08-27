interface Props {
  total: number;
  currentIndex: number;
  answeredIndexes: Set<number>;
  onNavigate: (index: number) => void;
}

export function QuestionNavigator({ total, currentIndex, answeredIndexes, onNavigate }: Props) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Navigasi Soal</p>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: total }, (_, i) => {
          const isCurrent = i === currentIndex;
          const isAnswered = answeredIndexes.has(i);

          let style = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
          if (isCurrent) style = 'bg-brand-600 text-white';
          else if (isAnswered) style = 'bg-emerald-100 text-emerald-700';

          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${style}`}
            >
              {isCurrent && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2">
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="currentColor">
                    <path d="M4 0L0 6h8L4 0z" />
                  </svg>
                </span>
              )}
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-brand-600" /> Soal saat ini
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-emerald-100" /> Sudah dijawab
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-gray-100" /> Belum dijawab
        </div>
      </div>
    </div>
  );
}
