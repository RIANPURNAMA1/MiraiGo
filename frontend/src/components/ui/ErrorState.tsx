import type { ReactNode } from 'react';

export function ErrorState({ error, onRetry }: { error: any; onRetry: () => void }) {
  const msg = error?.message || error?.msg || 'Terjadi kesalahan.';
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-400">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-medium text-gray-900">Terjadi kesalahan</p>
      {msg && <p className="mt-1 max-w-sm text-sm text-gray-500">{msg}</p>}
      {onRetry && (
        <button onClick={onRetry} className="mt-4 px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800">
          Coba lagi
        </button>
      )}
    </div>
  );
}
