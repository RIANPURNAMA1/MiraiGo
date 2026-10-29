import type { ReactNode } from 'react';

export function LockedState({ title, hint, action }: { title: string; hint: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-400">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 9h8M8 15h8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{hint}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
